import { SEED_DATA } from '../data/seed.js';
import { DEFAULT_ROLE_PERMISSIONS, permissionKeys } from '../data/permissions.js';

export const STORAGE_KEY = 'roadmap_studio_app_v3';
export const SESSION_KEY = 'roadmap_studio_session_user_id';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeProjectRole(value) {
  if (value === 'full') return 'projectManager';
  if (value === 'read') return 'guest';
  if (value === 'none') return 'none';
  return value || 'none';
}

export function migrateData(raw) {
  const db = raw ? clone(raw) : clone(SEED_DATA);
  const keys = permissionKeys();

  db.rolePermissions = db.rolePermissions || clone(DEFAULT_ROLE_PERMISSIONS);
  Object.keys(DEFAULT_ROLE_PERMISSIONS).forEach(role => {
    db.rolePermissions[role] = db.rolePermissions[role] || {};
    keys.forEach(key => {
      if (typeof db.rolePermissions[role][key] !== 'boolean') {
        db.rolePermissions[role][key] = !!DEFAULT_ROLE_PERMISSIONS[role][key];
      }
    });
  });

  db.users = (db.users || []).map((user, index) => ({
    email: user.email || `${user.id || `user${index}`}@roadmap.local`,
    password: user.password || 'demo123',
    status: user.status || 'active',
    platformRole: index === 0 && user.platformRole === 'admin' ? 'superadmin' : (user.platformRole || 'user'),
    ...user
  }));

  db.teams = (db.teams || []).map(team => ({
    ...team,
    members: (team.members || []).filter(member => db.users.find(user => user.id === member.userId)?.platformRole === 'user')
  }));
  db.projects = (db.projects || []).map(project => ({
    ...project,
    access: (project.access || []).map(entry => ({
      userId: entry.userId,
      role: normalizeProjectRole(entry.role || entry.level)
    })).filter(entry => entry.role !== 'none' && db.users.find(user => user.id === entry.userId)?.platformRole === 'user')
  }));
  db.phases = db.phases || [];
  db.items = (db.items || []).map(item => ({
    subtasks: [],
    comments: [],
    smart: ['', '', '', '', ''],
    people: [],
    ...item,
    ownerId: db.users.find(user => user.id === item.ownerId)?.platformRole === 'user' ? item.ownerId : null,
    people: (item.people || []).filter(userId => db.users.find(user => user.id === userId)?.platformRole === 'user')
  }));
  const arrayDefaults = [
    'dictionaries', 'dictionaryItems', 'projectTemplates', 'templatePhases', 'templateItems', 'templateVersions',
    'notificationRules', 'notificationPreferences', 'notifications', 'notificationDeliveryLog',
    'entityVersions', 'attachments', 'taskDependencies', 'approvalRequests', 'savedViews', 'favorites', 'archive'
  ];
  arrayDefaults.forEach(key => {
    if (!Array.isArray(db[key])) db[key] = clone(SEED_DATA[key] || []);
  });
  db.systemSettings = { ...(SEED_DATA.systemSettings || {}), ...(db.systemSettings || {}) };
  db.audit = db.audit || [];
  return db;
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return migrateData(raw ? JSON.parse(raw) : null);
  } catch {
    return migrateData(null);
  }
}

export function saveData(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetData() {
  const db = migrateData(null);
  saveData(db);
  return db;
}

export function getSessionUserId() {
  return sessionStorage.getItem(SESSION_KEY);
}

export function setSessionUserId(userId) {
  sessionStorage.setItem(SESSION_KEY, userId);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
