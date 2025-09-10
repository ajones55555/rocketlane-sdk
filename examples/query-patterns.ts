// Query Pattern Examples for Rocketlane SDK
import { RocketlaneClient } from '../src/index';
import { sql } from '../src/utils/query-builder';

const client = new RocketlaneClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.rocketlane.com'
});

// =============================================================================
// QUERY BUILDER PATTERNS
// =============================================================================

async function queryBuilderPatterns() {
  console.log('=== Query Builder Patterns ===');

  // 1. Basic filtering
  const basicFilter = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereEquals('status', 'active')
      .whereGreaterThan('priority', 2)
      .limit(50)
  );

  // 2. Range queries
  const rangeQuery = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereBetween('dueDate', '2024-01-01', '2024-12-31')
      .whereBetween('priority', 3, 5)
      .orderBy('dueDate', 'asc')
  );

  // 3. Multiple value filtering
  const multiValueFilter = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereIn('assigneeId', [101, 102, 103])
      .whereNotIn('status', ['cancelled', 'archived'])
      .whereIn('projectId', [123, 456, 789])
  );

  // 4. Text search patterns
  const textSearch = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereContains('taskName', 'api')
      .whereContains('description', 'urgent')
      .whereNotContains('taskName', 'deprecated')
  );

  // 5. Complex combinations
  const complexQuery = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereEquals('projectId', 123456)
      .where('priority', '>=', 4)
      .where('effortInMinutes', '<=', 480) // 8 hours max
      .whereBetween('createdDate', '2024-01-01', '2024-06-30')
      .whereIn('status', ['active', 'in_progress'])
      .whereContains('taskName', 'feature')
      .orderBy('priority', 'desc')
      .orderBy('dueDate', 'asc')
      .limit(25)
  );

  // 6. Field selection patterns
  const fieldSelection = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereEquals('projectId', 123456)
      .select(['taskId', 'taskName', 'status', 'dueDate', 'assigneeId'])
      .orderBy('taskName', 'asc')
  );

  // 7. GraphQL-style nested selection
  const nestedSelection = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereEquals('status', 'active')
      .select({
        taskId: true,
        taskName: true,
        assignee: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true
        },
        project: {
          projectId: true,
          projectName: true
        },
        customFields: {
          fieldName: true,
          value: true
        }
      })
      .limit(10)
  );

  return {
    basicFilter: basicFilter.count,
    rangeQuery: rangeQuery.count,
    multiValueFilter: multiValueFilter.count,
    textSearch: textSearch.count,
    complexQuery: complexQuery.count,
    fieldSelection: fieldSelection.count,
    nestedSelection: nestedSelection.count
  };
}

// =============================================================================
// SQL-LIKE QUERY PATTERNS
// =============================================================================

