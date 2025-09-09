# Rocketlane SDK

Official TypeScript SDK for the Rocketlane API. Provides comprehensive, type-safe access to all Rocketlane resources including tasks, projects, users, time tracking, and more.

## Installation

```bash
npm install rocketlane-sdk
```

## Quick Start

```typescript
import { RocketlaneClient } from 'rocketlane-sdk';

const client = new RocketlaneClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.rocketlane.com', // Optional, defaults to this
});

// Get all tasks
const tasks = await client.tasks.list();

// Create a new task
const newTask = await client.tasks.create({
  taskName: 'Review API Integration',
  projectId: 123456,
  assignees: [78910],
});

// Get a specific project
const project = await client.projects.get(123456);
```

## Authentication

The SDK requires an API key for authentication. You can obtain your API key from your Rocketlane account settings.

```typescript
const client = new RocketlaneClient({
  apiKey: process.env.ROCKETLANE_API_KEY!,
});
```

## Configuration

### Basic Configuration

```typescript
const client = new RocketlaneClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.rocketlane.com', // Optional
  timeout: 30000, // Optional, default: 30000ms
  retries: 3, // Optional, default: 3
});
```

## Resources

### Tasks

Complete task management with support for assignees, followers, dependencies, and custom fields.

```typescript
// List tasks with filtering
const tasks = await client.tasks.list({
  projectId: 123456,
  status: 1, // Status ID
  assigneeId: 78910,
  pageSize: 50,
  includeFields: 'startDateActual,dueDateActual,billable',
});

// Get a specific task
const task = await client.tasks.get(987654);

// Create a task
const newTask = await client.tasks.create({
  taskName: 'Implement new feature',
  projectId: 123456,
  startDate: '2024-01-01',
  dueDate: '2024-01-15',
  assignees: [78910],
  priority: 1,
  fields: {
    'custom-field-id': 'custom value'
  }
});

// Update a task
const updatedTask = await client.tasks.update(987654, {
  taskName: 'Updated task name',
  status: 2,
  progress: 50,
});

// Add assignees to a task
await client.tasks.addAssignees(987654, {
  assignees: [11111, 22222]
});

// Move task to different phase
await client.tasks.moveToPhase(987654, {
  phaseId: 555555,
  position: 1
});

// Archive a task
await client.tasks.archive(987654);

// Helper methods
const projectTasks = await client.tasks.getByProject(123456);
const userTasks = await client.tasks.getByAssignee(78910);
const searchResults = await client.tasks.search('API integration');
```

### Projects

Full project lifecycle management with members, phases, and templates.

```typescript
// List projects
const projects = await client.projects.list({
  companyId: 12345,
  status: 1,
  pageSize: 25,
});

// Get project details
const project = await client.projects.get(123456, 'startDate,dueDate,teamMembers');

// Create a new project
const newProject = await client.projects.create({
  projectName: 'Website Redesign',
  companyId: 12345,
  startDate: '2024-01-01',
  dueDate: '2024-03-31',
  ownerId: 78910,
  teamMembers: [11111, 22222],
  visibility: 'MEMBERS',
});

// Add team members
await client.projects.addMembers(123456, {
  members: [33333, 44444]
});

// Import a template
await client.projects.importTemplate(123456, {
  templateId: 98765,
  startDate: '2024-02-01'
});

// Archive a project
await client.projects.archive(123456);
```

### Users

User management with roles, permissions, and custom fields.

```typescript
// List users
const users = await client.users.list({
  type: 'TEAM_MEMBER',
  status: 'ACTIVE',
  companyId: 12345,
});

// Get user details
const user = await client.users.get(78910);

// Create a new user
const newUser = await client.users.create({
  email: 'jane.doe@company.com',
  firstName: 'Jane',
  lastName: 'Doe',
  type: 'TEAM_MEMBER',
  companyId: 12345,
  role: 'Developer',
  capacityInMinutes: 2400, // 40 hours per week
});

// Invite users in bulk
await client.users.bulkInvite({
  users: [
    {
      email: 'user1@company.com',
      firstName: 'User',
      lastName: 'One',
      type: 'TEAM_MEMBER',
      companyId: 12345,
    },
    // ... more users
  ]
});

// Helper methods
const teamMembers = await client.users.getTeamMembers();
const activeUsers = await client.users.getActive();
const partnerUsers = await client.users.getPartners();
```

### Time Tracking

Comprehensive time tracking with categories, approval workflows, and reporting.

