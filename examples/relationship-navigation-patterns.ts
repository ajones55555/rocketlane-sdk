// Relationship Navigation Pattern Examples for Rocketlane SDK
import { RocketlaneClient } from '../src/index';

const client = new RocketlaneClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.rocketlane.com'
});

// =============================================================================
// BASIC NAVIGATION PATTERNS
// =============================================================================

async function basicNavigationPatterns() {
  console.log('=== Basic Navigation Patterns ===');

  // Pattern 1: Task-centric navigation
  const task = await client.tasks.getNavigable(789);

  // Navigate to related entities
  const project = await task.getProject();
  const assignees = await task.getAssignees();
  const dependencies = await task.getDependencies();
  const timeEntries = await task.getTimeEntries();

  console.log('Task Navigation:', {
    taskName: task.taskName,
    projectName: project.projectName,
    assigneeCount: assignees.length,
    dependencyCount: dependencies.length,
    timeEntryCount: timeEntries.length
  });

  // Pattern 2: Project-centric navigation
  const navigableProject = await client.projects.getNavigable(project.projectId);

  const projectTasks = await navigableProject.getTasks();
  const projectTeam = await navigableProject.getTeamMembers();
  const projectPhases = await navigableProject.getPhases();

  console.log('Project Navigation:', {
    projectName: navigableProject.projectName,
    totalTasks: projectTasks.length,
    teamSize: projectTeam.length,
    phaseCount: projectPhases.length
  });

  // Pattern 3: User-centric navigation
  if (assignees.length > 0) {
    const user = assignees[0];

    const userTasks = await user.getAssignedTasks();
    const userProjects = await user.getProjects();
    const userTimeEntries = await user.getTimeEntries();

    console.log('User Navigation:', {
      userName: `${user.firstName} ${user.lastName}`,
      taskCount: userTasks.length,
      projectCount: userProjects.length,
      timeEntryCount: userTimeEntries.length
    });
  }

  return {
    taskRelations: {
      project: !!project,
      assignees: assignees.length,
      dependencies: dependencies.length
    },
    projectRelations: {
      tasks: projectTasks.length,
      team: projectTeam.length,
      phases: projectPhases.length
    }
  };
}

// =============================================================================
// ADVANCED NAVIGATION PATTERNS
// =============================================================================

