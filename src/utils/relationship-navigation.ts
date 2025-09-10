// Relationship navigation utilities for intuitive object traversal

import type { RocketlaneClient } from '../client';
import type { Task, TasksListResponse, TasksQueryParams } from '../types/tasks';
import type { Project, ProjectsListResponse, ProjectsQueryParams } from '../types/projects';
import type { User, UsersListResponse, UsersQueryParams } from '../types/users';
import type { Phase, PhasesListResponse, PhasesQueryParams } from '../types/phases';
import type { TimeEntry, TimeEntriesListResponse, TimeEntriesQueryParams } from '../types/time-tracking';

// Enhanced types with navigation capabilities
export interface NavigableTask extends Task {
  // Project navigation
  getProject(): Promise<NavigableProject>;
  
  // Phase navigation
  getPhase(): Promise<NavigablePhase | null>;
  
  // User navigation
  getAssignees(): Promise<NavigableUser[]>;
  getFollowers(): Promise<NavigableUser[]>;
  getCreatedBy(): Promise<NavigableUser>;
  getUpdatedBy(): Promise<NavigableUser>;
  
  // Related tasks
  getDependencies(): Promise<NavigableTask[]>;
  getDependents(): Promise<NavigableTask[]>;
  getSiblings(): Promise<NavigableTask[]>;
  getSubtasks(): Promise<NavigableTask[]>;
  getParent(): Promise<NavigableTask | null>;
  
  // Time tracking
  getTimeEntries(): Promise<NavigableTimeEntry[]>;
  getTotalTimeSpent(): Promise<number>;
  
  // Utility methods
  isOverdue(): boolean;
  isHighPriority(): boolean;
  getProgressPercentage(): number;
  
  // Client reference for API calls
  _client: RocketlaneClient;
}

export interface NavigableProject extends Project {
  // Task navigation
  getTasks(params?: Omit<TasksQueryParams, 'projectId'>): Promise<NavigableTask[]>;
  getOverdueTasks(): Promise<NavigableTask[]>;
  getTasksByPhase(phaseId: number): Promise<NavigableTask[]>;
  getTasksByAssignee(userId: number): Promise<NavigableTask[]>;
  
  // Phase navigation
  getPhases(): Promise<NavigablePhase[]>;
  getActivePhases(): Promise<NavigablePhase[]>;
  
  // Team navigation
  getTeamMembers(): Promise<NavigableUser[]>;
  getOwner(): Promise<NavigableUser>;
  
  // Time tracking
  getTimeEntries(params?: Omit<TimeEntriesQueryParams, 'projectId'>): Promise<NavigableTimeEntry[]>;
  getTotalTimeSpent(): Promise<number>;
  
  // Analytics
  getCompletionPercentage(): Promise<number>;
  getProjectHealth(): Promise<ProjectHealth>;
  
  // Client reference
  _client: RocketlaneClient;
}

export interface NavigableUser extends User {
  // Task navigation
  getAssignedTasks(params?: Omit<TasksQueryParams, 'assigneeId'>): Promise<NavigableTask[]>;
  getFollowedTasks(): Promise<NavigableTask[]>;
  getOverdueTasks(): Promise<NavigableTask[]>;
  
  // Project navigation
  getProjects(): Promise<NavigableProject[]>;
  getOwnedProjects(): Promise<NavigableProject[]>;
  
  // Time tracking
  getTimeEntries(params?: Omit<TimeEntriesQueryParams, 'userId'>): Promise<NavigableTimeEntry[]>;
  getTotalHoursThisWeek(): Promise<number>;
  getTotalHoursThisMonth(): Promise<number>;
  
  // Workload analysis
  getWorkloadAnalysis(dateFrom: string, dateTo: string): Promise<WorkloadAnalysis>;
  
  // Client reference
  _client: RocketlaneClient;
}

export interface NavigablePhase extends Phase {
  // Task navigation
  getTasks(params?: Omit<TasksQueryParams, 'phaseId'>): Promise<NavigableTask[]>;
  getCompletedTasks(): Promise<NavigableTask[]>;
  getPendingTasks(): Promise<NavigableTask[]>;
  
  // Project navigation
  getProject(): Promise<NavigableProject>;
  
