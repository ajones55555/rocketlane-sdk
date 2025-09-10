// Advanced Features Examples for Rocketlane SDK
import { RocketlaneClient } from '../src/index';

// Initialize the client
const client = new RocketlaneClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://api.rocketlane.com'
});

// =============================================================================
// 1. ADVANCED QUERY CAPABILITIES
// =============================================================================

async function advancedQueryExamples() {
  console.log('=== Advanced Query Examples ===');

  // SQL-like queries using template literals
  const criticalTasks = await client.tasks.querySQL(sql`
    SELECT taskName, assigneeId, dueDate, priority 
    FROM tasks 
    WHERE projectId = ${123456} 
    AND priority > ${3} 
    AND dueDate < ${'2024-12-31'}
    ORDER BY dueDate ASC
    LIMIT 10
  `);

  console.log('Critical tasks:', criticalTasks);

  // Query builder pattern - fluent interface
  const overdueHighPriorityTasks = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereEquals('projectId', 123456)
      .whereGreaterThan('priority', 3)
      .whereLessThan('dueDate', new Date().toISOString())
      .whereNotEquals('status', 'completed')
      .orderBy('dueDate', 'asc')
      .orderBy('priority', 'desc')
      .limit(25)
      .select(['taskId', 'taskName', 'assigneeId', 'dueDate', 'priority'])
  );

  console.log('Overdue high priority tasks:', overdueHighPriorityTasks);

  // Complex filtering with multiple conditions
  const teamWorkload = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereIn('assigneeId', [101, 102, 103, 104])
      .whereBetween('dueDate', '2024-01-01', '2024-12-31')
      .whereNotIn('status', ['completed', 'cancelled'])
      .whereContains('taskName', 'development')
      .select({
        taskId: true,
        taskName: true,
        assigneeId: true,
        effortInMinutes: true,
        dueDate: true,
        status: true
      })
      .orderBy('assigneeId', 'asc')
      .orderBy('dueDate', 'asc')
  );

  console.log('Team workload analysis:', teamWorkload);

  // GraphQL-style field selection with nested relationships
  const tasksWithDetails = await client.tasks.listWithFields(
    { projectId: 123456 },
    {
      taskId: true,
      taskName: true,
      description: true,
      dueDate: true,
      assignees: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true
      },
      project: {
        projectId: true,
        projectName: true,
        status: true
      },
      customFields: {
        fieldId: true,
        fieldName: true,
        value: true
      }
    }
  );

  console.log('Tasks with detailed relationships:', tasksWithDetails);

  // Predefined query methods
  const highPriorityTasks = await client.tasks.highPriority().limit(20).execute();
  const overdueTasks = await client.tasks.overdue().execute();
  const upcomingTasks = await client.tasks
    .dueBetween('2024-01-01', '2024-01-31')
    .assignedTo([101, 102])
    .execute();

  console.log('High priority tasks:', highPriorityTasks);
  console.log('Overdue tasks:', overdueTasks);
  console.log('Upcoming assigned tasks:', upcomingTasks);

  // Built-in analysis queries
  const criticalTasksAnalysis = await client.tasks.findCriticalTasks(123456);
  const teamWorkloadAnalysis = await client.tasks.findTeamWorkload(
    [101, 102, 103], 
    '2024-01-01', 
    '2024-03-31'
  );

  console.log('Critical tasks analysis:', criticalTasksAnalysis);
  console.log('Team workload analysis:', teamWorkloadAnalysis);
}

// =============================================================================
// 2. EXPORT/IMPORT UTILITIES
// =============================================================================

