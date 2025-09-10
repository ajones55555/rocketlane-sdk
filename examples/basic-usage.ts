import { RocketlaneClient } from '../src';

// Initialize the client
const client = new RocketlaneClient({
  apiKey: process.env.ROCKETLANE_API_KEY!,
});

async function basicExamples() {
  try {
    console.log('🚀 Rocketlane SDK Examples\n');

    // ===== TASKS =====
    console.log('📋 Task Management');
    
    // List tasks with filtering
    const tasks = await client.tasks.list({
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    console.log(`Found ${tasks.pagination.totalRecordCount} tasks`);

    if (tasks.data.length > 0) {
      const firstTask = tasks.data[0];
      console.log(`First task: ${firstTask.taskName} (ID: ${firstTask.taskId})`);

      // Get detailed task information
      const detailedTask = await client.tasks.get(firstTask.taskId);
      console.log(`Task status: ${detailedTask.status.label}`);
      console.log(`Created by: ${detailedTask.createdBy.firstName}`);
    }

    // Create a new task (uncomment to test)
    /*
    const newTask = await client.tasks.create({
      taskName: 'SDK Integration Test',
      projectId: 123456, // Replace with actual project ID
      startDate: '2024-12-01',
      dueDate: '2024-12-15',
      effortInMinutes: 480, // 8 hours
    });
    console.log(`Created task: ${newTask.taskName} (ID: ${newTask.taskId})`);
    */

    // ===== PROJECTS =====
    console.log('\n🏗️ Project Management');
    
    // List projects
    const projects = await client.projects.list({
      pageSize: 5,
      archived: false,
    });
    console.log(`Found ${projects.pagination.totalRecordCount} active projects`);

    if (projects.data.length > 0) {
      const firstProject = projects.data[0];
      console.log(`First project: ${firstProject.projectName} (ID: ${firstProject.projectId})`);
      console.log(`Owner: ${firstProject.owner.firstName} ${firstProject.owner.lastName || ''}`);
      console.log(`Team members: ${firstProject.teamMembers?.length || 0}`);
    }

    // ===== USERS =====
    console.log('\n👥 User Management');
    
    // List active team members
    const teamMembers = await client.users.getTeamMembers({
      pageSize: 10,
    });
    console.log(`Found ${teamMembers.pagination.totalRecordCount} team members`);

    // List all active users
    const activeUsers = await client.users.getActive({
      pageSize: 5,
    });
    console.log(`Found ${activeUsers.pagination.totalRecordCount} active users`);

    // ===== TIME TRACKING =====
    console.log('\n⏰ Time Tracking');
    
    // Get recent time entries
    const timeEntries = await client.timeTracking.list({
      pageSize: 5,
      sortBy: 'date',
      sortOrder: 'desc',
    });
    console.log(`Found ${timeEntries.pagination.totalRecordCount} time entries`);

    if (timeEntries.data.length > 0) {
      const recentEntry = timeEntries.data[0];
      console.log(`Recent entry: ${recentEntry.minutes} minutes on ${recentEntry.date}`);
      console.log(`Project: ${recentEntry.project.projectName}`);
      console.log(`User: ${recentEntry.user.firstName} ${recentEntry.user.lastName || ''}`);
      console.log(`Billable: ${recentEntry.billable ? 'Yes' : 'No'}`);
    }

    // Get time entry categories
    const categories = await client.timeTracking.getCategories();
    console.log(`Available categories: ${categories.data.length}`);
    if (categories.data.length > 0) {
      console.log(`Example category: ${categories.data[0]?.categoryName}`);
    }

    // ===== CUSTOM FIELDS =====
    console.log('\n🏷️ Custom Fields');
    
    // List task fields
    const taskFields = await client.fields.getTaskFields({
      active: true,
    });
    console.log(`Found ${taskFields.pagination?.totalRecordCount || taskFields.data.length} task fields`);

    // ===== PHASES =====
    console.log('\n📊 Project Phases');
    
    // List phases
    const phases = await client.phases.list({
      pageSize: 10,
      archived: false,
    });
    console.log(`Found ${phases.pagination?.totalRecordCount || phases.data.length} phases`);

    if (phases.data.length > 0) {
      const firstPhase = phases.data[0];
      console.log(`First phase: ${firstPhase.phaseName} (Status: ${firstPhase.status})`);
    }

    console.log('\n✅ Examples completed successfully!');

  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Demonstration of error handling
async function errorHandlingExample() {
  try {
    // This will likely fail with a 404 error
    await client.tasks.get(999999999);
  } catch (error: any) {
    console.log('\n🔥 Error Handling Example');
    console.log(`Error type: ${error.constructor.name}`);
    console.log(`Message: ${error.message}`);
    if (error.statusCode) {
      console.log(`Status code: ${error.statusCode}`);
    }
    if (error.response) {
      console.log(`Response status: ${error.response.status}`);
    }
  }
}

// Pagination examples
async function paginationExample() {
  console.log('\n📄 Pagination Examples');
  
  // Example 1: Manual pagination (old way)
  console.log('\n1. Manual Pagination:');
  let totalTasks = 0;
  let pageCount = 0;
  let nextPageToken: string | undefined = undefined;

  do {
    const response = await client.tasks.list({
      pageSize: 50,
      pageToken: nextPageToken,
    });

    totalTasks += response.data.length;
    pageCount++;
    nextPageToken = response.pagination.nextPageToken;

    console.log(`  Page ${pageCount}: ${response.data.length} tasks`);

    // Limit to first few pages for demo
    if (pageCount >= 3) break;

  } while (nextPageToken);

  console.log(`  Total tasks retrieved: ${totalTasks} across ${pageCount} pages`);

  // Example 2: Using getNextPage helper
  console.log('\n2. Using getNextPage helper:');
  const firstPage = await client.tasks.list({ pageSize: 10 });
  console.log(`  First page: ${firstPage.data.length} tasks`);
  
  if (firstPage.pagination.hasMore) {
    const secondPage = await client.tasks.getNextPage(firstPage, { pageSize: 10 });
    if (secondPage) {
      console.log(`  Second page: ${secondPage.data.length} tasks`);
    }
  }

  // Example 3: Get all items at once (with limits)
  console.log('\n3. Get all items at once:');
  try {
    const allTasks = await client.tasks.getAllTasks({ pageSize: 20 }); // Small page size for demo
    console.log(`  Retrieved ${allTasks.length} total tasks across all pages`);
  } catch (error) {
    console.log('  Could not retrieve all tasks (likely too many)');
  }

  // Example 4: Iterate through pages
  console.log('\n4. Iterate through pages:');
  let pageNum = 0;
  for await (const page of client.tasks.iterateTaskPages({ pageSize: 10 })) {
    pageNum++;
    console.log(`  Page ${pageNum}: ${page.data.length} tasks`);
    if (pageNum >= 3) break; // Limit for demo
  }

  // Example 5: Iterate through individual items
  console.log('\n5. Iterate through individual items:');
  let itemCount = 0;
  for await (const task of client.tasks.iterateTasks({ pageSize: 10 })) {
    itemCount++;
    console.log(`  Task ${itemCount}: ${task.taskName}`);
    if (itemCount >= 5) break; // Limit for demo
  }

  console.log('\n✅ Pagination examples completed!');
}

// Run all examples
async function runAllExamples() {
  await basicExamples();
  await errorHandlingExample();
  await paginationExample();
}

// Execute if run directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  basicExamples,
  errorHandlingExample,
  paginationExample,
  runAllExamples,
};