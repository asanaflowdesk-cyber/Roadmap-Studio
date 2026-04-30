import React from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';

export function ProjectCard({ project }) {
  const { db, setRoute } = useApp();
  const items = db.items.filter(item => !item.isArchived && item.projectId === project.id);
  const done = items.filter(item => item.status === 'done').length;
  const progress = items.length ? Math.round(done / items.length * 100) : 0;
  const accessUsers = (project.access || []).slice(0, 4).map(entry => db.users.find(user => user.id === entry.userId))
    .filter(user => user && user.platformRole === 'user');

  return (
    <article className="card project-card" onClick={() => setRoute(prev => ({ ...prev, view: 'project', projectId: project.id, tab: 'table', itemId: items[0]?.id || null, phaseId: db.phases.find(phase => phase.projectId === project.id)?.id || null }))}>
      <Badge value={project.status} />
      <div className="project-title">{project.title}</div>
      <div className="project-desc">{project.desc || 'Описание проекта не заполнено.'}</div>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="project-footer">
        <span className="small muted">{items.length} задач · {progress}%</span>
        <span style={{ display: 'flex' }}>{accessUsers.map(user => <Avatar key={user.id} user={user} size="sm" />)}</span>
      </div>
    </article>
  );
}