async function exportImportExamples() {
  console.log('=== Export/Import Examples ===');

  // CSV Export with custom options
  const csvExport = await client.export.tasks(
    { projectId: 123456, status: 'active' },
    {
      format: 'csv',
      filename: 'project-tasks.csv',
      fields: ['taskName', 'assigneeId', 'dueDate', 'priority', 'status'],
      includeHeaders: true,
      delimiter: ',',
      dateFormat: 'YYYY-MM-DD',
      encoding: 'utf-8'
    }
  );

  console.log('CSV export result:', csvExport);
  console.log('Download URL:', csvExport.downloadUrl);

  // Excel Export with multiple sheets
  const excelExport = await client.export.projects(
    { status: 'active' },
    {
      format: 'xlsx',
      filename: 'active-projects.xlsx',
      sheetName: 'Active Projects',
      fields: ['projectName', 'status', 'startDate', 'endDate', 'budget'],
      dateFormat: 'YYYY-MM-DD'
    }
  );

  console.log('Excel export result:', excelExport);

  // PDF Export with custom formatting
  const pdfExport = await client.export.users(
    { role: 'developer' },
    {
      format: 'pdf',
      filename: 'developer-team.pdf',
      fields: ['firstName', 'lastName', 'email', 'role', 'joinDate']
    }
  );

  console.log('PDF export result:', pdfExport);

  // JSON Export with metadata
  const jsonExport = await client.export.timeEntries(
    { 
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      userId: 101
    },
    {
      format: 'json',
      filename: 'time-entries-jan-2024.json',
      compress: false
    }
  );

  console.log('JSON export result:', jsonExport);

  // XML Export
  const xmlExport = await client.export.data(
    [
      { id: 1, name: 'Task 1', status: 'active' },
      { id: 2, name: 'Task 2', status: 'completed' }
    ],
    {
      format: 'xml',
      filename: 'custom-data.xml',
      encoding: 'utf-8'
    }
  );

  console.log('XML export result:', xmlExport);

  // Import with validation and error handling
  const csvContent = `Task Name,Assignee ID,Due Date,Priority
"Implement user authentication",101,"2024-06-01",4
"Design dashboard mockups",102,"2024-05-15",3
"Write API documentation",103,"2024-05-30",2`;

  const importResult = await client.import.tasks(csvContent, 'csv', {
    mapping: {
      'Task Name': 'taskName',
      'Assignee ID': 'assigneeId',
      'Due Date': 'dueDate',
      'Priority': 'priority'
    },
    validateFirst: true,
    onError: 'collect', // Continue importing, collect all errors
    batchSize: 5,
    dryRun: false
  });

  console.log('Import result:', importResult);
  console.log('Imported items:', importResult.imported.length);
  console.log('Errors:', importResult.errors);

  // Excel Import
  const excelBuffer = new ArrayBuffer(1024); // Your Excel file buffer
  const excelImportResult = await client.import.data(
    excelBuffer,
    'xlsx',
    async (item) => client.projects.create(item),
    {
      mapping: {
        'Project Name': 'projectName',
        'Start Date': 'startDate',
        'End Date': 'endDate'
      },
      skipRows: 1, // Skip header row
      maxRows: 100,
      validateFirst: true
    }
  );

  console.log('Excel import result:', excelImportResult);

  // Validation without import (dry run)
  const validationResult = await client.import.validate(
    csvContent,
    'csv',
    {
      taskName: { required: true, type: 'string' },
      assigneeId: { required: true, type: 'number' },
      dueDate: { required: true, type: 'date' },
      priority: { required: false, type: 'number' }
    },
    {
      mapping: {
        'Task Name': 'taskName',
        'Assignee ID': 'assigneeId',
        'Due Date': 'dueDate',
        'Priority': 'priority'
      }
    }
  );

  console.log('Validation result:', validationResult);
  console.log('Data preview:', validationResult.preview);
}

// =============================================================================
// 3. RELATIONSHIP NAVIGATION
// =============================================================================

