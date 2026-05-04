import React, { createContext, useContext, useMemo, useState } from 'react';
import { loadData, saveData, getSessionUserId, setSessionUserId, clearSession, resetData as resetStorageData } from '../services/storage.js';
import { uid } from '../shared/utils/ids.js';
import { today } from '../shared/utils/date.js';
import { hasPermission, userById, visibleTeams, visibleProjects, projectById, teamById, canModifyPlatformUser, canEditTask, canChangeTaskStatus, canManageSubtasks, canViewProject, projectRoleOf, rolesForContext } from '../services/permissions.js';

const AppContext = createContext(null);

function addDays(dateString, days = 0) {
  const date = new Date(`${dateString || today()}T00:00:00`);
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
}

const AUDIT_TABLES = [
  ['users', 'Пользователь', ['name', 'email']],
  ['teams', 'Команда', ['name']],
  ['projects', 'Проект', ['title']],
  ['phases', 'Фаза', ['title']],
  ['items', 'Задача', ['title']],
  ['projectTemplates', 'Шаблон', ['title']],
  ['templatePhases', 'Фаза шаблона', ['title']],
  ['templateItems', 'Задача шаблона', ['title']],
  ['dictionaryItems', 'Элемент справочника', ['title', 'code']],
  ['notificationRules', 'Правило уведомления', ['title', 'eventCode']]
];

const FIELD_LABELS = {
  title: 'Название', name: 'Имя', firstName: 'Имя', lastName: 'Фамилия', email: 'Email', password: 'Пароль',
  platformRole: 'Роль платформы', status: 'Статус', role: 'Роль', projectRole: 'Роль проекта', teamRole: 'Роль команды',
  start: 'Старт', due: 'Дедлайн', startDate: 'Старт проекта', dueDate: 'Дедлайн проекта', ownerId: 'Ответственный',
  result: 'Deliverable', desc: 'Описание', category: 'Категория', isArchived: 'Архив', isActive: 'Активен',
  sort: 'Порядок', durationDays: 'Длительность', relativeStartDay: 'Старт +', relativeDueDay: 'Срок +',
  permission: 'Право', isRead: 'Прочитано', readAt: 'Дата прочтения'
};

function titleOf(record, keys = []) {
  if (!record) return '—';
  for (const key of keys) if (record[key]) return record[key];
  return record.title || record.name || record.email || record.id || '—';
}

function valueForAudit(db, key, value) {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'ownerId' || key === 'userId' || key === 'createdBy' || key === 'updatedBy') return db.users?.find(user => user.id === value)?.name || value;
  if (key === 'projectId') return db.projects?.find(project => project.id === value)?.title || value;
  if (key === 'teamId') return db.teams?.find(team => team.id === value)?.name || value;
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (Array.isArray(value)) return value.length ? `${value.length} элементов` : '—';
  if (typeof value === 'object') return 'изменено';
  return String(value);
}

function buildAuditMeta(beforeDb, afterDb, action, meta = {}) {
  const changes = [];
  for (const [table, entityLabel, titleKeys] of AUDIT_TABLES) {
    const before = new Map((beforeDb[table] || []).map(item => [item.id, item]));
    const after = new Map((afterDb[table] || []).map(item => [item.id, item]));
    after.forEach((next, id) => {
      const prev = before.get(id);
      if (!prev) {
        changes.push({ type: 'create', table, entityLabel, entityId: id, title: titleOf(next, titleKeys), fields: [] });
        return;
      }
      const fields = Object.keys(next).filter(key => JSON.stringify(prev[key]) !== JSON.stringify(next[key]) && key !== 'updatedAt').map(key => ({
        key,
        label: FIELD_LABELS[key] || key,
        before: valueForAudit(beforeDb, key, prev[key]),
        after: valueForAudit(afterDb, key, next[key])
      }));
      if (fields.length) changes.push({ type: 'update', table, entityLabel, entityId: id, title: titleOf(next, titleKeys), fields });
    });
    before.forEach((prev, id) => {
      if (!after.has(id)) changes.push({ type: 'delete', table, entityLabel, entityId: id, title: titleOf(prev, titleKeys), fields: [] });
    });
  }
  const main = changes[0];
  const summary = main
    ? `${main.entityLabel}: ${main.title}${main.fields?.length ? ` · ${main.fields.map(field => `${field.label}: ${field.before} → ${field.after}`).join('; ')}` : ''}`
    : (meta.summary || 'Изменение сохранено');
  return { ...meta, summary, changes };
}

