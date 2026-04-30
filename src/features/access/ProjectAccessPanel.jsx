import React from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';

const options = [
  ['none', 'Нет доступа'],
  ['projectManager', 'Менеджер проекта'],
  ['member', 'Участник'],
  ['guest', 'Гость']
];

export function ProjectAccessPanel({ project }) {
  const { db, setProjectAccess, hasPermission } = useApp();
  const canManage = hasPermission('project.member.changeRole', { projectId: project.id });
  const team = db.teams.find(item => item.id === project.teamId);
  const users = db.users.filter(user => user.status !== 'blocked');
  const accessMap = Object.fromEntries((project.access || []).map(entry => [entry.userId, entry.role]));

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-head">
          <div>
            <div className="eyebrow">Проектные доступы</div>
            <h1 className="h1">{project.title}</h1>
            <div className="subtitle">Гость видит проект только при явном добавлении сюда.</div>
          </div>
        </div>
        <div className="table-card">
          <div className="table-head" style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }}><div>Пользователь</div><div>Команда</div><div>Роль в проекте</div></div>
          {users.map(user => {
            const inTeam = team?.members.some(member => member.userId === user.id);
            const role = accessMap[user.id] || 'none';
            return <div className="table-row" style={{ gridTemplateColumns: '1.5fr 1fr 1fr' }} key={user.id}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={user} /><div><div className="strong">{user.name}</div><div className="small muted">{user.email}</div></div></div><div>{inTeam ? <Badge value="teamLead">В команде</Badge> : <span className="small muted">Вне команды</span>}</div><div><select className="select" disabled={!canManage} value={role} onChange={event => setProjectAccess(project.id, user.id, event.target.value)}>{options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div></div>;
          })}
        </div>
      </div>
    </div>
  );
}
