import React from 'react';
import { useApp } from '../app/AppContext.jsx';
import { Badge } from '../shared/ui/Badge.jsx';
import { fmt } from '../shared/utils/date.js';
import { canViewProject } from '../services/permissions.js';

export function MyTasksPage() {
  const { db, currentUser, setRoute } = useApp();
  const tasks = db.items.filter(item => !item.isArchived && (item.ownerId === currentUser.id || (item.people || []).includes(currentUser.id)) && canViewProject(db, currentUser, item.projectId));

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-head"><div><div className="eyebrow">Моя работа</div><h1 className="h1">Мои задачи</h1><div className="subtitle">Задачи, где вы ответственный или участник.</div></div></div>
        <div className="table-card">
          <div className="table-head" style={{ gridTemplateColumns: '1.6fr 1fr 110px 110px' }}><div>Задача</div><div>Проект</div><div>Срок</div><div>Статус</div></div>
          {tasks.map(item => {
            const project = db.projects.find(project => project.id === item.projectId);
            return <div className="table-row" style={{ gridTemplateColumns: '1.6fr 1fr 110px 110px', cursor: 'pointer' }} key={item.id} onClick={() => setRoute(prev => ({ ...prev, view: 'project', projectId: item.projectId, tab: 'table', itemId: item.id, phaseId: item.phaseId }))}><div><div className="strong">{item.title}</div><div className="small muted">{item.result || '—'}</div></div><div className="small muted">{project?.title}</div><div>{fmt(item.due)}</div><div><Badge value={item.status} /></div></div>;
          })}
          {!tasks.length ? <div className="empty"><div><strong>Задач нет</strong><span>Либо вы всё закрыли, либо вас ещё не назначили.</span></div></div> : null}
        </div>
      </div>
    </div>
  );
}