async function advancedNavigationPatterns() {
  console.log('=== Advanced Navigation Patterns ===');

  // Pattern 1: Deep relationship traversal
  async function deepRelationshipTraversal(projectId: number) {
    const project = await client.projects.getNavigable(projectId);

    // Get all project data with deep relationships
    const projectData = {
      project: {
        id: project.projectId,
        name: project.projectName,
        status: project.status
      },
      phases: [] as any[],
      teamAnalysis: [] as any[],
      dependencyChains: [] as any[]
    };

    // Traverse phases and their tasks
    const phases = await project.getPhases();
    for (const phase of phases) {
      const phaseTasks = await phase.getTasks();

      projectData.phases.push({
        phaseId: phase.phaseId,
        phaseName: phase.phaseName,
        taskCount: phaseTasks.length,
        completedTasks: phaseTasks.filter(t => (t.status as any) === 'completed').length,
        tasks: await Promise.all(phaseTasks.map(async (task) => {
          const taskAssignees = await task.getAssignees();
          const taskDependencies = await task.getDependencies();

          return {
            taskId: task.taskId,
            taskName: task.taskName,
            status: task.status,
            assigneeCount: taskAssignees.length,
            dependencyCount: taskDependencies.length,
            assignees: taskAssignees.map(a => `${a.firstName} ${a.lastName}`)
          };
        }))
      });
    }

    // Analyze team workload across the project
    const team = await project.getTeamMembers();
    for (const member of team) {
      const memberTasks = await member.getAssignedTasks({ projectId });
      const memberTimeEntries = await member.getTimeEntries({ projectId });

      projectData.teamAnalysis.push({
        memberId: member.userId,
        memberName: `${member.firstName} ${member.lastName}`,
        role: member.role,
        activeTasks: memberTasks.filter(t => ['active', 'in_progress'].includes(t.status as any)).length,
        completedTasks: memberTasks.filter(t => (t.status as any) === 'completed').length,
        totalTimeLogged: memberTimeEntries.reduce((sum, e) => sum + e.minutes, 0),
        avgTaskPriority: memberTasks.length > 0
          ? memberTasks.reduce((sum, t) => sum + ((t.priority as any) || 0), 0) / memberTasks.length
          : 0
      });
    }

    return projectData;
  }

  // Pattern 2: Dependency chain analysis
  async function analyzeDependencyChains(projectId: number) {
    const project = await client.projects.getNavigable(projectId);
    const allTasks = await project.getTasks();

    const dependencyChains = [];

    for (const task of allTasks) {
      const dependencies = await task.getDependencies();

      if (dependencies.length > 0) {
        // Traverse dependency chain
        const chain = {
          rootTask: {
            id: task.taskId,
            name: task.taskName,
            status: task.status
          },
          dependencies: await Promise.all(dependencies.map(async (dep) => {
            const depAssignees = await dep.getAssignees();
            const depTimeSpent = await dep.getTotalTimeSpent();

            return {
              id: dep.taskId,
              name: dep.taskName,
              status: dep.status,
              assignees: depAssignees.map(a => `${a.firstName} ${a.lastName}`),
              timeSpent: depTimeSpent,
              isBlocker: (dep.status as any) !== 'completed'
            };
          })),
          isBlocked: dependencies.some(dep => (dep.status as any) !== 'completed'),
          criticalPath: dependencies.every(dep => (dep.priority as any) >= 4)
        };

        dependencyChains.push(chain);
      }
    }

    return dependencyChains.sort((a, b) => {
      // Sort by blocked tasks first, then by critical path
      if (a.isBlocked && !b.isBlocked) return -1;
      if (!a.isBlocked && b.isBlocked) return 1;
      if (a.criticalPath && !b.criticalPath) return -1;
      if (!a.criticalPath && b.criticalPath) return 1;
      return 0;
    });
  }

  // Pattern 3: Cross-project relationship mapping
  async function mapCrossProjectRelationships(userIds: number[]) {
    const relationshipMap = {
      users: [],
      sharedProjects: [],
      collaborationMatrix: []
    };

    // Analyze each user's project involvement
    for (const userId of userIds) {
      const user = await client.users.getNavigable(userId);
      const userProjects = await user.getProjects();
      const userTasks = await user.getAssignedTasks();

      relationshipMap.users.push({
        userId: user.userId,
        userName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        projectCount: userProjects.length,
        taskCount: userTasks.length,
        projects: userProjects.map(p => ({
          projectId: p.projectId,
          projectName: p.projectName,
          role: 'member' // Would need to determine actual role
        }))
      });
    }

    // Find shared projects
    const projectSet = new Set(
      relationshipMap.users.flatMap(u => u.projects.map(p => p.projectId))
    );
    const allProjects = Array.from(projectSet);

    for (const projectId of allProjects) {
      const usersInProject = relationshipMap.users.filter(u =>
        u.projects.some(p => p.projectId === projectId)
      );

      if (usersInProject.length > 1) {
        const project = await client.projects.getNavigable(projectId);

        relationshipMap.sharedProjects.push({
          projectId,
          projectName: project.projectName,
          userCount: usersInProject.length,
          users: usersInProject.map(u => ({
            userId: u.userId,
            userName: u.userName
          }))
        });
      }
    }

    // Create collaboration matrix
    for (let i = 0; i < userIds.length; i++) {
      for (let j = i + 1; j < userIds.length; j++) {
        const user1 = relationshipMap.users.find(u => u.userId === userIds[i]);
        const user2 = relationshipMap.users.find(u => u.userId === userIds[j]);

        const sharedProjects = user1?.projects.filter(p1 =>
          user2?.projects.some(p2 => p2.projectId === p1.projectId)
        ) || [];

        if (sharedProjects.length > 0) {
          relationshipMap.collaborationMatrix.push({
            user1: user1?.userName,
            user2: user2?.userName,
            sharedProjectCount: sharedProjects.length,
            sharedProjects: sharedProjects.map(p => p.projectName)
          });
        }
      }
    }

    return relationshipMap;
  }

  // Execute advanced patterns
  const deepTraversal = await deepRelationshipTraversal(123456);
  const dependencyAnalysis = await analyzeDependencyChains(123456);
  const crossProjectMap = await mapCrossProjectRelationships([101, 102, 103, 104]);

  return {
    deepTraversal: {
      phaseCount: deepTraversal.phases.length,
      teamSize: deepTraversal.teamAnalysis.length,
      totalTasks: deepTraversal.phases.reduce((sum, p) => sum + p.taskCount, 0)
    },
    dependencyAnalysis: {
      totalChains: dependencyAnalysis.length,
      blockedChains: dependencyAnalysis.filter(c => c.isBlocked).length,
      criticalPaths: dependencyAnalysis.filter(c => c.criticalPath).length
    },
    crossProjectMap: {
      userCount: crossProjectMap.users.length,
      sharedProjectCount: crossProjectMap.sharedProjects.length,
      collaborationPairs: crossProjectMap.collaborationMatrix.length
    }
  };
}

