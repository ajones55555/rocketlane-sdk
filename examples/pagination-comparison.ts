import { RocketlaneClient } from '../src';

const client = new RocketlaneClient({
  apiKey: process.env.ROCKETLANE_API_KEY!,
});

async function paginationComparison() {
  console.log('🔄 Pagination Approach Comparison\n');

  // ===== APPROACH 1: Resource-based methods (current) =====
  console.log('1️⃣ Resource-based pagination (current approach):');
  
  const response1 = await client.tasks.list({ pageSize: 10 });
  console.log(`   First page: ${response1.data.length} tasks`);
  
  // Get next page via resource method
  const nextPage1 = await client.tasks.getNextPage(response1, { pageSize: 10 });
  if (nextPage1) {
    console.log(`   Second page: ${nextPage1.data.length} tasks`);
  }
  
  // Get all tasks via resource method
  const allTasks1 = await client.tasks.getAllTasks({ pageSize: 10 });
  console.log(`   All tasks: ${allTasks1.length} total\n`);

  // ===== APPROACH 2: Response-based methods (hybrid) =====
  console.log('2️⃣ Response-based pagination (hybrid approach):');
  
  const response2 = await client.tasks.listWithPagination({ pageSize: 10 });
  console.log(`   First page: ${response2.data.length} tasks`);
  
  // Get next page via response method - much cleaner!
  const nextPage2 = await response2.getNextPage();
  if (nextPage2) {
    console.log(`   Second page: ${nextPage2.data.length} tasks`);
  }
  
  // Get all remaining tasks from this response
  const allRemaining = await response2.getAllRemaining();
  console.log(`   All remaining: ${allRemaining.length} total\n`);

  // ===== COMPARISON: Iterate through items =====
  console.log('🔄 Iteration Comparison:');
  
  // Resource-based iteration
  console.log('   Resource-based:');
  let count1 = 0;
  for await (const task of client.tasks.iterateTasks({ pageSize: 5 })) {
    count1++;
    if (count1 <= 3) console.log(`     Task ${count1}: ${task.taskName}`);
    if (count1 >= 3) break;
  }
  
  // Response-based iteration  
  console.log('   Response-based:');
  const response3 = await client.tasks.listWithPagination({ pageSize: 5 });
  let count2 = 0;
  for await (const task of response3.iterateRemainingItems()) {
    count2++;
    if (count2 <= 3) console.log(`     Task ${count2}: ${task.taskName}`);
    if (count2 >= 3) break;
  }

  console.log('\n✅ Comparison complete!');
}

// Usage examples showing the difference in developer experience
async function developerExperienceComparison() {
  console.log('\n👨‍💻 Developer Experience Comparison\n');

  // Resource-based (current)
  console.log('Resource-based approach:');
  console.log('```typescript');
  console.log('const response = await client.tasks.list({ pageSize: 100 });');
  console.log('const nextPage = await client.tasks.getNextPage(response, { pageSize: 100 });');
  console.log('const allTasks = await client.tasks.getAllTasks({ pageSize: 100 });');
  console.log('```\n');

  // Response-based (hybrid)
  console.log('Response-based approach:');
  console.log('```typescript');
  console.log('const response = await client.tasks.listWithPagination({ pageSize: 100 });');
  console.log('const nextPage = await response.getNextPage();');
  console.log('const allRemaining = await response.getAllRemaining();');
  console.log('```\n');

  console.log('💡 Key differences:');
  console.log('• Response-based is more intuitive and cleaner');
  console.log('• Resource-based offers more control and flexibility');
  console.log('• Both maintain full type safety');
  console.log('• Hybrid approach gives developers choice of style');
}

// Execute comparison if run directly
if (require.main === module) {
  Promise.all([
    paginationComparison(),
    developerExperienceComparison()
  ]).catch(console.error);
}

export {
  paginationComparison,
  developerExperienceComparison,
};