async function relationshipNavigationExamples() {
  console.log('=== Relationship Navigation Examples ===');

  // Get a navigable task with relationship capabilities
  const navigableTask = await client.tasks.getNavigable(789);

  console.log('Task details:', {
    id: navigableTask.taskId,
    name: navigableTask.taskName,
    status: navigableTask.status
  });

  // Navigate to related project
  const project = await navigableTask.getProject();
  console.log('Related project:', {
    id: project.projectId,
    name: project.projectName,
    status: project.status
  });

  // Get all assignees with their details
  const assignees = await navigableTask.getAssignees();
  console.log('Task assignees:', assignees.map(user => ({
    id: user.userId,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email
  })));

  // Get related tasks (siblings in same project/phase)
  const siblingTasks = await navigableTask.getSiblings();
  console.log('Related tasks:', siblingTasks.map(task => ({
    id: task.taskId,
    name: task.taskName,
    status: task.status
  })));

  // Get task dependencies
  const dependencies = await navigableTask.getDependencies();
  console.log('Task dependencies:', dependencies);

  // Get time tracking data
  const timeEntries = await navigableTask.getTimeEntries();
  const totalTimeSpent = await navigableTask.getTotalTimeSpent();
  console.log('Time entries:', timeEntries.length);
  console.log('Total time spent (minutes):', totalTimeSpent);

  // Get custom field values
  const customFields = await navigableTask.getCustomFields();
  console.log('Custom fields:', customFields);

  // Navigate from project to tasks
  const navigableProject = await project.getNavigable();
  const projectTasks = await navigableProject.getTasks();
  const activeTasks = await navigableProject.getActiveTasks();
  const completedTasks = await navigableProject.getCompletedTasks();

  console.log('Project task counts:', {
    total: projectTasks.length,
    active: activeTasks.length,
    completed: completedTasks.length
  });

  // Get project team members
  const projectTeam = await navigableProject.getTeamMembers();
  console.log('Project team:', projectTeam.map(user => ({
    id: user.userId,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role
  })));

  // Navigate from user to their tasks
  if (assignees.length > 0) {
    const user = assignees[0];
    const userTasks = await user.getTasks();
    const userActiveTasks = await user.getActiveTasks();
    const userOverdueTasks = await user.getOverdueTasks();

    console.log('User task summary:', {
      total: userTasks.length,
      active: userActiveTasks.length,
      overdue: userOverdueTasks.length
    });

    // Get user's projects
    const userProjects = await user.getProjects();
    console.log('User projects:', userProjects.map(proj => ({
      id: proj.projectId,
      name: proj.projectName
    })));
  }

  // Bulk navigation operations
  const navigableTasks = await client.tasks.listNavigable({
    projectId: 123456,
    status: 'active',
    pageSize: 10
  });

  console.log('Navigable tasks loaded:', navigableTasks.length);

  // Perform bulk operations on navigable objects
  const taskProjects = await Promise.all(
    navigableTasks.map(async (task) => ({
      taskId: task.taskId,
      taskName: task.taskName,
      project: await task.getProject()
    }))
  );

  console.log('Tasks with project details:', taskProjects);
}

// =============================================================================
// 4. ADVANCED PAGINATION
// =============================================================================

async function advancedPaginationExamples() {
  console.log('=== Advanced Pagination Examples ===');

  // Enhanced pagination with helper methods
  const firstPage = await client.tasks.listWithPagination({
    projectId: 123456,
    pageSize: 20
  });

  console.log('First page:', {
    itemCount: firstPage.data.length,
    hasMore: firstPage.pagination.hasMore,
    totalCount: firstPage.pagination.totalCount
  });

  // Method chaining for pagination
  const secondPage = await firstPage.getNextPage();
  if (secondPage) {
    console.log('Second page:', secondPage.data.length, 'items');

    const thirdPage = await secondPage.getNextPage();
    if (thirdPage) {
      console.log('Third page:', thirdPage.data.length, 'items');
    }
  }

  // Get all remaining items from current page onwards
  const allRemainingItems = await firstPage.getAllRemaining();
  console.log('All remaining items:', allRemainingItems.length);

  // Async iteration through pages
  console.log('Iterating through pages:');
  for await (const page of firstPage.iterateRemainingPages()) {
    console.log(`Page with ${page.data.length} items`);
    // Process each page as it's loaded
  }

  // Async iteration through individual items
  console.log('Processing items one by one:');
  let itemCount = 0;
  for await (const item of firstPage.iterateRemainingItems()) {
    console.log(`Processing task: ${item.taskName}`);
    itemCount++;
    if (itemCount >= 5) break; // Demo: process first 5 items only
  }

  // Traditional pagination helpers still available
  const allTasks = await client.tasks.getAllTasks({
    projectId: 123456,
    status: 'active'
  });
  console.log('All active tasks:', allTasks.length);

  // Generator-based iteration for memory efficiency
  console.log('Memory-efficient iteration:');
  for await (const page of client.tasks.iterateTaskPages({ projectId: 123456 })) {
    console.log(`Processing page with ${page.data.length} tasks`);
    // Process page data without loading everything into memory
  }

  // Individual item iteration
  for await (const task of client.tasks.iterateTasks({ status: 'active' })) {
    console.log(`Processing task: ${task.taskName}`);
    // Each task is yielded as it's loaded, very memory efficient
    break; // Demo: just show first task
  }
}