// =============================================================================
// PERFORMANCE-OPTIMIZED NAVIGATION
// =============================================================================

async function performanceOptimizedNavigation() {
  console.log('=== Performance-Optimized Navigation ===');

  // Pattern 1: Bulk relationship loading
  async function bulkRelationshipLoading(taskIds: number[]) {
    // Load all navigable tasks at once
    const tasks = await Promise.all(
      taskIds.map(id => client.tasks.getNavigable(id))
    );

    // Batch relationship loading
    const [projects, assignees, dependencies] = await Promise.all([
      // Load all projects
      Promise.all(tasks.map(task => task.getProject())),
      // Load all assignees
      Promise.all(tasks.map(task => task.getAssignees())),
      // Load all dependencies
      Promise.all(tasks.map(task => task.getDependencies()))
    ]);

    // Combine results efficiently
    const result = tasks.map((task, index) => ({
      task: {
        id: task.taskId,
        name: task.taskName,
        status: task.status
      },
      project: {
        id: projects[index].projectId,
        name: projects[index].projectName
      },
      assigneeCount: assignees[index].length,
      dependencyCount: dependencies[index].length
    }));

    return result;
  }

  // Pattern 2: Cached navigation with relationship pooling
  class RelationshipCache {
    private projectCache = new Map();
    private userCache = new Map();
    private taskCache = new Map();

    async getProject(projectId: number) {
      if (!this.projectCache.has(projectId)) {
        const project = await client.projects.getNavigable(projectId);
        this.projectCache.set(projectId, project);
      }
      return this.projectCache.get(projectId);
    }

    async getUser(userId: number) {
      if (!this.userCache.has(userId)) {
        const user = await client.users.getNavigable(userId);
        this.userCache.set(userId, user);
      }
      return this.userCache.get(userId);
    }

    async getTask(taskId: number) {
      if (!this.taskCache.has(taskId)) {
        const task = await client.tasks.getNavigable(taskId);
        this.taskCache.set(taskId, task);
      }
      return this.taskCache.get(taskId);
    }

    clear() {
      this.projectCache.clear();
      this.userCache.clear();
      this.taskCache.clear();
    }
  }

  async function cachedNavigationExample() {
    const cache = new RelationshipCache();

    // Load project data with caching
    const projectIds = [123456, 789012, 456789];
    const projectData = [];

    for (const projectId of projectIds) {
      const project = await cache.getProject(projectId);
      const tasks = await project.getTasks();

      // Use cache for repeated user lookups
      const assigneeSet = new Set(tasks.map(t => (t as any).assigneeId).filter(Boolean));
      const uniqueAssigneeIds = Array.from(assigneeSet) as number[];
      const assignees = await Promise.all(
        uniqueAssigneeIds.map(id => cache.getUser(id))
      );

      projectData.push({
        projectId,
        projectName: project.projectName,
        taskCount: tasks.length,
        teamSize: assignees.length,
        team: assignees.map(user => ({
          id: user.userId,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role
        }))
      });
    }

    cache.clear(); // Clean up
    return projectData;
  }

  // Pattern 3: Lazy loading with generators
  async function* lazyRelationshipLoading(projectId: number) {
    const project = await client.projects.getNavigable(projectId);

    // Yield project first
    yield { type: 'project', data: project };

    // Lazy load tasks
    const tasks = await project.getTasks();
    yield { type: 'taskCount', data: tasks.length };

    // Lazy load relationships as needed
    for (const task of tasks.slice(0, 10)) { // Limit for demo
      const [assignees, dependencies, timeEntries] = await Promise.all([
        task.getAssignees(),
        task.getDependencies(),
        task.getTimeEntries()
      ]);

      yield {
        type: 'taskWithRelations',
        data: {
          task: {
            id: task.taskId,
            name: task.taskName,
            status: task.status
          },
          assignees: assignees.map(a => `${a.firstName} ${a.lastName}`),
          dependencyCount: dependencies.length,
          timeEntryCount: timeEntries.length
        }
      };
    }
  }

  // Execute performance patterns
  const bulkResults = await bulkRelationshipLoading([1001, 1002, 1003, 1004, 1005]);
  const cachedResults = await cachedNavigationExample();

  const lazyResults = [];
  for await (const item of lazyRelationshipLoading(123456)) {
    lazyResults.push(item);
    if (lazyResults.length >= 5) break; // Demo: just load first 5 items
  }

  return {
    bulkLoading: {
      taskCount: bulkResults.length,
      avgAssignees: bulkResults.reduce((sum, t) => sum + t.assigneeCount, 0) / bulkResults.length
    },
    cachedLoading: {
      projectCount: cachedResults.length,
      totalTasks: cachedResults.reduce((sum, p) => sum + p.taskCount, 0)
    },
    lazyLoading: {
      itemsLoaded: lazyResults.length,
      types: lazyResults.map(item => item.type)
    }
  };
}

