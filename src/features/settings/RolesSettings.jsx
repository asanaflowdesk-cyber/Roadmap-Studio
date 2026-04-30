import React, { useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { PERMISSION_GROUPS, ROLE_META } from '../../data/permissions.js';

const roleOrder = ['superadmin', 'admin', 'teamLead', 'projectManager', 'member', 'guest'];
const sections = [
  ['roles', 'Роли'],
  ['platform', 'Платформа'],
  ['team', 'Команда'],
  ['project', 'Проект']
];

function scopeFilter(section, group) {
  if (section === 'platform') return group.scope === 'Платформа';
  if (section === 'team') return group.scope === 'Команда';
  if (section === 'project') return group.scope === 'Проект';
  return false;
}

export function RolesSettings() {
  const { db, patchRolePermission, hasPermission } = useApp();
  const [section, setSection] = useState('roles');
  const canEdit = hasPermission('system.settings');

  return (
    <div className="grid">
      <div className="tabs">{sections.map(([id, label]) => <button key={id} className={`tab ${section === id ? 'active' : ''}`} onClick={() => setSection(id)}>{label}</button>)}</div>
      {section === 'roles' ? <div className="role-cards">{roleOrder.map(role => <div className="role-card" key={role}><span className="role-chip">{ROLE_META[role].icon} {ROLE_META[role].label}</span><div className="eyebrow" style={{ marginTop: 10 }}>{ROLE_META[role].scope}</div><p className="small muted">{ROLE_META[role].description}</p></div>)}</div> : null}
      {section !== 'roles' ? <div className="matrix-wrap"><table className="matrix"><thead><tr><th>Действие</th>{roleOrder.map(role => <th key={role}>{ROLE_META[role].icon} {ROLE_META[role].label}</th>)}</tr></thead><tbody>{PERMISSION_GROUPS.filter(group => scopeFilter(section, group)).map(group => <React.Fragment key={group.id}><tr><th colSpan={roleOrder.length + 1}>{group.title}</th></tr>{group.permissions.map(([key, label]) => <tr key={key}><td>{label}</td>{roleOrder.map(role => <td key={role}><input type="checkbox" disabled={!canEdit || role === 'superadmin'} checked={!!db.rolePermissions?.[role]?.[key]} onChange={event => patchRolePermission(role, key, event.target.checked)} /></td>)}</tr>)}</React.Fragment>)}</tbody></table></div> : null}
      {!canEdit && section !== 'roles' ? <div className="small muted">Матрицу может менять только роль с правом «Изменить настройки платформы».</div> : null}
    </div>
  );
}