```typescript
// List time entries
const timeEntries = await client.timeTracking.list({
  projectId: 123456,
  userId: 78910,
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
  billable: true,
});

// Create a time entry
const newEntry = await client.timeTracking.create({
  date: '2024-01-15',
  minutes: 120,
  projectId: 123456,
  categoryId: 87426,
  taskId: 987654,
  billable: true,
  description: 'Code review and testing',
});

// Bulk create time entries
await client.timeTracking.bulkCreate({
  entries: [
    {
      date: '2024-01-15',
      minutes: 60,
      projectId: 123456,
      categoryId: 87426,
      billable: true,
    },
    // ... more entries
  ]
});

// Approve time entries
await client.timeTracking.approve({
  timeEntryIds: [111, 222, 333]
});

// Get time entry categories
const categories = await client.timeTracking.getCategories();

// Timer functionality
const timer = await client.timeTracking.startTimer({
  projectId: 123456,
  categoryId: 87426,
  description: 'Working on new feature'
});

// Stop the timer
const completedEntry = await client.timeTracking.stopTimer(timer.timerId);

// Generate reports
const report = await client.timeTracking.getReport({
  projectId: 123456,
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
  groupBy: 'user'
});
```

### Custom Fields

Manage custom fields across different entity types.

```typescript
// List custom fields
const fields = await client.fields.list({
  entity: 'task',
  active: true,
});

// Create a custom field
const newField = await client.fields.create({
  fieldName: 'Priority Level',
  type: 'select',
  required: true,
  visibility: {
    entities: ['task', 'project'],
  },
  options: [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ]
});

// Update entity field values
await client.fields.updateEntityFields('task', 987654, {
  fields: {
    'field-id-1': 'high',
    'field-id-2': '2024-01-31',
  }
});

// Manage field options
await client.fields.createOption('field-id', {
  label: 'Critical',
  value: 'critical',
  color: '#ff0000'
});
```

### Phases

Project phase management with ordering and progress tracking.

```typescript
// List phases
const phases = await client.phases.list({
  projectId: 123456,
  status: 'In Progress',
});

// Create a new phase
const newPhase = await client.phases.create({
  phaseName: 'Development',
  projectId: 123456,
  startDate: '2024-01-01',
  dueDate: '2024-02-29',
  color: '#007bff',
});

// Reorder phases
await client.phases.reorder({
  phaseIds: [111, 222, 333] // New order
});

// Duplicate a phase
await client.phases.duplicate(555555, {
  newPhaseName: 'Development Phase 2',
  includeTasks: true
});
```

## Error Handling

The SDK includes comprehensive error handling with automatic retries for transient failures.

```typescript
import { RocketlaneClient, RocketlaneError } from 'rocketlane-sdk';

try {
  const tasks = await client.tasks.list();
} catch (error) {
  if (error instanceof RocketlaneError) {
    console.error(`API Error ${error.statusCode}: ${error.message}`);
    console.error('Response:', error.response?.data);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Pagination

The SDK handles pagination automatically. You can control page size and iterate through results:

```typescript
// Get first page with custom page size
const firstPage = await client.tasks.list({ pageSize: 100 });

// Get next page using token
if (firstPage.pagination.hasMore) {
  const nextPage = await client.tasks.list({
    pageToken: firstPage.pagination.nextPageToken,
    pageSize: 100
  });
}

// Helper function to get all results
async function getAllTasks(projectId: number) {
  let allTasks = [];
  let nextPageToken = undefined;
  
  do {
    const response = await client.tasks.list({
      projectId,
      pageToken: nextPageToken,
      pageSize: 100
    });
    
    allTasks.push(...response.data);
    nextPageToken = response.pagination.nextPageToken;
  } while (response.pagination.hasMore);
  
  return allTasks;
}
```

## TypeScript Support

The SDK is built with TypeScript and provides comprehensive type definitions:

```typescript
import {
  RocketlaneClient,
  Task,
  Project,
  User,
  TimeEntry,
  CreateTaskRequest,
  TasksQueryParams,
} from 'rocketlane-sdk';

// All responses are properly typed
const tasks: Task[] = (await client.tasks.list()).data;

// Request objects have full type safety
const taskData: CreateTaskRequest = {
  taskName: 'New Task',
  projectId: 123456,
  // TypeScript will validate all properties
};

// Query parameters are type-checked
const queryParams: TasksQueryParams = {
  status: 1,
  assigneeId: 78910,
  sortBy: 'dueDate',
  sortOrder: 'asc',
  includeFields: 'startDateActual,dueDateActual'
};
```

## Rate Limiting

The SDK automatically handles rate limiting with exponential backoff retry logic. Failed requests due to rate limiting (429 status code) or server errors (5xx) are automatically retried.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [API Documentation](https://developer.rocketlane.com)
- 🐛 [Report Issues](https://github.com/rocketlane/rocketlane-sdk/issues)
- 💬 [Community Support](https://community.rocketlane.com)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.