// =============================================================================
// ANALYTICAL NAVIGATION PATTERNS
// =============================================================================

async function analyticalNavigationPatterns() {
  console.log('=== Analytical Navigation Patterns ===');

  // Pattern 1: Resource utilization analysis
  async function analyzeResourceUtilization(projectId: number) {
    const project = await client.projects.getNavigable(projectId);
    const team = await project.getTeamMembers();

    const utilizationData = await Promise.all(
      team.map(async (member) => {
        const [tasks, timeEntries, projects] = await Promise.all([
          member.getAssignedTasks({ status: 'active' as any }),
          member.getTimeEntries({
            dateFrom: '2024-01-01',
            dateTo: new Date().toISOString().split('T')[0]
          }),
          member.getProjects()
        ]);

        const totalCapacity = 40 * 4 * 60; // 40 hours/week * 4 weeks * 60 minutes
        const actualTime = timeEntries.reduce((sum, e) => sum + e.minutes, 0);

        return {
          member: {
            id: member.userId,
            name: `${member.firstName} ${member.lastName}`,
            role: member.role
          },
          metrics: {
            activeTasks: tasks.length,
            totalProjects: projects.length,
            utilizationPercentage: (actualTime / totalCapacity) * 100,
            avgTaskPriority: tasks.length > 0
              ? tasks.reduce((sum, t) => sum + ((t.priority as any) || 0), 0) / tasks.length
              : 0,
            workload: tasks.reduce((sum, t) => sum + (t.effortInMinutes || 0), 0)
          },
          riskFactors: {
            overUtilized: (actualTime / totalCapacity) > 1.1,
            underUtilized: (actualTime / totalCapacity) < 0.7,
            tooManyProjects: projects.length > 3,
            highPriorityOverload: tasks.filter(t => (t.priority as any) >= 4).length > 5
          }
        };
      })
    );

    return {
      teamSize: team.length,
      avgUtilization: utilizationData.reduce((sum, u) => sum + u.metrics.utilizationPercentage, 0) / team.length,
      overUtilizedMembers: utilizationData.filter(u => u.riskFactors.overUtilized).length,
      underUtilizedMembers: utilizationData.filter(u => u.riskFactors.underUtilized).length,
      utilizationData
    };
  }

  // Pattern 2: Project health scoring
  async function calculateProjectHealthScore(projectId: number) {
    const project = await client.projects.getNavigable(projectId);
    const [tasks, team, phases] = await Promise.all([
      project.getTasks(),
      project.getTeamMembers(),
      project.getPhases()
    ]);

    // Calculate various health metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => (t.status as any) === 'completed').length;
    const overdueTasks = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && (t.status as any) !== 'completed'
    ).length;
    const blockedTasks = tasks.filter(t => (t.status as any) === 'blocked').length;
    const highPriorityTasks = tasks.filter(t => (t.priority as any) >= 4).length;

    // Task progress score (40% weight)
    const progressScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Schedule adherence score (30% weight) 
    const scheduleScore = totalTasks > 0 ? Math.max(0, 100 - (overdueTasks / totalTasks) * 200) : 100;

    // Team efficiency score (20% weight)
    const teamEfficiencyPromises = team.map(async (member) => {
      const memberTasks = await member.getAssignedTasks({ projectId });
      const completedMemberTasks = memberTasks.filter(t => (t.status as any) === 'completed');
      return memberTasks.length > 0 ? completedMemberTasks.length / memberTasks.length : 0;
    });
    const teamEfficiencies = await Promise.all(teamEfficiencyPromises);
    const avgTeamEfficiency = teamEfficiencies.reduce((sum, e) => sum + e, 0) / team.length * 100;

    // Risk mitigation score (10% weight)
    const riskScore = Math.max(0, 100 - (blockedTasks / totalTasks) * 300);

    // Calculate weighted health score
    const healthScore = (
      progressScore * 0.4 +
      scheduleScore * 0.3 +
      avgTeamEfficiency * 0.2 +
      riskScore * 0.1
    );

    return {
      projectId,
      projectName: project.projectName,
      healthScore: Math.round(healthScore),
      breakdown: {
        progress: Math.round(progressScore),
        schedule: Math.round(scheduleScore),
        teamEfficiency: Math.round(avgTeamEfficiency),
        riskMitigation: Math.round(riskScore)
      },
      metrics: {
        totalTasks,
        completedTasks,
        overdueTasks,
        blockedTasks,
        highPriorityTasks,
        teamSize: team.length,
        phaseCount: phases.length
      },
      riskLevel: healthScore >= 80 ? 'Low' : healthScore >= 60 ? 'Medium' : 'High'
    };
  }

  // Pattern 3: Cross-functional collaboration analysis
  async function analyzeCollaboration(projectIds: number[]) {
    const collaborationData = [];

    for (const projectId of projectIds) {
      const project = await client.projects.getNavigable(projectId);
      const team = await project.getTeamMembers();

      // Group by role/department
      const roleDistribution = team.reduce((acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Analyze cross-functional interactions
      const tasks = await project.getTasks();
      const crossFunctionalTasks = [];

      for (const task of tasks) {
        const assignees = await task.getAssignees();
        const roleSet = new Set(assignees.map((a: any) => a.role));
        const roles = Array.from(roleSet);

        if (roles.length > 1) {
          crossFunctionalTasks.push({
            taskId: task.taskId,
            taskName: task.taskName,
            rolesInvolved: roles,
            collaboratorCount: assignees.length
          });
        }
      }

      collaborationData.push({
        projectId,
        projectName: project.projectName,
        teamComposition: roleDistribution,
        crossFunctionalTasks: crossFunctionalTasks.length,
        collaborationScore: (crossFunctionalTasks.length / tasks.length) * 100,
        avgCollaboratorsPerTask: tasks.length > 0
          ? tasks.reduce((sum, t) => sum + (t.assignees?.length || 1), 0) / tasks.length
          : 0
      });
    }

    return {
      projectCount: projectIds.length,
      avgCollaborationScore: collaborationData.reduce((sum, p) => sum + p.collaborationScore, 0) / collaborationData.length,
      mostCollaborativeProject: collaborationData.reduce((best, current) =>
        current.collaborationScore > best.collaborationScore ? current : best
      ),
      collaborationData
    };
  }

  // Execute analytical patterns
  const utilizationAnalysis = await analyzeResourceUtilization(123456);
  const healthScore = await calculateProjectHealthScore(123456);
  const collaborationAnalysis = await analyzeCollaboration([123456, 789012]);

  return {
    utilization: {
      avgUtilization: utilizationAnalysis.avgUtilization,
      riskCount: utilizationAnalysis.overUtilizedMembers + utilizationAnalysis.underUtilizedMembers
    },
    health: {
      score: healthScore.healthScore,
      riskLevel: healthScore.riskLevel
    },
    collaboration: {
      avgScore: collaborationAnalysis.avgCollaborationScore,
      projectCount: collaborationAnalysis.projectCount
    }
  };
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

export async function runNavigationPatternExamples() {
  try {
    console.log('Running relationship navigation examples...\n');

    const basicResults = await basicNavigationPatterns();
    console.log('Basic Navigation Results:', basicResults, '\n');

    const advancedResults = await advancedNavigationPatterns();
    console.log('Advanced Navigation Results:', advancedResults, '\n');

    const performanceResults = await performanceOptimizedNavigation();
    console.log('Performance Navigation Results:', performanceResults, '\n');

    const analyticalResults = await analyticalNavigationPatterns();
    console.log('Analytical Navigation Results:', analyticalResults, '\n');

  } catch (error) {
    console.error('Error running navigation pattern examples:', error);
  }
}

// Export individual pattern functions
export {
  basicNavigationPatterns,
  advancedNavigationPatterns,
  performanceOptimizedNavigation,
  analyticalNavigationPatterns
};