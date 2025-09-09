import { RocketlaneConfig } from './types/common';
import { HttpClient } from './utils/http-client';
import { TasksResource } from './resources/tasks';
import { FieldsResource } from './resources/fields';
import { ProjectsResource } from './resources/projects';
import { ResourceAllocationsResource } from './resources/resource-allocations';
import { PhasesResource } from './resources/phases';
import { TimeOffsResource } from './resources/time-offs';
import { UsersResource } from './resources/users';
import { SpacesResource } from './resources/spaces';
import { TimeTrackingResource } from './resources/time-tracking';
import { SpaceDocumentsResource } from './resources/space-documents';

export class RocketlaneClient {
  private httpClient: HttpClient;

  public readonly tasks: TasksResource;
  public readonly fields: FieldsResource;
  public readonly projects: ProjectsResource;
  public readonly resourceAllocations: ResourceAllocationsResource;
  public readonly phases: PhasesResource;
  public readonly timeOffs: TimeOffsResource;
  public readonly users: UsersResource;
  public readonly spaces: SpacesResource;
  public readonly timeTracking: TimeTrackingResource;
  public readonly spaceDocuments: SpaceDocumentsResource;

  constructor(config: RocketlaneConfig) {
    this.httpClient = new HttpClient(config);

    this.tasks = new TasksResource(this.httpClient);
    this.fields = new FieldsResource(this.httpClient);
    this.projects = new ProjectsResource(this.httpClient);
    this.resourceAllocations = new ResourceAllocationsResource(this.httpClient);
    this.phases = new PhasesResource(this.httpClient);
    this.timeOffs = new TimeOffsResource(this.httpClient);
    this.users = new UsersResource(this.httpClient);
    this.spaces = new SpacesResource(this.httpClient);
    this.timeTracking = new TimeTrackingResource(this.httpClient);
    this.spaceDocuments = new SpaceDocumentsResource(this.httpClient);
  }
}