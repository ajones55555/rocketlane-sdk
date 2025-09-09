import { RocketlaneClient } from './client';

export { RocketlaneClient } from './client';

// Core types
export * from './types/common';
export * from './types/tasks';
export type {
  Project,
  ProjectsListResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectsQueryParams,
} from './types/projects';
export type {
  User,
  UsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UsersQueryParams,
} from './types/users';
export * from './types/time-tracking';
export * from './types/fields';
export type {
  Phase,
  PhasesListResponse,
  CreatePhaseRequest,
  UpdatePhaseRequest,
  PhasesQueryParams,
} from './types/phases';

// Resources
export * from './resources/tasks';
export * from './resources/projects';
export * from './resources/users';
export * from './resources/time-tracking';
export * from './resources/fields';
export * from './resources/phases';
export * from './resources/resource-allocations';
export * from './resources/time-offs';
export * from './resources/spaces';
export * from './resources/space-documents';

// Utils
export * from './utils/http-client';

export default RocketlaneClient;

// fetch projects by user id 14141 and then return their names in a CSV String

const client = new RocketlaneClient({
  apiKey: ''
});

const userId = 14141;

client.projects.list({
  userId
}).then(projects => {
  const projectNames = projects.data.map(project => project.name);
  const csvString = projectNames.join(',');
  console.log(csvString);
});