async function sqlQueryPatterns() {
  console.log('=== SQL Query Patterns ===');

  // 1. Basic SELECT queries
  const basicSelect = await client.tasks.querySQL(sql`
    SELECT taskId, taskName, status, dueDate
    FROM tasks
    WHERE projectId = ${123456}
    ORDER BY dueDate ASC
    LIMIT 20
  `);

  // 2. Complex WHERE clauses
  const complexWhere = await client.tasks.querySQL(sql`
    SELECT *
    FROM tasks
    WHERE projectId IN (${123456}, ${789012})
      AND priority >= ${3}
      AND dueDate BETWEEN ${'2024-01-01'} AND ${'2024-12-31'}
      AND status NOT IN ('cancelled', 'archived')
      AND taskName LIKE ${'%feature%'}
    ORDER BY priority DESC, dueDate ASC
  `);

  // 3. Aggregation-style queries (simulated)
  const aggregationQuery = await client.tasks.querySQL(sql`
    SELECT assigneeId, COUNT(*) as taskCount, AVG(priority) as avgPriority
    FROM tasks
    WHERE projectId = ${123456}
      AND status IN ('active', 'in_progress')
    GROUP BY assigneeId
    HAVING taskCount > ${5}
    ORDER BY taskCount DESC
  `);

  // 4. Date-based queries
  const dateQueries = await client.tasks.querySQL(sql`
    SELECT taskId, taskName, dueDate
    FROM tasks
    WHERE dueDate < ${new Date().toISOString()}
      AND status != 'completed'
      AND createdDate >= ${'2024-01-01'}
    ORDER BY dueDate ASC
  `);

  // 5. Subquery-style patterns
  const subqueryPattern = await client.tasks.querySQL(sql`
    SELECT t.*
    FROM tasks t
    WHERE t.projectId = ${123456}
      AND t.assigneeId IN (
        SELECT userId FROM users WHERE role = 'developer'
      )
      AND t.priority > (
        SELECT AVG(priority) FROM tasks WHERE projectId = ${123456}
      )
  `);

  // 6. JOIN-like queries (simulated)
  const joinPattern = await client.tasks.querySQL(sql`
    SELECT 
      t.taskId,
      t.taskName,
      t.status,
      p.projectName,
      u.firstName,
      u.lastName
    FROM tasks t
    LEFT JOIN projects p ON t.projectId = p.projectId
    LEFT JOIN users u ON t.assigneeId = u.userId
    WHERE t.status = 'active'
      AND p.status = 'active'
    ORDER BY p.projectName, t.taskName
  `);

  return {
    basicSelect: basicSelect.count,
    complexWhere: complexWhere.count,
    aggregationQuery: aggregationQuery.count,
    dateQueries: dateQueries.count,
    subqueryPattern: subqueryPattern.count,
    joinPattern: joinPattern.count
  };
}

// =============================================================================
// PREDEFINED QUERY PATTERNS
// =============================================================================

async function predefinedQueryPatterns() {
  console.log('=== Predefined Query Patterns ===');

  // 1. Project-based queries
  const projectTasks = await client.tasks.forProject(123456).execute();
  const projectActiveTasks = await (client.tasks
    .forProject(123456) as any)
    .withStatus('active')
    .orderBy('dueDate', 'asc')
    .execute();

  // 2. User assignment queries
  const userTasks = await client.tasks.assignedTo(101).execute();
  const multiUserTasks = await (client.tasks
    .assignedTo([101, 102, 103]) as any)
    .withStatus('active')
    .execute();

  // 3. Date-based queries
  const thisWeekTasks = await client.tasks
    .dueBetween(
      new Date().toISOString().split('T')[0],
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    )
    .execute();

  const overdueTasks = await client.tasks.overdue().execute();

  // 4. Priority-based queries
  const highPriorityTasks = await (client.tasks
    .highPriority() as any)
    .assignedTo([101, 102])
    .execute();

  // 5. Effort-based queries
  const bigTasks = await (client.tasks
    .withEffortMoreThan(480) as any) // More than 8 hours
    .withStatus('active')
    .execute();

  // 6. Text search queries
  const searchResults = await (client.tasks
    .nameContains('feature') as any)
    .forProject(123456)
    .orderBy('priority', 'desc')
    .execute();

  // 7. Combined predefined patterns
  const criticalOverdueTasks = await (client.tasks
    .highPriority() as any)
    .overdue()
    .assignedTo([101, 102, 103])
    .orderBy('dueDate', 'asc')
    .limit(10)
    .execute();

  // 8. Built-in analysis methods
  const criticalTasksAnalysis = await client.tasks.findCriticalTasks(123456);
  const teamWorkloadAnalysis = await client.tasks.findTeamWorkload(
    [101, 102, 103],
    '2024-01-01',
    '2024-12-31'
  );

  return {
    projectTasks: projectTasks.count,
    projectActiveTasks: projectActiveTasks.count,
    userTasks: userTasks.count,
    multiUserTasks: multiUserTasks.count,
    thisWeekTasks: thisWeekTasks.count,
    overdueTasks: overdueTasks.count,
    highPriorityTasks: highPriorityTasks.count,
    bigTasks: bigTasks.count,
    searchResults: searchResults.count,
    criticalOverdueTasks: criticalOverdueTasks.count,
    criticalAnalysis: criticalTasksAnalysis.count,
    workloadAnalysis: teamWorkloadAnalysis.count
  };
}

