// Export/Import Scenario Examples for Rocketlane SDK
import { RocketlaneClient } from '../src/index';
import { ExportFormat, ImportFormat, ExportOptions, ImportOptions } from '../src/utils/export-import';

const client = new RocketlaneClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://api.rocketlane.com'
});

// =============================================================================
// EXPORT SCENARIOS
// =============================================================================

async function exportScenarios() {
  console.log('=== Export Scenarios ===');

  // Scenario 1: Project Status Report Export
  async function exportProjectStatusReport(projectId: number) {
    // Get project data with related information
    const [project, tasks, team, timeEntries] = await Promise.all([
      client.projects.get(projectId),
      client.tasks.getAllTasks({ projectId }),
      client.users.getAllUsers({ projectId }),
      client.timeTracking.getAllTimeEntries({ projectId })
    ]);

    // Export project overview
    const projectOverview = await client.export.data([{
      projectName: project.projectName,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      teamSize: team.length,
      totalHoursLogged: timeEntries.reduce((sum, entry) => sum + entry.timeInMinutes, 0) / 60
    }], {
      format: 'xlsx',
      filename: `project-${projectId}-overview.xlsx`,
      sheetName: 'Project Overview'
    });

    // Export detailed task breakdown
    const taskBreakdown = await client.export.tasks(
      { projectId },
      {
        format: 'xlsx',
        filename: `project-${projectId}-tasks.xlsx`,
        fields: [
          'taskId', 'taskName', 'status', 'priority', 
          'assigneeId', 'dueDate', 'effortInMinutes'
        ],
        sheetName: 'Task Details',
        dateFormat: 'YYYY-MM-DD'
      }
    );

    // Export team workload analysis
    const teamWorkload = await client.export.data(
      team.map(member => ({
        memberId: member.userId,
        memberName: `${member.firstName} ${member.lastName}`,
        email: member.email,
        assignedTasks: tasks.filter(t => t.assigneeId === member.userId).length,
        completedTasks: tasks.filter(t => t.assigneeId === member.userId && t.status === 'completed').length,
        totalEffort: tasks
          .filter(t => t.assigneeId === member.userId)
          .reduce((sum, t) => sum + (t.effortInMinutes || 0), 0)
      })),
      {
        format: 'csv',
        filename: `project-${projectId}-team-workload.csv`,
        fields: ['memberId', 'memberName', 'email', 'assignedTasks', 'completedTasks', 'totalEffort']
      }
    );

    return {
      projectOverview: projectOverview.downloadUrl,
      taskBreakdown: taskBreakdown.downloadUrl,
      teamWorkload: teamWorkload.downloadUrl
    };
  }

  // Scenario 2: Time Tracking Export for Billing
  async function exportBillingData(clientId: number, startDate: string, endDate: string) {
    // Get time entries for the billing period
    const timeEntries = await client.timeTracking.getAllTimeEntries({
      clientId,
      dateFrom: startDate,
      dateTo: endDate
    });

    // Group by project and user
    const billingData = timeEntries.map(entry => ({
      date: entry.date,
      projectName: entry.projectName,
      taskName: entry.taskName,
      userName: entry.userName,
      timeInHours: entry.timeInMinutes / 60,
      billableHours: entry.billable ? entry.timeInMinutes / 60 : 0,
      nonBillableHours: !entry.billable ? entry.timeInMinutes / 60 : 0,
      hourlyRate: entry.hourlyRate || 0,
      totalAmount: entry.billable ? (entry.timeInMinutes / 60) * (entry.hourlyRate || 0) : 0
    }));

    // Export detailed billing report
    const detailedReport = await client.export.data(billingData, {
      format: 'xlsx',
      filename: `billing-report-${clientId}-${startDate}-to-${endDate}.xlsx`,
      sheetName: 'Billing Details',
      dateFormat: 'YYYY-MM-DD'
    });

    // Export summary for invoice
    const summary = billingData.reduce((acc, entry) => {
      const key = `${entry.projectName}-${entry.userName}`;
      if (!acc[key]) {
        acc[key] = {
          project: entry.projectName,
          consultant: entry.userName,
          totalHours: 0,
          billableHours: 0,
          totalAmount: 0
        };
      }
      acc[key].totalHours += entry.timeInHours;
      acc[key].billableHours += entry.billableHours;
      acc[key].totalAmount += entry.totalAmount;
      return acc;
    }, {} as any);

    const summaryReport = await client.export.data(Object.values(summary), {
      format: 'pdf',
      filename: `billing-summary-${clientId}-${startDate}-to-${endDate}.pdf`
    });

    return {
      detailedReport: detailedReport.downloadUrl,
      summaryReport: summaryReport.downloadUrl,
      totalBillableHours: billingData.reduce((sum, entry) => sum + entry.billableHours, 0),
      totalAmount: billingData.reduce((sum, entry) => sum + entry.totalAmount, 0)
    };
  }

  // Scenario 3: Performance Analytics Export
  async function exportPerformanceAnalytics(teamIds: number[], period: 'month' | 'quarter' | 'year') {
    const startDate = new Date();
    const months = period === 'month' ? 1 : period === 'quarter' ? 3 : 12;
    startDate.setMonth(startDate.getMonth() - months);

    // Collect performance data
    const performanceData = [];
    
    for (const userId of teamIds) {
      const [user, tasks, timeEntries] = await Promise.all([
        client.users.get(userId),
        client.tasks.getAllTasks({
          assigneeId: userId,
          completedAfter: startDate.toISOString(),
          completedBefore: new Date().toISOString()
        }),
        client.timeTracking.getAllTimeEntries({
          userId,
          dateFrom: startDate.toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0]
        })
      ]);

      const completedTasks = tasks.filter(t => t.status === 'completed');
      const totalTimeLogged = timeEntries.reduce((sum, e) => sum + e.timeInMinutes, 0);
      
      performanceData.push({
        userId: user.userId,
        userName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        tasksAssigned: tasks.length,
        tasksCompleted: completedTasks.length,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
        avgTaskEffort: completedTasks.length > 0 
          ? completedTasks.reduce((sum, t) => sum + (t.effortInMinutes || 0), 0) / completedTasks.length
          : 0,
        totalTimeLogged: totalTimeLogged / 60, // Convert to hours
        productivity: totalTimeLogged > 0 ? (completedTasks.length / totalTimeLogged * 1000) : 0,
        avgPriority: completedTasks.length > 0
          ? completedTasks.reduce((sum, t) => sum + (t.priority || 0), 0) / completedTasks.length
          : 0
      });
    }

    // Export comprehensive performance report
    const performanceReport = await client.export.data(performanceData, {
      format: 'xlsx',
      filename: `performance-analytics-${period}-${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName: 'Performance Metrics'
    });

    // Export executive summary
    const executiveSummary = await client.export.data([{
      period,
      teamSize: teamIds.length,
      totalTasksCompleted: performanceData.reduce((sum, p) => sum + p.tasksCompleted, 0),
      avgCompletionRate: performanceData.reduce((sum, p) => sum + p.completionRate, 0) / performanceData.length,
      totalHoursLogged: performanceData.reduce((sum, p) => sum + p.totalTimeLogged, 0),
      avgProductivity: performanceData.reduce((sum, p) => sum + p.productivity, 0) / performanceData.length,
      topPerformer: performanceData.reduce((best, current) => 
        current.productivity > best.productivity ? current : best
      ).userName
    }], {
      format: 'pdf',
      filename: `executive-summary-${period}-${new Date().toISOString().split('T')[0]}.pdf`
    });

    return {
      performanceReport: performanceReport.downloadUrl,
      executiveSummary: executiveSummary.downloadUrl,
      metrics: {
        totalTasksCompleted: performanceData.reduce((sum, p) => sum + p.tasksCompleted, 0),
        avgCompletionRate: performanceData.reduce((sum, p) => sum + p.completionRate, 0) / performanceData.length,
        totalHoursLogged: performanceData.reduce((sum, p) => sum + p.totalTimeLogged, 0)
      }
    };
  }

  // Execute export scenarios
  const projectReport = await exportProjectStatusReport(123456);
  const billingData = await exportBillingData(789, '2024-01-01', '2024-01-31');
  const performanceAnalytics = await exportPerformanceAnalytics([101, 102, 103], 'month');

  return {
    projectReport,
    billingData,
    performanceAnalytics
  };
}

// =============================================================================
// IMPORT SCENARIOS
// =============================================================================

async function importScenarios() {
  console.log('=== Import Scenarios ===');

  // Scenario 1: Bulk Task Import from CSV
  async function bulkTaskImport() {
    const csvContent = `Task Name,Project ID,Assignee ID,Priority,Due Date,Effort (Hours),Description
"Implement user authentication",123456,101,4,"2024-06-01",8,"Add login and registration functionality"
"Design dashboard mockups",123456,102,3,"2024-05-15",4,"Create wireframes and visual designs"
"Write API documentation",123456,103,2,"2024-05-30",6,"Document all REST endpoints"
"Setup CI/CD pipeline",123456,101,4,"2024-05-20",12,"Configure automated testing and deployment"
"Performance optimization",123456,104,3,"2024-06-10",10,"Optimize database queries and caching"`;

    const importResult = await client.import.tasks(csvContent, 'csv', {
      mapping: {
        'Task Name': 'taskName',
        'Project ID': 'projectId',
        'Assignee ID': 'assigneeId',
        'Priority': 'priority',
        'Due Date': 'dueDate',
        'Effort (Hours)': 'effortInMinutes', // Will need conversion
        'Description': 'description'
      },
      validateFirst: true,
      onError: 'collect',
      batchSize: 3,
      dryRun: false
    });

    return {
      totalProcessed: importResult.total,
      imported: importResult.imported.length,
      errors: importResult.errors.length,
      errorDetails: importResult.errors
    };
  }

  // Scenario 2: Project Template Import from Excel
  async function projectTemplateImport() {
    // Simulated Excel content (would normally be read from file)
    const templateData = [
      { 
        taskName: 'Project Kickoff',
        phase: 'Planning',
        estimatedHours: 4,
        dependencies: null,
        role: 'Project Manager'
      },
      {
        taskName: 'Requirements Gathering',
        phase: 'Planning',
        estimatedHours: 16,
        dependencies: 'Project Kickoff',
        role: 'Business Analyst'
      },
      {
        taskName: 'Technical Architecture',
        phase: 'Design',
        estimatedHours: 24,
        dependencies: 'Requirements Gathering',
        role: 'Technical Lead'
      },
      {
        taskName: 'Database Design',
        phase: 'Design',
        estimatedHours: 12,
        dependencies: 'Technical Architecture',
        role: 'Database Developer'
      },
      {
        taskName: 'Frontend Development',
        phase: 'Development',
        estimatedHours: 80,
        dependencies: 'Database Design',
        role: 'Frontend Developer'
      }
    ];

    // First, create the project
    const project = await client.projects.create({
      projectName: 'New Project from Template',
      description: 'Project created from imported template',
      startDate: new Date().toISOString(),
      status: 'planning'
    });

    // Import tasks with project context
    const importResult = await client.import.data(
      JSON.stringify(templateData),
      'json',
      async (taskData) => {
        return client.tasks.create({
          ...taskData,
          projectId: project.projectId,
          effortInMinutes: taskData.estimatedHours * 60,
          status: 'ready_for_development'
        });
      },
      {
        validateFirst: true,
        onError: 'collect',
        batchSize: 2
      }
    );

    return {
      projectId: project.projectId,
      projectName: project.projectName,
      importResult: {
        totalTasks: importResult.total,
        imported: importResult.imported.length,
        errors: importResult.errors.length
      }
    };
  }

  // Scenario 3: User Data Migration
  async function userDataMigration() {
    const userData = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'developer',
        department: 'Engineering',
        startDate: '2024-01-15',
        skills: 'JavaScript,React,Node.js'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'designer',
        department: 'Design',
        startDate: '2024-02-01',
        skills: 'Figma,Adobe Creative Suite,UI/UX'
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        role: 'project_manager',
        department: 'Operations',
        startDate: '2024-01-10',
        skills: 'Agile,Scrum,Risk Management'
      }
    ];

    // Validate user data first
    const validationResult = await client.import.validate(
      JSON.stringify(userData),
      'json',
      {
        firstName: { required: true, type: 'string' },
        lastName: { required: true, type: 'string' },
        email: { required: true, type: 'email' },
        role: { required: true, type: 'string' },
        startDate: { required: true, type: 'date' }
      }
    );

    if (!validationResult.valid) {
      console.error('Validation failed:', validationResult.errors);
      return { success: false, errors: validationResult.errors };
    }

    // Proceed with import
    const importResult = await client.import.users(
      JSON.stringify(userData),
      'json',
      {
        validateFirst: true,
        onError: 'skip',
        batchSize: 1 // Import users one by one to handle conflicts
      }
    );

    return {
      success: importResult.success,
      imported: importResult.imported.length,
      errors: importResult.errors.length,
      skipped: importResult.skipped,
      importedUsers: importResult.imported.map(user => ({
        id: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }))
    };
  }

  // Scenario 4: Time Entry Bulk Import
  async function timeEntryBulkImport() {
    const timeEntryData = `Date,User ID,Project ID,Task ID,Hours,Description,Billable
"2024-01-15",101,123456,1001,4,"Development work on authentication","true"
"2024-01-15",102,123456,1002,3,"Design review and iterations","true"
"2024-01-15",103,123456,1003,2,"Documentation updates","false"
"2024-01-16",101,123456,1001,6,"Continued authentication work","true"
"2024-01-16",104,123456,1004,5,"Database optimization","true"
"2024-01-16",102,123456,1005,4,"UI component development","true"`;

    const importResult = await client.import.data(
      timeEntryData,
      'csv',
      async (entryData) => {
        return client.timeTracking.create({
          date: entryData.Date,
          userId: parseInt(entryData['User ID']),
          projectId: parseInt(entryData['Project ID']),
          taskId: parseInt(entryData['Task ID']),
          timeInMinutes: parseFloat(entryData.Hours) * 60,
          description: entryData.Description,
          billable: entryData.Billable === 'true'
        });
      },
      {
        validateFirst: true,
        onError: 'collect',
        batchSize: 5,
        skipRows: 1 // Skip header row
      }
    );

    return {
      totalEntries: importResult.total,
      imported: importResult.imported.length,
      errors: importResult.errors.length,
      totalHoursImported: importResult.imported.reduce(
        (sum, entry) => sum + (entry.timeInMinutes / 60), 
        0
      )
    };
  }

  // Execute import scenarios
  const taskImport = await bulkTaskImport();
  const templateImport = await projectTemplateImport();
  const userMigration = await userDataMigration();
  const timeEntryImport = await timeEntryBulkImport();

  return {
    taskImport,
    templateImport,
    userMigration,
    timeEntryImport
  };
}

// =============================================================================
// DATA TRANSFORMATION SCENARIOS
// =============================================================================

async function dataTransformationScenarios() {
  console.log('=== Data Transformation Scenarios ===');

  // Scenario 1: Export-Transform-Import Pipeline
  async function exportTransformImportPipeline() {
    // Step 1: Export existing data
    const existingTasks = await client.export.tasks(
      { projectId: 123456, status: 'completed' },
      {
        format: 'json',
        filename: 'completed-tasks-export.json'
      }
    );

    // Step 2: Transform the data (simulated)
    const transformedData = existingTasks.data.map((task: any) => ({
      ...task,
      taskName: `[ARCHIVED] ${task.taskName}`,
      status: 'archived',
      archivedDate: new Date().toISOString(),
      originalProjectId: task.projectId,
      projectId: 789012 // Move to archive project
    }));

    // Step 3: Import transformed data
    const importResult = await client.import.data(
      JSON.stringify(transformedData),
      'json',
      async (taskData) => client.tasks.create(taskData),
      {
        validateFirst: true,
        onError: 'collect',
        batchSize: 10
      }
    );

    return {
      originalCount: existingTasks.recordCount,
      transformedCount: transformedData.length,
      importedCount: importResult.imported.length,
      errors: importResult.errors.length
    };
  }

  // Scenario 2: Cross-Platform Data Migration
  async function crossPlatformMigration() {
    // Simulated external system data format
    const externalData = [
      {
        external_id: 'EXT-001',
        title: 'External Task 1',
        assigned_to: 'john.doe@example.com',
        priority_level: 'High',
        estimated_time: '8h',
        due_date: '2024-06-01T10:00:00Z'
      },
      {
        external_id: 'EXT-002',
        title: 'External Task 2',
        assigned_to: 'jane.smith@example.com',
        priority_level: 'Medium',
        estimated_time: '4h',
        due_date: '2024-05-25T15:00:00Z'
      }
    ];

    // Transform to Rocketlane format
    const transformedForRocketlane = await Promise.all(
      externalData.map(async (item) => {
        // Look up user by email
        const users = await client.users.getAllUsers({ email: item.assigned_to });
        const assigneeId = users.length > 0 ? users[0].userId : null;

        return {
          taskName: item.title,
          assigneeId,
          priority: item.priority_level === 'High' ? 4 : item.priority_level === 'Medium' ? 3 : 2,
          effortInMinutes: parseInt(item.estimated_time) * 60,
          dueDate: item.due_date,
          externalId: item.external_id,
          status: 'ready_for_development'
        };
      })
    );

    // Import with error handling
    const importResult = await client.import.data(
      JSON.stringify(transformedForRocketlane),
      'json',
      async (taskData) => client.tasks.create(taskData),
      {
        validateFirst: true,
        onError: 'collect',
        batchSize: 5
      }
    );

    return {
      externalRecords: externalData.length,
      transformedRecords: transformedForRocketlane.length,
      imported: importResult.imported.length,
      errors: importResult.errors
    };
  }

  // Execute transformation scenarios
  const pipeline = await exportTransformImportPipeline();
  const migration = await crossPlatformMigration();

  return {
    pipeline,
    migration
  };
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

export async function runExportImportScenarios() {
  try {
    console.log('Running export/import scenarios...\n');

    const exportResults = await exportScenarios();
    console.log('Export Results:', exportResults, '\n');

    const importResults = await importScenarios();
    console.log('Import Results:', importResults, '\n');

    const transformationResults = await dataTransformationScenarios();
    console.log('Transformation Results:', transformationResults, '\n');

  } catch (error) {
    console.error('Error running export/import scenarios:', error);
  }
}

// Export individual scenario functions
export {
  exportScenarios,
  importScenarios,
  dataTransformationScenarios
};