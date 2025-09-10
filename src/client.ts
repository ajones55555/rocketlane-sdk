import { RocketlaneConfig } from './types/common';
import { HttpClient } from './utils/http-client';
import { ExportUtility, ImportUtility, ExportOptions, ImportOptions, ExportResult, ImportResult } from './utils/export-import';
import { NavigableObjectFactory } from './utils/relationship-navigation';
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
  private navFactory: NavigableObjectFactory;

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
  public readonly export: ExportManager;
  public readonly import: ImportManager;

  constructor(config: RocketlaneConfig) {
    this.httpClient = new HttpClient(config);
    this.navFactory = new NavigableObjectFactory(this);

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
    this.export = new ExportManager(this);
    this.import = new ImportManager(this);

    // Initialize navigation capabilities
    this.initializeNavigationCapabilities();
  }

  private initializeNavigationCapabilities(): void {
    // Set navigation factory for resources that support it
    if ('setNavigationFactory' in this.tasks) {
      (this.tasks as any).setNavigationFactory(this.navFactory);
    }
    if ('setNavigationFactory' in this.projects) {
      (this.projects as any).setNavigationFactory(this.navFactory);
    }
    if ('setNavigationFactory' in this.users) {
      (this.users as any).setNavigationFactory(this.navFactory);
    }
  }
}

// Export Manager for centralized export capabilities
class ExportManager {
  constructor(private client: RocketlaneClient) {}

  async tasks(params: any = {}, options: ExportOptions): Promise<ExportResult & { downloadUrl: string }> {
    const allTasks = await this.client.tasks.getAllTasks(params);
    return ExportUtility.generateExport(allTasks, options);
  }

  async projects(params: any = {}, options: ExportOptions): Promise<ExportResult & { downloadUrl: string }> {
    const allProjects = await this.client.projects.getAllProjects(params);
    return ExportUtility.generateExport(allProjects, options);
  }

  async users(params: any = {}, options: ExportOptions): Promise<ExportResult & { downloadUrl: string }> {
    const allUsers = await this.client.users.getAllUsers(params);
    return ExportUtility.generateExport(allUsers, options);
  }

  async timeEntries(params: any = {}, options: ExportOptions): Promise<ExportResult & { downloadUrl: string }> {
    const allEntries = await this.client.timeTracking.getAllTimeEntries(params);
    return ExportUtility.generateExport(allEntries, options);
  }

  // Generic export method
  async data<T>(data: T[], options: ExportOptions): Promise<ExportResult & { downloadUrl: string }> {
    return ExportUtility.generateExport(data, options);
  }
}

// Import Manager for centralized import capabilities
class ImportManager {
  constructor(private client: RocketlaneClient) {}

  async tasks(content: string, format: 'csv' | 'json' | 'xlsx', options: ImportOptions = {}): Promise<ImportResult<any>> {
    const data = this.parseContent(content, format);
    
    return ImportUtility.importData(
      data,
      async (item) => this.client.tasks.create(item),
      options
    );
  }

  async projects(content: string, format: 'csv' | 'json' | 'xlsx', options: ImportOptions = {}): Promise<ImportResult<any>> {
    const data = this.parseContent(content, format);
    
    return ImportUtility.importData(
      data,
      async (item) => this.client.projects.create(item),
      options
    );
  }

  async users(content: string, format: 'csv' | 'json' | 'xlsx', options: ImportOptions = {}): Promise<ImportResult<any>> {
    const data = this.parseContent(content, format);
    
    return ImportUtility.importData(
      data,
      async (item) => this.client.users.create(item),
      options
    );
  }

  // Generic import with custom create function
  async data<T>(
    content: string, 
    format: 'csv' | 'json' | 'xlsx',
    createFn: (item: any) => Promise<T>,
    options: ImportOptions = {}
  ): Promise<ImportResult<T>> {
    const data = this.parseContent(content, format);
    return ImportUtility.importData(data, createFn, options);
  }

  // Validation without import
  async validate(content: string, format: 'csv' | 'json' | 'xlsx', schema: Record<string, any>, options: ImportOptions = {}) {
    const data = this.parseContent(content, format);
    return ImportUtility.validateImportData(data, schema, options);
  }

  private parseContent(content: string, format: string): any[] {
    switch (format) {
      case 'csv':
        return ImportUtility.parseCSV(content);
      case 'json':
        return ImportUtility.parseJSON(content);
      case 'xlsx':
        return ImportUtility.parseExcel(content);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}