function addAudit(beforeDb, afterDb, currentUser, action, meta = {}) {
  const auditMeta = buildAuditMeta(beforeDb, afterDb, action, meta);
  return {
    ...afterDb,
    audit: [
      { id: uid('audit'), date: new Date().toISOString(), userId: currentUser?.id || 'system', action, meta: auditMeta },
      ...(afterDb.audit || [])
    ].slice(0, 500)
  };
}

function snapshotTemplate(db, templateId) {
  return {
    template: db.projectTemplates.find(t => t.id === templateId) || null,
    phases: db.templatePhases.filter(p => p.templateId === templateId),
    items: db.templateItems.filter(i => i.templateId === templateId)
  };
}

function roleMatches(db, user, role, projectId = null, teamId = null) {
  if (!user) return false;
  if (user.platformRole === role) return true;
  if (teamId && teamById(db, teamId)?.members?.some(member => member.userId === user.id && member.role === role)) return true;
  if (projectId && projectRoleOf(db, user.id, projectId) === role) return true;
  return false;
}

function getNotificationRecipients(db, rule, { projectId = null, explicitUserId = null } = {}) {
  if (!rule?.isActive) return [];
  const users = explicitUserId ? db.users.filter(u => u.id === explicitUserId) : db.users.filter(u => u.status !== 'blocked');
  return users.filter(user => {
    if (projectId && rule.respectProjectVisibility && !canViewProject(db, user, projectId)) return false;
    if (!rule.targetRoles?.length) return true;
    const project = projectId ? projectById(db, projectId) : null;
    return rule.targetRoles.some(role => roleMatches(db, user, role, projectId, project?.teamId));
  });
}