  // Phase sequence navigation
  getNextPhase(): Promise<NavigablePhase | null>;
  getPreviousPhase(): Promise<NavigablePhase | null>;
  
  // Analytics
  getCompletionPercentage(): Promise<number>;
  getEstimatedTimeRemaining(): Promise<number>;
  
  // Client reference
  _client: RocketlaneClient;
}

export interface NavigableTimeEntry extends TimeEntry {
  // Related entity navigation
  getProject(): Promise<NavigableProject>;
  getPhase(): Promise<NavigablePhase | null>;
  getTask(): Promise<NavigableTask | null>;
  getUser(): Promise<NavigableUser>;
  
  // Client reference
  _client: RocketlaneClient;
}

// Analytics types
export interface ProjectHealth {
  overallScore: number; // 0-100
  tasksOnTrack: number;
  tasksAtRisk: number;
  tasksOverdue: number;
  teamUtilization: number;
  budgetUtilization?: number;
  estimatedCompletionDate?: string;
  risks: string[];
  recommendations: string[];
}

export interface WorkloadAnalysis {
  totalHours: number;
  averageHoursPerDay: number;
  peakDays: Array<{ date: string; hours: number }>;
  projectBreakdown: Array<{ project: string; hours: number; percentage: number }>;
  utilizationScore: number; // 0-100
  recommendations: string[];
}

// Factory class to create navigable objects
export class NavigableObjectFactory {
  constructor(private client: RocketlaneClient) {}

  createNavigableTask(task: Task): NavigableTask {
    const navigableTask = task as NavigableTask;
    navigableTask._client = this.client;

    // Project navigation
    navigableTask.getProject = async () => {
      const project = await this.client.projects.get(task.project.projectId);
      return this.createNavigableProject(project);
    };

    // Phase navigation
    navigableTask.getPhase = async () => {
      if (!task.phase) return null;
      const phase = await this.client.phases.getPhase(task.phase.phaseId);
      return this.createNavigablePhase(phase);
    };

    // User navigation
    navigableTask.getAssignees = async () => {
      if (!task.assignees) return [];
      const users = await Promise.all(
        task.assignees.map(assignee => this.client.users.getUser(assignee.userId))
      );
      return users.map((user: any) => this.createNavigableUser(user));
    };

    navigableTask.getFollowers = async () => {
      if (!task.followers) return [];
      const users = await Promise.all(
        task.followers.map(follower => this.client.users.getUser(follower.userId))
      );
      return users.map((user: any) => this.createNavigableUser(user));
    };

    navigableTask.getCreatedBy = async () => {
      const user = await this.client.users.getUser(task.createdBy.userId);
      return this.createNavigableUser(user);
    };

    navigableTask.getUpdatedBy = async () => {
      const user = await this.client.users.getUser(task.updatedBy.userId);
      return this.createNavigableUser(user);
    };

    // Related tasks
    navigableTask.getDependencies = async () => {
      if (!task.dependencies) return [];
      const tasks = await Promise.all(
        task.dependencies.map((dep: any) => this.client.tasks.get(dep.dependentTaskId))
      );
      return tasks.map((t: any) => this.createNavigableTask(t));
    };

    navigableTask.getDependents = async () => {
      // Find tasks that depend on this task
      const allTasks = await this.client.tasks.getAllTasks({
        projectId: task.project.projectId
      });
      const dependents = allTasks.filter((t: any) => 
        t.dependencies?.some((dep: any) => dep.dependentTaskId === task.taskId)
      );
      return dependents.map((t: any) => this.createNavigableTask(t));
    };

    navigableTask.getSiblings = async () => {
      let params: TasksQueryParams = { projectId: task.project.projectId };
      if (task.phase) {
        params.phaseId = task.phase.phaseId;
      }
      
      const siblings = await this.client.tasks.getAllTasks(params);
      return siblings
        .filter((t: any) => t.taskId !== task.taskId)
        .map((t: any) => this.createNavigableTask(t));
    };

    navigableTask.getSubtasks = async () => {
      // Assuming subtasks have a parent field
      const subtasks = await this.client.tasks.getAllTasks({
        projectId: task.project.projectId
        // Would add parentId filter in real implementation
      });
      return subtasks
        .filter((t: any) => t.parent?.taskId === task.taskId)
        .map((t: any) => this.createNavigableTask(t));
    };

    navigableTask.getParent = async () => {
      if (!task.parent) return null;
      const parentTask = await this.client.tasks.get(task.parent.taskId);
      return this.createNavigableTask(parentTask);
    };

    // Time tracking
    navigableTask.getTimeEntries = async () => {
      const entries = await this.client.timeTracking.getAllTimeEntries({
        taskId: task.taskId
      });
      return entries.map(entry => this.createNavigableTimeEntry(entry));
    };

    navigableTask.getTotalTimeSpent = async () => {
      const entries = await navigableTask.getTimeEntries();
      return entries.reduce((total, entry) => total + entry.minutes, 0);
    };

    // Utility methods
    navigableTask.isOverdue = () => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      return dueDate < now && task.status.label !== 'Completed';
    };