// =============================================================================
// PERFORMANCE OPTIMIZATION PATTERNS
// =============================================================================

async function performanceOptimizationPatterns() {
  console.log('=== Performance Optimization Patterns ===');

  // 1. Field selection to reduce payload
  const optimizedQuery = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereEquals('projectId', 123456)
      .select(['taskId', 'taskName', 'status', 'dueDate']) // Only needed fields
      .limit(100)
  );

  // 2. Pagination for large datasets
  const paginatedQuery = async (pageSize = 50) => {
    const results = [];
    let hasMore = true;
    let pageToken: string | undefined;

    while (hasMore && results.length < 1000) { // Safety limit
      const page = await client.tasks.list({
        projectId: 123456,
        pageSize,
        pageToken
      });

      results.push(...page.data);
      hasMore = page.pagination.hasMore;
      pageToken = page.pagination.nextPageToken;
    }

    return results;
  };

  // 3. Batch processing with generators
  const batchProcessing = async () => {
    const processedCount = { value: 0 };

    for await (const task of client.tasks.iterateTasks({ projectId: 123456 })) {
      // Process each task individually without loading all into memory
      console.log(`Processing task: ${task.taskName}`);
      processedCount.value++;

      // Process in chunks
      if (processedCount.value % 100 === 0) {
        console.log(`Processed ${processedCount.value} tasks`);
        // Optional: Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return processedCount.value;
  };

  // 4. Parallel processing with controlled concurrency
  const parallelProcessing = async () => {
    const allTasks = await client.tasks.getAllTasks({
      projectId: 123456,
      status: 'active' as any
    });

    const batchSize = 10;
    const results = [];

    for (let i = 0; i < allTasks.length; i += batchSize) {
      const batch = allTasks.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (task) => {
          // Simulate processing
          const details = await client.tasks.get(task.taskId);
          return { taskId: task.taskId, processed: true };
        })
      );

      results.push(...batchResults);
      
      // Add delay between batches to manage API rate limits
      if (i + batchSize < allTasks.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  };

  // 5. Caching query results
  const queryCache = new Map<string, any>();
  
  const cachedQuery = async (cacheKey: string, queryFn: () => Promise<any>) => {
    if (queryCache.has(cacheKey)) {
      console.log(`Cache hit for: ${cacheKey}`);
      return queryCache.get(cacheKey);
    }

    console.log(`Cache miss for: ${cacheKey}`);
    const result = await queryFn();
    queryCache.set(cacheKey, result);
    
    // Clear cache after 5 minutes
    setTimeout(() => queryCache.delete(cacheKey), 5 * 60 * 1000);
    
    return result;
  };

  // Example usage of cached query
  const cachedProjectTasks = await cachedQuery(
    'project-123456-active-tasks',
    () => client.tasks.query(
      client.tasks.queryBuilder()
        .whereEquals('projectId', 123456)
        .whereEquals('status', 'active')
    )
  );

  return {
    optimizedQuery: optimizedQuery.count,
    batchProcessed: await batchProcessing(),
    parallelProcessed: (await parallelProcessing()).length,
    cachedResults: cachedProjectTasks.count
  };
}

// =============================================================================
// REAL-WORLD QUERY EXAMPLES
// =============================================================================

async function realWorldQueryExamples() {
  console.log('=== Real-World Query Examples ===');

  // 1. Sprint Planning Query
  const sprintPlanningQuery = await client.tasks.querySQL(sql`
    SELECT 
      taskId,
      taskName,
      assigneeId,
      effortInMinutes,
      priority,
      dependencies
    FROM tasks
    WHERE projectId = ${123456}
      AND status = 'ready_for_development'
      AND priority >= ${3}
      AND effortInMinutes <= ${480}
    ORDER BY priority DESC, effortInMinutes ASC
    LIMIT 50
  `);

  // 2. Resource Allocation Analysis
  const resourceAllocationQuery = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereIn('assigneeId', [101, 102, 103, 104])
      .whereIn('status', ['active', 'in_progress'])
      .whereBetween('dueDate', '2024-01-01', '2024-03-31')
      .select({
        taskId: true,
        taskName: true,
        assigneeId: true,
        effortInMinutes: true,
        dueDate: true,
        priority: true
      })
      .orderBy('assigneeId', 'asc')
      .orderBy('dueDate', 'asc')
  );

  // 3. Risk Assessment Query
  const riskAssessmentQuery = await client.tasks.querySQL(sql`
    SELECT *
    FROM tasks
    WHERE (
      (dueDate < ${new Date().toISOString()} AND status != 'completed')
      OR (priority >= ${4} AND effortInMinutes > ${960})
      OR (dependencies IS NOT NULL AND status = 'blocked')
    )
    AND projectId IN (${123456}, ${789012})
    ORDER BY priority DESC, dueDate ASC
  `);

  // 4. Team Performance Metrics
  const teamPerformanceQuery = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereIn('assigneeId', [101, 102, 103])
      .whereBetween('completedDate', '2024-01-01', '2024-01-31')
      .whereEquals('status', 'completed')
      .select(['taskId', 'assigneeId', 'effortInMinutes', 'completedDate', 'priority'])
      .orderBy('assigneeId', 'asc')
      .orderBy('completedDate', 'asc')
  );

  // 5. Dependency Chain Analysis
  const dependencyChainQuery = await client.tasks.querySQL(sql`
    SELECT 
      t1.taskId as dependentTask,
      t1.taskName as dependentTaskName,
      t1.status as dependentStatus,
      t2.taskId as dependencyTask,
      t2.taskName as dependencyTaskName,
      t2.status as dependencyStatus
    FROM tasks t1
    JOIN task_dependencies td ON t1.taskId = td.dependentTaskId
    JOIN tasks t2 ON td.dependencyTaskId = t2.taskId
    WHERE t1.projectId = ${123456}
      AND (t2.status != 'completed' OR t1.status = 'blocked')
    ORDER BY t1.priority DESC
  `);

  // 6. Workload Balance Query
  const workloadBalanceQuery = await client.tasks.query(
    client.tasks.queryBuilder()
      .whereEquals('projectId', 123456)
      .whereIn('status', ['active', 'in_progress', 'ready_for_development'])
      .select({
        assigneeId: true,
        effortInMinutes: true,
        priority: true,
        dueDate: true
      })
      .orderBy('assigneeId', 'asc')
  );

  // 7. Quality Gate Query
  const qualityGateQuery = await client.tasks.querySQL(sql`
    SELECT *
    FROM tasks
    WHERE projectId = ${123456}
      AND (
        (taskName LIKE '%test%' AND status != 'completed')
        OR (taskName LIKE '%review%' AND status != 'completed')
        OR (priority >= ${4} AND assigneeId IS NULL)
      )
    ORDER BY priority DESC, dueDate ASC
  `);

  return {
    sprintPlanningTasks: sprintPlanningQuery.count,
    resourceAllocationTasks: resourceAllocationQuery.count,
    riskTasks: riskAssessmentQuery.count,
    performanceMetrics: teamPerformanceQuery.count,
    dependencyIssues: dependencyChainQuery.count,
    workloadTasks: workloadBalanceQuery.count,
    qualityGateTasks: qualityGateQuery.count
  };
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

export async function runQueryPatternExamples() {
  try {
    console.log('Running query pattern examples...\n');

    const builderResults = await queryBuilderPatterns();
    console.log('Query Builder Results:', builderResults, '\n');

    const sqlResults = await sqlQueryPatterns();
    console.log('SQL Query Results:', sqlResults, '\n');

    const predefinedResults = await predefinedQueryPatterns();
    console.log('Predefined Query Results:', predefinedResults, '\n');

    const performanceResults = await performanceOptimizationPatterns();
    console.log('Performance Optimization Results:', performanceResults, '\n');

    const realWorldResults = await realWorldQueryExamples();
    console.log('Real-World Query Results:', realWorldResults, '\n');

  } catch (error) {
    console.error('Error running query pattern examples:', error);
  }
}

// Export individual functions for selective use
export {
  queryBuilderPatterns,
  sqlQueryPatterns,
  predefinedQueryPatterns,
  performanceOptimizationPatterns,
  realWorldQueryExamples
};