// =============================================================================
// 5. COMPLEX WORKFLOW EXAMPLES
// =============================================================================

async function complexWorkflowExamples() {
  console.log('=== Complex Workflow Examples ===');

  // Workflow 1: Project Health Analysis
  async function analyzeProjectHealth(projectId: number) {
    const project = await client.projects.get(projectId);
    const navigableProject = await client.projects.getNavigable(projectId);
    
    // Get all project data
    const [tasks, teamMembers, timeEntries] = await Promise.all([
      navigableProject.getTasks(),
      navigableProject.getTeamMembers(),
      navigableProject.getTimeEntries()
    ]);

    // Analyze task distribution
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    );

    // Calculate team workload
    const workloadByMember = await Promise.all(
      teamMembers.map(async (member) => ({
        member: `${member.firstName} ${member.lastName}`,
        activeTasks: await member.getActiveTasks(),
        totalEffort: tasks
          .filter(task => task.assigneeId === member.userId)
          .reduce((sum, task) => sum + (task.effortInMinutes || 0), 0)
      }))
    );

    return {
      project: {
        id: project.projectId,
        name: project.projectName,
        status: project.status
      },
      metrics: {
        totalTasks: tasks.length,
        tasksByStatus,
        overdueCount: overdueTasks.length,
        teamSize: teamMembers.length,
        totalTimeSpent: timeEntries.reduce((sum, entry) => sum + entry.timeInMinutes, 0)
      },
      workloadDistribution: workloadByMember,
      riskFactors: {
        highOverduePercentage: overdueTasks.length / tasks.length > 0.2,
        unevenWorkload: Math.max(...workloadByMember.map(w => w.activeTasks.length)) > 
                       Math.min(...workloadByMember.map(w => w.activeTasks.length)) * 3
      }
    };
  }

  // Workflow 2: Bulk Task Migration
  async function migrateTasks(fromProjectId: number, toProjectId: number, criteria: any) {
    // Query tasks to migrate
    const tasksToMigrate = await client.tasks.query(
      client.tasks.queryBuilder()
        .whereEquals('projectId', fromProjectId)
        .whereEquals('status', criteria.status)
        .whereBetween('createdDate', criteria.dateFrom, criteria.dateTo)
    );

    console.log(`Found ${tasksToMigrate.data.length} tasks to migrate`);

    // Export current tasks for backup
    const backupExport = await client.export.data(tasksToMigrate.data, {
      format: 'json',
      filename: `task-migration-backup-${Date.now()}.json`
    });

    console.log('Backup created:', backupExport.downloadUrl);

    // Migrate tasks in batches
    const batchSize = 10;
    const migratedTasks = [];
    const errors = [];

    for (let i = 0; i < tasksToMigrate.data.length; i += batchSize) {
      const batch = tasksToMigrate.data.slice(i, i + batchSize);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(async (task) => {
            const newTask = await client.tasks.create({
              ...task,
              projectId: toProjectId,
              taskName: `[MIGRATED] ${task.taskName}`
            });
            
            // Archive original task
            await client.tasks.archive(task.taskId);
            
            return newTask;
          })
        );

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            migratedTasks.push(result.value);
          } else {
            errors.push({
              originalTask: batch[index],
              error: result.reason
            });
          }
        });

        console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}`);
      } catch (error) {
        console.error(`Batch migration failed:`, error);
        errors.push({ batch, error });
      }
    }

    return {
      totalProcessed: tasksToMigrate.data.length,
      successfulMigrations: migratedTasks.length,
      errors: errors.length,
      backupUrl: backupExport.downloadUrl,
      migratedTaskIds: migratedTasks.map(t => t.taskId)
    };
  }

  // Workflow 3: Team Performance Analytics
  async function generateTeamPerformanceReport(teamIds: number[], period: string) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (period === 'quarter' ? 3 : 1));

    const teamMembers = await Promise.all(
      teamIds.map(id => client.users.getNavigable(id))
    );

    const performanceData = await Promise.all(
      teamMembers.map(async (member) => {
        const [tasks, timeEntries, projects] = await Promise.all([
          member.getTasks({
            completedAfter: startDate.toISOString(),
            completedBefore: new Date().toISOString()
          }),
          member.getTimeEntries({
            dateFrom: startDate.toISOString().split('T')[0],
            dateTo: new Date().toISOString().split('T')[0]
          }),
          member.getProjects()
        ]);

        const completedTasks = tasks.filter(t => t.status === 'completed');
        const avgTaskEffort = completedTasks.reduce((sum, t) => sum + (t.effortInMinutes || 0), 0) / completedTasks.length;
        const totalTimeLogged = timeEntries.reduce((sum, e) => sum + e.timeInMinutes, 0);

        return {
          member: {
            id: member.userId,
            name: `${member.firstName} ${member.lastName}`,
            email: member.email
          },
          metrics: {
            tasksCompleted: completedTasks.length,
            avgTaskEffort: avgTaskEffort || 0,
            totalTimeLogged,
            activeProjects: projects.length,
            productivity: totalTimeLogged > 0 ? (completedTasks.length / totalTimeLogged * 1000) : 0
          }
        };
      })
    );

    // Export report
    const reportExport = await client.export.data(performanceData, {
      format: 'xlsx',
      filename: `team-performance-${period}-${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName: 'Team Performance'
    });

    return {
      period,
      teamSize: teamMembers.length,
      reportData: performanceData,
      exportUrl: reportExport.downloadUrl,
      summary: {
        totalTasksCompleted: performanceData.reduce((sum, p) => sum + p.metrics.tasksCompleted, 0),
        totalTimeLogged: performanceData.reduce((sum, p) => sum + p.metrics.totalTimeLogged, 0),
        avgProductivity: performanceData.reduce((sum, p) => sum + p.metrics.productivity, 0) / performanceData.length
      }
    };
  }

  // Execute example workflows
  const projectHealth = await analyzeProjectHealth(123456);
  console.log('Project health analysis:', projectHealth);

  const migrationResult = await migrateTasks(123456, 789012, {
    status: 'completed',
    dateFrom: '2024-01-01',
    dateTo: '2024-03-31'
  });
  console.log('Task migration result:', migrationResult);

  const teamReport = await generateTeamPerformanceReport([101, 102, 103], 'quarter');
  console.log('Team performance report:', teamReport);
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function runAllExamples() {
  try {
    await advancedQueryExamples();
    console.log('\n');
    
    await exportImportExamples();
    console.log('\n');
    
    await relationshipNavigationExamples();
    console.log('\n');
    
    await advancedPaginationExamples();
    console.log('\n');
    
    await complexWorkflowExamples();
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run examples
// runAllExamples();

// Export individual example functions for selective use
export {
  advancedQueryExamples,
  exportImportExamples,
  relationshipNavigationExamples,
  advancedPaginationExamples,
  complexWorkflowExamples
};