export function AppProvider({ children }) {
  const [db, setDbState] = useState(() => loadData());
  const [currentUserId, setCurrentUserId] = useState(() => getSessionUserId());
  const [route, setRoute] = useState({ view: 'projects', teamId: null, projectId: null, tab: 'table', phaseId: null, phaseView: 'selected', itemId: null, search: '' });

  const currentUser = useMemo(() => db.users.find(user => user.id === currentUserId) || null, [db, currentUserId]);

  function setDb(updater, auditAction = null, auditMeta = {}) {
    setDbState(prev => {
      const nextBase = typeof updater === 'function' ? updater(prev) : updater;
      const next = auditAction ? addAudit(prev, nextBase, currentUser, auditAction, auditMeta) : nextBase;
      saveData(next);
      return next;
    });
  }

  function emitNotification(eventCode, payload = {}) {
    setDb(prev => {
      const rule = (prev.notificationRules || []).find(item => item.eventCode === eventCode);
      if (!rule?.isActive) return prev;
      const recipients = getNotificationRecipients(prev, rule, payload);
      const createdAt = new Date().toISOString();
      const notifications = recipients.map(user => ({
        id: uid('n'),
        userId: user.id,
        eventCode,
        projectId: payload.projectId || null,
        entityType: payload.entityType || null,
        entityId: payload.entityId || null,
        title: payload.title || rule.title,
        message: payload.message || rule.title,
        isRead: false,
        createdAt
      }));
      if (!notifications.length) return prev;
      return {
        ...prev,
        notifications: [...notifications, ...(prev.notifications || [])],
        notificationDeliveryLog: [
          ...notifications.map(n => ({ id: uid('ndl'), notificationId: n.id, userId: n.userId, channel: 'inApp', status: 'created', sentAt: createdAt })),
          ...(prev.notificationDeliveryLog || [])
        ].slice(0, 500)
      };
    });
  }

  function login(email, password) {
    const normalized = String(email || '').trim().toLowerCase();
    const user = db.users.find(item => item.email.toLowerCase() === normalized && item.password === password && item.status !== 'blocked');
    if (!user) return { ok: false, message: 'Неверный email или пароль. Доступ выдает администратор.' };
    setSessionUserId(user.id);
    setCurrentUserId(user.id);
    const teams = visibleTeams(db, user);
    setRoute({ view: 'projects', teamId: teams[0]?.id || null, projectId: null, tab: 'table', phaseId: null, phaseView: 'selected', itemId: null, search: '' });
    return { ok: true };
  }

  function logout() {
    clearSession();
    setCurrentUserId(null);
  }

  function resetDemoData() {
    const next = resetStorageData();
    setDbState(next);
    clearSession();
    setCurrentUserId(null);
  }

  function patchRolePermission(role, key, value) {
    if (!currentUser || !hasPermission(db, currentUser, 'system.settings')) return false;
    if (role === 'superadmin') return false;
    setDb(prev => ({
      ...prev,
      rolePermissions: {
        ...prev.rolePermissions,
        [role]: { ...prev.rolePermissions[role], [key]: Boolean(value) }
      }
    }), `Изменено право ${key} для роли ${role}`);
    return true;
  }

  function createUser(payload) {
    if (!hasPermission(db, currentUser, 'user.create')) return { ok: false, message: 'Недостаточно прав.' };
    const email = payload.email.trim().toLowerCase();
    if (db.users.some(user => user.email.toLowerCase() === email)) return { ok: false, message: 'Пользователь с таким email уже есть.' };
    const platformRole = currentUser.platformRole === 'superadmin' ? payload.platformRole : 'user';
    const firstName = (payload.firstName || payload.name || '').trim().split(' ')[0] || '';
    const lastName = (payload.lastName || '').trim();
    const fullName = (payload.name || [firstName, lastName].filter(Boolean).join(' ')).trim();
    const initialsBase = [firstName, lastName].filter(Boolean).join(' ') || fullName;
    const user = {
      id: uid('u'), firstName, lastName, name: fullName, email, password: payload.password || 'demo123',
      initials: payload.initials || initialsBase.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(),
      color: payload.color || 'linear-gradient(135deg,#345F7A,#89A9B8)', platformRole, status: 'active'
    };
    setDb(prev => ({ ...prev, users: [...prev.users, user] }), `Создан пользователь ${user.email}`);
    return { ok: true, user };
  }

  function updateUser(userId, patch) {
    const target = userById(db, userId);
    if (!hasPermission(db, currentUser, 'user.edit') && currentUser?.id !== userId) return false;
    if (currentUser?.id !== userId && !canModifyPlatformUser(currentUser, target, 'edit')) return false;
    const safePatch = { ...patch };
    if (safePatch.platformRole && currentUser?.platformRole !== 'superadmin') delete safePatch.platformRole;
    const firstName = ('firstName' in safePatch) ? safePatch.firstName : (target?.firstName || (target?.name || '').split(' ').slice(0, 1).join(' '));
    const lastName = ('lastName' in safePatch) ? safePatch.lastName : (target?.lastName || (target?.name || '').split(' ').slice(1).join(' '));
    if ('firstName' in safePatch || 'lastName' in safePatch || 'name' in safePatch) {
      safePatch.firstName = firstName;
      safePatch.lastName = lastName;
      safePatch.name = safePatch.name || [firstName, lastName].filter(Boolean).join(' ').trim();
      safePatch.initials = (safePatch.name || '').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
    }
    setDb(prev => ({ ...prev, users: prev.users.map(user => user.id === userId ? { ...user, ...safePatch } : user) }), `Обновлен пользователь ${target?.email || userId}`);
    return true;
  }

  function deleteUser(userId) {
    const target = userById(db, userId);
    if (!hasPermission(db, currentUser, 'user.delete') || !canModifyPlatformUser(currentUser, target, 'delete')) return false;
    setDb(prev => ({
      ...prev,
      users: prev.users.map(user => user.id === userId ? { ...user, status: 'blocked' } : user),
      archive: [{ id: uid('arch'), entityType: 'user', entityId: userId, title: target?.email || userId, archivedBy: currentUser.id, archivedAt: today() }, ...(prev.archive || [])]
    }), `Пользователь деактивирован ${target?.email || userId}`);
    return true;
  }

  function createTeam(payload) {
    if (!hasPermission(db, currentUser, 'team.create')) return false;
    const team = { id: uid('t'), name: payload.name.trim(), color: payload.color || 'linear-gradient(135deg,#245B8F,#48A3B8)', members: [] };
    setDb(prev => ({ ...prev, teams: [...prev.teams, team] }), `Создана команда ${team.name}`);
    return team;
  }

  function updateTeam(teamId, patch) {
    if (!hasPermission(db, currentUser, 'team.settings.rename', { teamId }) && !hasPermission(db, currentUser, 'team.create')) return false;
    setDb(prev => ({ ...prev, teams: prev.teams.map(team => team.id === teamId ? { ...team, ...patch } : team) }), `Изменена команда ${teamId}`);
    return true;
  }

  function deleteTeam(teamId) {
    if (!hasPermission(db, currentUser, 'team.delete', { teamId })) return false;
    const team = teamById(db, teamId);
    setDb(prev => ({
      ...prev,
      teams: prev.teams.map(item => item.id === teamId ? { ...item, isArchived: true } : item),
      archive: [{ id: uid('arch'), entityType: 'team', entityId: teamId, title: team?.name || teamId, archivedBy: currentUser.id, archivedAt: today() }, ...(prev.archive || [])]
    }), `Команда архивирована ${teamId}`);
    return true;
  }

  function setTeamMember(teamId, userId, role) {
    const targetUser = userById(db, userId);
    if (!targetUser || targetUser.platformRole !== 'user') return false;
    const exists = teamById(db, teamId)?.members.some(member => member.userId === userId);
    const permission = exists ? 'team.member.changeRole' : 'team.member.add';
    if (!hasPermission(db, currentUser, permission, { teamId })) return false;
    setDb(prev => ({
      ...prev,
      teams: prev.teams.map(team => team.id !== teamId ? team : {
        ...team,
        members: exists ? team.members.map(member => member.userId === userId ? { ...member, role } : member) : [...team.members, { userId, role }]
      })
    }), `Изменен участник команды ${teamId}`);
    return true;
  }

  function removeTeamMember(teamId, userId) {
    if (!hasPermission(db, currentUser, 'team.member.remove', { teamId })) return false;
    setDb(prev => ({ ...prev, teams: prev.teams.map(team => team.id === teamId ? { ...team, members: team.members.filter(member => member.userId !== userId) } : team) }), `Удален участник из команды ${teamId}`);
    return true;
  }

  function createProject(teamId, payload) {
    if (!hasPermission(db, currentUser, 'team.project.create', { teamId })) return false;
    const project = {
      id: uid('p'), teamId, title: payload.title.trim(), desc: payload.desc || '', status: payload.status || 'new',
      horizon: payload.horizon || '', start: payload.start || today(), due: payload.due || today(), ownerId: payload.managerId || (currentUser.platformRole === 'user' ? currentUser.id : null),
      access: (payload.managerId || currentUser.platformRole === 'user') ? [{ userId: payload.managerId || currentUser.id, role: 'projectManager' }] : [], templateId: payload.templateId || null, isArchived: false
    };
    setDb(prev => ({ ...prev, projects: [...prev.projects, project] }), `Создан проект ${project.title}`);
    return project;
  }

  function createProjectFromTemplate(teamId, templateId, payload) {
    if (!hasPermission(db, currentUser, 'team.project.create', { teamId }) || !hasPermission(db, currentUser, 'template.use', { teamId })) return false;
    const template = db.projectTemplates.find(item => item.id === templateId && !item.isArchived);
    if (!template) return false;
    const start = payload.start || today();
    const templatePhases = db.templatePhases.filter(item => item.templateId === templateId).sort((a, b) => a.sort - b.sort);
    const project = createProject(teamId, { ...payload, title: payload.title || template.title, desc: payload.desc || template.desc, start, templateId });
    if (!project) return false;
    setDb(prev => {
      const phases = templatePhases.map(phase => ({ id: uid('ph'), projectId: project.id, title: phase.title, sort: phase.sort }));
      const phaseMap = Object.fromEntries(templatePhases.map((phase, index) => [phase.id, phases[index].id]));
      const items = prev.templateItems.filter(item => item.templateId === templateId).map(item => ({
        id: uid('i'), projectId: project.id, phaseId: phaseMap[item.templatePhaseId] || phases[0]?.id,
        type: item.type || 'task', title: item.title, result: item.result || '', desc: item.desc || '',
        status: 'new', priority: item.priority || 'normal', ownerId: project.ownerId || (currentUser.platformRole === 'user' ? currentUser.id : null), people: [],
        start: addDays(start, item.relativeStartDay), due: addDays(start, item.relativeDueDay),
        smart: ['', '', '', '', ''], subtasks: [], comments: []
      }));
      return { ...prev, phases: [...prev.phases, ...phases], items: [...prev.items, ...items] };
    }, `Проект создан из шаблона ${template.title}`);
    emitNotification('project.created_from_template', { projectId: project.id, entityType: 'project', entityId: project.id, title: 'Проект создан из шаблона', message: `${project.title} создан из шаблона «${template.title}».` });
    return project;
  }

  function updateProject(projectId, patch) {
    const project = projectById(db, projectId);
    const canUpdateProject = Boolean(
      project && (
        ['superadmin', 'admin'].includes(currentUser?.platformRole) ||
        hasPermission(db, currentUser, 'team.project.manageAccess', { teamId: project.teamId }) ||
        hasPermission(db, currentUser, 'project.member.changeRole', { projectId }) ||
        hasPermission(db, currentUser, 'project.task.statusAny', { projectId })
      )
    );
    if (!project || !canUpdateProject) return false;
    const datesChanged = 'start' in patch || 'due' in patch;
    const statusChanged = 'status' in patch && patch.status !== project.status;
    setDb(prev => ({ ...prev, projects: prev.projects.map(item => item.id === projectId ? { ...item, ...patch } : item) }), `Изменен проект ${projectId}`);
    if (datesChanged) emitNotification('project.dates_changed', { projectId, entityType: 'project', entityId: projectId, title: 'Сроки проекта изменились', message: `Изменены сроки проекта «${project.title}».` });
    if (statusChanged && patch.status === 'done') emitNotification('project.completed', { projectId, entityType: 'project', entityId: projectId, title: 'Проект завершён', message: `Проект «${project.title}» отмечен как готовый.` });
    return true;
  }

  function deleteProject(projectId) {
    const project = projectById(db, projectId);
    if (!project || !hasPermission(db, currentUser, 'team.project.delete', { teamId: project.teamId })) return false;
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(item => item.id === projectId ? { ...item, isArchived: true } : item),
      archive: [{ id: uid('arch'), entityType: 'project', entityId: projectId, title: project.title, archivedBy: currentUser.id, archivedAt: today() }, ...(prev.archive || [])]
    }), `Проект архивирован ${projectId}`);
    return true;
  }

  function setProjectAccess(projectId, userId, role) {
    const targetUser = userById(db, userId);
    if (!targetUser || targetUser.platformRole !== 'user') return false;
    const permission = role === 'none' ? 'project.member.remove' : 'project.member.changeRole';
    if (!hasPermission(db, currentUser, permission, { projectId })) return false;
    const project = projectById(db, projectId);
    const previous = project?.access?.find(entry => entry.userId === userId)?.role;
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(project => {
        if (project.id !== projectId) return project;
        const rest = project.access.filter(entry => entry.userId !== userId);
        return { ...project, access: role === 'none' ? rest : [...rest, { userId, role }] };
      })
    }), `Изменен доступ к проекту ${projectId}`);
    if (role !== 'none' && !previous) emitNotification('project.member_added', { projectId, explicitUserId: userId, entityType: 'project', entityId: projectId, title: 'Вас добавили в проект', message: `Вас добавили в проект «${project?.title || projectId}».` });
    if (role !== 'none' && previous && previous !== role) emitNotification('project.role_changed', { projectId, explicitUserId: userId, entityType: 'project', entityId: projectId, title: 'Ваша роль изменена', message: `Вы теперь ${role} в проекте «${project?.title || projectId}».` });
    return true;
  }

  function createPhase(projectId, title) {
    if (!hasPermission(db, currentUser, 'project.phase.manage', { projectId })) return false;
    const current = db.phases.filter(phase => phase.projectId === projectId);
    const phase = { id: uid('ph'), projectId, title: title.trim(), sort: current.length + 1 };
    setDb(prev => ({ ...prev, phases: [...prev.phases, phase] }), `Создана фаза ${title}`);
    emitNotification('phase.created', { projectId, entityType: 'phase', entityId: phase.id, title: 'Добавлена новая фаза', message: `В проект добавлена фаза «${phase.title}».` });
    return phase;
  }

  function createItem(projectId, payload) {
    if (!hasPermission(db, currentUser, 'project.task.create', { projectId })) return false;
    const item = {
      id: uid('i'), projectId, phaseId: payload.phaseId, type: payload.type || 'task', title: payload.title.trim(),
      result: payload.result || '', desc: payload.desc || '', status: payload.status || 'new', priority: payload.priority || 'normal',
      ownerId: payload.ownerId || (currentUser.platformRole === 'user' ? currentUser.id : null), people: payload.people || [], start: payload.start || today(), due: payload.due || today(),
      smart: payload.smart || ['', '', '', '', ''], subtasks: [], comments: [], isArchived: false
    };
    setDb(prev => ({ ...prev, items: [...prev.items, item] }), `Создана задача ${item.title}`);
    return item;
  }

  function updateItem(itemId, patch) {
    const item = db.items.find(entry => entry.id === itemId);
    if (!item) return false;
    const keys = Object.keys(patch || {});
    const onlyStatus = keys.length === 1 && keys[0] === 'status';
    if (onlyStatus && !canChangeTaskStatus(db, currentUser, item)) return false;
    if (!onlyStatus && !canEditTask(db, currentUser, item)) return false;
    const datesChanged = 'start' in patch || 'due' in patch;
    setDb(prev => ({ ...prev, items: prev.items.map(entry => entry.id === itemId ? { ...entry, ...patch } : entry) }), `Изменена задача ${itemId}`);
    if (patch.status === 'done' && item.status !== 'done') emitNotification('task.completed', { projectId: item.projectId, entityType: 'task', entityId: item.id, title: 'Задача завершена', message: `Задача «${item.title}» завершена.` });
    if (datesChanged) emitNotification('task.dates_changed', { projectId: item.projectId, entityType: 'task', entityId: item.id, title: 'Сроки задачи изменились', message: `Изменены сроки задачи «${item.title}».` });
    return true;
  }

  function deleteItem(itemId) {
    const item = db.items.find(entry => entry.id === itemId);
    if (!item || !hasPermission(db, currentUser, 'project.task.delete', { projectId: item.projectId })) return false;
    setDb(prev => ({
      ...prev,
      items: prev.items.map(entry => entry.id === itemId ? { ...entry, isArchived: true } : entry),
      archive: [{ id: uid('arch'), entityType: 'task', entityId: itemId, title: item.title, archivedBy: currentUser.id, archivedAt: today() }, ...(prev.archive || [])]
    }), `Задача архивирована ${itemId}`);
    return true;
  }

  function addComment(itemId, text) {
    const item = db.items.find(entry => entry.id === itemId);
    if (!item || !hasPermission(db, currentUser, 'project.comment.create', { projectId: item.projectId })) return false;
    const comment = { id: uid('c'), userId: currentUser.id, text: text.trim(), date: today() };
    setDb(prev => ({ ...prev, items: prev.items.map(entry => entry.id === itemId ? { ...entry, comments: [...(entry.comments || []), comment] } : entry) }), `Добавлен комментарий к задаче ${itemId}`);
    return true;
  }

  function addSubtask(itemId, title) {
    const item = db.items.find(entry => entry.id === itemId);
    if (!item || !canManageSubtasks(db, currentUser, item)) return false;
    const subtask = { id: uid('s'), title: title.trim(), due: item.due, done: false };
    setDb(prev => ({ ...prev, items: prev.items.map(entry => entry.id === itemId ? { ...entry, subtasks: [...(entry.subtasks || []), subtask] } : entry) }), `Добавлена подзадача к ${itemId}`);
    return true;
  }

  function updateSubtask(itemId, subtaskId, patch) {
    const item = db.items.find(entry => entry.id === itemId);
    if (!item || !canManageSubtasks(db, currentUser, item)) return false;
    setDb(prev => ({
      ...prev,
      items: prev.items.map(item => item.id !== itemId ? item : {
        ...item,
        subtasks: (item.subtasks || []).map(subtask => subtask.id === subtaskId ? { ...subtask, ...patch } : subtask)
      })
    }), `Изменена подзадача ${subtaskId}`);
    return true;
  }

  function createTemplate(payload) {
    if (!hasPermission(db, currentUser, 'template.create', { teamId: payload.teamId })) return false;
    const template = {
      id: uid('tpl'), title: payload.title.trim(), desc: payload.desc || '', category: payload.category || 'General',
      visibility: payload.visibility || 'all', teamId: payload.teamId || null, isActive: true, isArchived: false,
      version: 1, createdBy: currentUser.id, updatedBy: currentUser.id, createdAt: today(), updatedAt: today()
    };
    setDb(prev => ({
      ...prev,
      projectTemplates: [...prev.projectTemplates, template],
      templateVersions: [...prev.templateVersions, { id: uid('tv'), templateId: template.id, version: 1, changedBy: currentUser.id, changeComment: 'Создан шаблон', date: today(), snapshot: { template } }]
    }), `Создан шаблон ${template.title}`);
    emitNotification('template.created', { entityType: 'template', entityId: template.id, title: 'Создан новый шаблон', message: `Создан шаблон «${template.title}».` });
    return template;
  }

  function updateTemplate(templateId, patch, changeComment = 'Изменен шаблон') {
    const template = db.projectTemplates.find(item => item.id === templateId);
    if (!template || !hasPermission(db, currentUser, 'template.update', { teamId: template.teamId })) return false;
    setDb(prev => {
      const nextVersion = (template.version || 1) + 1;
      return {
        ...prev,
        projectTemplates: prev.projectTemplates.map(item => item.id === templateId ? { ...item, ...patch, version: nextVersion, updatedBy: currentUser.id, updatedAt: today() } : item),
        templateVersions: [
          ...prev.templateVersions,
          { id: uid('tv'), templateId, version: nextVersion, changedBy: currentUser.id, changeComment, date: today(), snapshot: snapshotTemplate(prev, templateId) }
        ]
      };
    }, `Изменен шаблон ${template.title}`);
    emitNotification('template.updated', { entityType: 'template', entityId: templateId, title: 'Изменён шаблон', message: `Изменён шаблон «${template.title}».` });
    return true;
  }

  function archiveTemplate(templateId) {
    const template = db.projectTemplates.find(item => item.id === templateId);
    if (!template || !hasPermission(db, currentUser, 'template.archive', { teamId: template.teamId })) return false;
    setDb(prev => ({
      ...prev,
      projectTemplates: prev.projectTemplates.map(item => item.id === templateId ? { ...item, isArchived: true, isActive: false, updatedBy: currentUser.id, updatedAt: today() } : item),
      archive: [{ id: uid('arch'), entityType: 'template', entityId: templateId, title: template.title, archivedBy: currentUser.id, archivedAt: today() }, ...(prev.archive || [])]
    }), `Шаблон архивирован ${template.title}`);
    return true;
  }

  function createTemplatePhase(templateId, payload) {
    const template = db.projectTemplates.find(item => item.id === templateId);
    if (!template || !hasPermission(db, currentUser, 'template.update', { teamId: template.teamId })) return false;
    const phase = { id: uid('tph'), templateId, title: payload.title.trim(), sort: payload.sort || db.templatePhases.filter(p => p.templateId === templateId).length + 1, durationDays: Number(payload.durationDays || 5) };
    setDb(prev => ({ ...prev, templatePhases: [...prev.templatePhases, phase] }), `Добавлена фаза шаблона ${phase.title}`);
    updateTemplate(templateId, {}, 'Добавлена фаза шаблона');
    return phase;
  }

  function updateTemplatePhase(phaseId, patch) {
    const phase = db.templatePhases.find(item => item.id === phaseId);
    const template = phase ? db.projectTemplates.find(item => item.id === phase.templateId) : null;
    if (!phase || !template || !hasPermission(db, currentUser, 'template.update', { teamId: template.teamId })) return false;
    setDb(prev => ({ ...prev, templatePhases: prev.templatePhases.map(item => item.id === phaseId ? { ...item, ...patch } : item) }), `Изменена фаза шаблона ${phase.title}`);
    return true;
  }

  function createTemplateItem(templateId, payload) {
    const template = db.projectTemplates.find(item => item.id === templateId);
    if (!template || !hasPermission(db, currentUser, 'template.update', { teamId: template.teamId })) return false;
    const item = { id: uid('titem'), templateId, templatePhaseId: payload.templatePhaseId, type: payload.type || 'task', title: payload.title.trim(), result: payload.result || '', relativeStartDay: Number(payload.relativeStartDay || 0), relativeDueDay: Number(payload.relativeDueDay || 1), defaultOwnerRole: payload.defaultOwnerRole || 'projectManager', priority: payload.priority || 'normal', sort: db.templateItems.filter(i => i.templateId === templateId).length + 1 };
    setDb(prev => ({ ...prev, templateItems: [...prev.templateItems, item] }), `Добавлена задача шаблона ${item.title}`);
    updateTemplate(templateId, {}, 'Добавлена задача шаблона');
    return item;
  }

  function updateTemplateItem(itemId, patch) {
    const item = db.templateItems.find(entry => entry.id === itemId);
    const template = item ? db.projectTemplates.find(entry => entry.id === item.templateId) : null;
    if (!item || !template || !hasPermission(db, currentUser, 'template.update', { teamId: template.teamId })) return false;
    setDb(prev => ({ ...prev, templateItems: prev.templateItems.map(entry => entry.id === itemId ? { ...entry, ...patch } : entry) }), `Изменена задача шаблона ${item.title}`);
    return true;
  }

  function patchNotificationRule(ruleId, patch) {
    if (!hasPermission(db, currentUser, 'notification.manageGlobal')) return false;
    setDb(prev => ({ ...prev, notificationRules: prev.notificationRules.map(rule => rule.id === ruleId ? { ...rule, ...patch } : rule) }), `Изменено правило уведомления ${ruleId}`);
    return true;
  }

  function markNotificationRead(notificationId) {
    const readAt = new Date().toISOString();
    setDb(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === notificationId && n.userId === currentUser?.id ? { ...n, isRead: true, readAt } : n),
      notificationDeliveryLog: (prev.notificationDeliveryLog || []).map(row => row.notificationId === notificationId && row.userId === currentUser?.id ? { ...row, status: 'read', readAt } : row)
    }));
  }

  function markAllNotificationsRead() {
    const readAt = new Date().toISOString();
    setDb(prev => {
      const ownUnreadIds = new Set((prev.notifications || []).filter(n => n.userId === currentUser?.id && !n.isRead).map(n => n.id));
      return {
        ...prev,
        notifications: prev.notifications.map(n => n.userId === currentUser?.id ? { ...n, isRead: true, readAt: n.readAt || readAt } : n),
        notificationDeliveryLog: (prev.notificationDeliveryLog || []).map(row => ownUnreadIds.has(row.notificationId) && row.userId === currentUser?.id ? { ...row, status: 'read', readAt } : row)
      };
    });
  }

  function updateDictionaryItem(itemId, patch) {
    if (!hasPermission(db, currentUser, 'dictionary.manage')) return false;
    setDb(prev => ({ ...prev, dictionaryItems: prev.dictionaryItems.map(item => item.id === itemId ? { ...item, ...patch } : item) }), `Изменен справочник ${itemId}`);
    return true;
  }

  function updateSystemSettings(patch) {
    if (!hasPermission(db, currentUser, 'system.settings')) return false;
    setDb(prev => ({ ...prev, systemSettings: { ...prev.systemSettings, ...patch } }), 'Изменены системные настройки');
    return true;
  }

  function restoreArchive(archiveId) {
    if (!hasPermission(db, currentUser, 'system.archive.restore')) return false;
    const record = db.archive.find(item => item.id === archiveId);
    if (!record) return false;
    setDb(prev => {
      let next = { ...prev, archive: prev.archive.filter(item => item.id !== archiveId) };
      if (record.entityType === 'project') next.projects = prev.projects.map(item => item.id === record.entityId ? { ...item, isArchived: false } : item);
      if (record.entityType === 'template') next.projectTemplates = prev.projectTemplates.map(item => item.id === record.entityId ? { ...item, isArchived: false, isActive: true } : item);
      if (record.entityType === 'team') next.teams = prev.teams.map(item => item.id === record.entityId ? { ...item, isArchived: false } : item);
      if (record.entityType === 'task') next.items = prev.items.map(item => item.id === record.entityId ? { ...item, isArchived: false } : item);
      if (record.entityType === 'user') next.users = prev.users.map(item => item.id === record.entityId ? { ...item, status: 'active' } : item);
      return next;
    }, `Восстановлено из архива ${record.title}`);
    return true;
  }

  const value = {
    db, setDb, currentUser, route, setRoute,
    login, logout, resetDemoData,
    hasPermission: (permission, context) => hasPermission(db, currentUser, permission, context),
    rolesForCurrentContext: (context) => rolesForContext(db, currentUser, context),
    visibleTeams: () => visibleTeams(db, currentUser),
    visibleProjects: (teamId) => visibleProjects(db, currentUser, teamId),
    patchRolePermission,
    createUser, updateUser, deleteUser,
    createTeam, updateTeam, deleteTeam, setTeamMember, removeTeamMember,
    createProject, createProjectFromTemplate, updateProject, deleteProject, setProjectAccess,
    createPhase, createItem, updateItem, deleteItem, addComment, addSubtask, updateSubtask,
    createTemplate, updateTemplate, archiveTemplate, createTemplatePhase, updateTemplatePhase, createTemplateItem, updateTemplateItem,
    emitNotification, patchNotificationRule, markNotificationRead, markAllNotificationsRead,
    updateDictionaryItem, updateSystemSettings, restoreArchive
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
