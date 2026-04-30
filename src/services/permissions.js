export function userById(db, userId) {
  return db.users.find(user => user.id === userId) || null;
}

export function teamById(db, teamId) {
  return db.teams.find(team => team.id === teamId) || null;
}

export function projectById(db, projectId) {
  return db.projects.find(project => project.id === projectId) || null;
}

export function teamRoleOf(db, userId, teamId) {
  const team = teamById(db, teamId);
  return team?.members?.find(member => member.userId === userId)?.role || null;
}

export function projectRoleOf(db, userId, projectId) {
  const project = projectById(db, projectId);
  if (!project) return null;
  return project.access?.find(entry => entry.userId === userId)?.role || null;
}

export function rolesForContext(db, user, context = {}) {
  if (!user) return [];
  const roles = new Set();
  if (user.platformRole) roles.add(user.platformRole);

  if (context.teamId) {
    const teamRole = teamRoleOf(db, user.id, context.teamId);
    if (teamRole) roles.add(teamRole);
  }

  if (context.projectId) {
    const project = projectById(db, context.projectId);
    if (project) {
      const teamRole = teamRoleOf(db, user.id, project.teamId);
      if (teamRole) roles.add(teamRole);
      const projectRole = projectRoleOf(db, user.id, context.projectId);
      if (projectRole) roles.add(projectRole);
    }
  }

  return [...roles];
}

export function hasPermission(db, user, permission, context = {}) {
  if (!user || user.status === 'blocked') return false;
  if (user.platformRole === 'superadmin') return true;
  const roles = rolesForContext(db, user, context);
  return roles.some(role => Boolean(db.rolePermissions?.[role]?.[permission]));
}

export function canViewTeam(db, user, teamId) {
  if (!user) return false;
  if (user.platformRole === 'superadmin') return true;
  if (hasPermission(db, user, 'team.viewAllPlatform')) return true;
  return Boolean(teamRoleOf(db, user.id, teamId));
}

export function canViewProject(db, user, projectId) {
  const project = projectById(db, projectId);
  if (!project || !user) return false;
  if (user.platformRole === 'superadmin') return true;
  if (hasPermission(db, user, 'team.project.viewList', { teamId: project.teamId })) return true;
  if (projectRoleOf(db, user.id, projectId)) {
    return hasPermission(db, user, 'project.view', { projectId });
  }
  return false;
}

export function isTaskOwnedBy(user, item) {
  if (!user || !item) return false;
  return item.ownerId === user.id || (item.people || []).includes(user.id);
}

export function isPlatformAdmin(user) {
  return Boolean(user && ['superadmin', 'admin'].includes(user.platformRole));
}

export function projectRoleForItem(db, user, item) {
  if (!user || !item) return null;
  return projectRoleOf(db, user.id, item.projectId);
}

export function canEditTask(db, user, item) {
  if (!user || !item || user.status === 'blocked') return false;
  if (isPlatformAdmin(user)) return true;
  const projectRole = projectRoleForItem(db, user, item);
  if (projectRole === 'projectManager') return true;
  if (hasPermission(db, user, 'project.task.editAny', { projectId: item.projectId })) return true;
  return isTaskOwnedBy(user, item) && hasPermission(db, user, 'project.task.editOwn', { projectId: item.projectId });
}

export function canChangeTaskStatus(db, user, item) {
  if (!user || !item || user.status === 'blocked') return false;
  if (isPlatformAdmin(user)) return true;
  const projectRole = projectRoleForItem(db, user, item);
  if (projectRole === 'projectManager') return true;
  if (hasPermission(db, user, 'project.task.statusAny', { projectId: item.projectId })) return true;
  return isTaskOwnedBy(user, item) && hasPermission(db, user, 'project.task.statusOwn', { projectId: item.projectId });
}

export function canManageSubtasks(db, user, item) {
  if (!user || !item || user.status === 'blocked') return false;
  if (isPlatformAdmin(user)) return true;
  const projectRole = projectRoleForItem(db, user, item);
  if (projectRole === 'projectManager') return true;
  if (hasPermission(db, user, 'project.subtask.manageAny', { projectId: item.projectId })) return true;
  return isTaskOwnedBy(user, item) && hasPermission(db, user, 'project.subtask.manageOwn', { projectId: item.projectId });
}

export function visibleTeams(db, user) {
  return db.teams.filter(team => !team.isArchived && canViewTeam(db, user, team.id));
}

export function visibleProjects(db, user, teamId = null) {
  return db.projects.filter(project => !project.isArchived && (!teamId || project.teamId === teamId) && canViewProject(db, user, project.id));
}

export function canModifyPlatformUser(actor, target, action) {
  if (!actor || !target) return false;
  if (actor.id === target.id && action === 'delete') return false;
  if (actor.platformRole === 'superadmin') return true;
  if (target.platformRole === 'superadmin') return false;
  if (target.platformRole === 'admin' && action !== 'edit') return false;
  return actor.platformRole === 'admin';
}