    navigableTask.isHighPriority = () => {
      return task.priority ? task.priority.value > 3 : false;
    };

    navigableTask.getProgressPercentage = () => {
      return task.progress || 0;
    };

    return navigableTask;
  }

  createNavigableProject(project: Project): NavigableProject {
    const navigableProject = project as NavigableProject;
    navigableProject._client = this.client;

    // Task navigation
    navigableProject.getTasks = async (params = {}) => {
      const tasks = await this.client.tasks.getAllTasks({
        ...params,
        projectId: project.projectId
      });
      return tasks.map(task => this.createNavigableTask(task));
    };

    navigableProject.getOverdueTasks = async () => {
      const tasks = await navigableProject.getTasks();
      return tasks.filter(task => task.isOverdue());
    };

    navigableProject.getTasksByPhase = async (phaseId: number) => {
      const tasks = await this.client.tasks.getAllTasks({
        projectId: project.projectId,
        phaseId
      });
      return tasks.map(task => this.createNavigableTask(task));
    };

    navigableProject.getTasksByAssignee = async (userId: number) => {
      const tasks = await this.client.tasks.getAllTasks({
        projectId: project.projectId,
        assigneeId: userId
      });
      return tasks.map(task => this.createNavigableTask(task));
    };

    // Phase navigation
    navigableProject.getPhases = async () => {
      const phases = await this.client.phases.getAllPhases({
        projectId: project.projectId
      });
      return phases.map(phase => this.createNavigablePhase(phase));
    };

    navigableProject.getActivePhases = async () => {
      const phases = await navigableProject.getPhases();
      return phases.filter(phase => phase.status !== 'Completed');
    };

    // Team navigation
    navigableProject.getTeamMembers = async () => {
      if (!project.teamMembers) return [];
      const users = await Promise.all(
        project.teamMembers.map(member => this.client.users.getUser(member.userId))
      );
      return users.map((user: any) => this.createNavigableUser(user));
    };

    navigableProject.getOwner = async () => {
      const user = await this.client.users.getUser(project.owner.userId);
      return this.createNavigableUser(user);
    };

    // Time tracking
    navigableProject.getTimeEntries = async (params = {}) => {
      const entries = await this.client.timeTracking.getAllTimeEntries({
        ...params,
        projectId: project.projectId
      });
      return entries.map(entry => this.createNavigableTimeEntry(entry));
    };

    navigableProject.getTotalTimeSpent = async () => {
      const entries = await navigableProject.getTimeEntries();
      return entries.reduce((total, entry) => total + entry.minutes, 0);
    };

    // Analytics
    navigableProject.getCompletionPercentage = async () => {
      const tasks = await navigableProject.getTasks();
      if (tasks.length === 0) return 0;
      
      const completedTasks = tasks.filter(task => task.status.label === 'Completed');
      return Math.round((completedTasks.length / tasks.length) * 100);
    };

    navigableProject.getProjectHealth = async (): Promise<ProjectHealth> => {
      const tasks = await navigableProject.getTasks();
      const overdueTasks = tasks.filter(task => task.isOverdue());
      const highPriorityTasks = tasks.filter(task => task.isHighPriority());
      const completedTasks = tasks.filter(task => task.status.label === 'Completed');

      const overallScore = Math.max(0, 100 - (overdueTasks.length * 10) - (highPriorityTasks.length * 5));

      return {
        overallScore,
        tasksOnTrack: tasks.length - overdueTasks.length - highPriorityTasks.length,
        tasksAtRisk: highPriorityTasks.length,
        tasksOverdue: overdueTasks.length,
        teamUtilization: 75, // Would calculate based on time entries
        risks: overdueTasks.length > 0 ? ['Overdue tasks detected'] : [],
        recommendations: overallScore < 70 ? ['Review task priorities and deadlines'] : []
      };
    };

    return navigableProject;
  }

  createNavigableUser(user: User): NavigableUser {
    const navigableUser = user as NavigableUser;
    navigableUser._client = this.client;

    // Task navigation
    navigableUser.getAssignedTasks = async (params = {}) => {
      const tasks = await this.client.tasks.getAllTasks({
        ...params,
        assigneeId: user.userId
      });
      return tasks.map(task => this.createNavigableTask(task));
    };

    navigableUser.getFollowedTasks = async () => {
      // Would need to implement a way to find tasks where user is a follower
      // This is a simplified implementation
      const allTasks = await this.client.tasks.getAllTasks();
      const followedTasks = allTasks.filter(task => 
        task.followers?.some(follower => follower.userId === user.userId)
      );
      return followedTasks.map(task => this.createNavigableTask(task));
    };

    navigableUser.getOverdueTasks = async () => {
      const tasks = await navigableUser.getAssignedTasks();
      return tasks.filter(task => task.isOverdue());
    };

    // Project navigation
    navigableUser.getProjects = async () => {
      // Find projects where user is a team member or owner
      const allProjects = await this.client.projects.getAllProjects();
      const userProjects = allProjects.filter((project: any) => 
        project.owner.userId === user.userId ||
        project.teamMembers?.some((member: any) => member.userId === user.userId)
      );
      return userProjects.map((project: any) => this.createNavigableProject(project));
    };

    navigableUser.getOwnedProjects = async () => {
      const projects = await this.client.projects.getAllProjects({
        ownerId: user.userId
      });
      return projects.map((project: any) => this.createNavigableProject(project));
    };

    // Time tracking
    navigableUser.getTimeEntries = async (params = {}) => {
      const entries = await this.client.timeTracking.getAllTimeEntries({
        ...params,
        userId: user.userId
      });
      return entries.map(entry => this.createNavigableTimeEntry(entry));
    };

    navigableUser.getTotalHoursThisWeek = async () => {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const entries = await navigableUser.getTimeEntries({
        dateFrom: startOfWeek.toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0]
      });
      
      return Math.round(entries.reduce((total, entry) => total + entry.minutes, 0) / 60);
    };

    navigableUser.getTotalHoursThisMonth = async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const entries = await navigableUser.getTimeEntries({
        dateFrom: startOfMonth.toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0]
      });
      
      return Math.round(entries.reduce((total, entry) => total + entry.minutes, 0) / 60);
    };

    // Workload analysis
    navigableUser.getWorkloadAnalysis = async (dateFrom: string, dateTo: string): Promise<WorkloadAnalysis> => {
      const entries = await navigableUser.getTimeEntries({ dateFrom, dateTo });
      const totalMinutes = entries.reduce((total, entry) => total + entry.minutes, 0);
      const totalHours = Math.round(totalMinutes / 60);
      
      // Calculate date range
      const start = new Date(dateFrom);
      const end = new Date(dateTo);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      
      return {
        totalHours,
        averageHoursPerDay: Math.round((totalHours / daysDiff) * 10) / 10,
        peakDays: [], // Would calculate peak days
        projectBreakdown: [], // Would calculate project breakdown
        utilizationScore: Math.min(100, (totalHours / (daysDiff * 8)) * 100), // Assuming 8-hour days
        recommendations: totalHours < daysDiff * 4 ? ['Consider increasing workload'] : []
      };
    };

    return navigableUser;
  }

  createNavigablePhase(phase: Phase): NavigablePhase {
    const navigablePhase = phase as NavigablePhase;
    navigablePhase._client = this.client;

    // Implementation would be similar to above patterns
    // Shortened for brevity, but would include all navigation methods

    return navigablePhase;
  }

  createNavigableTimeEntry(entry: TimeEntry): NavigableTimeEntry {
    const navigableEntry = entry as NavigableTimeEntry;
    navigableEntry._client = this.client;

    // Implementation would include navigation to related entities
    // Shortened for brevity

    return navigableEntry;
  }
}