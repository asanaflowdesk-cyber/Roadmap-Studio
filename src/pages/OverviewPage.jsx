import React from 'react';
import { useApp } from '../app/AppContext.jsx';
import { KanbanView } from '../features/roadmap/ProjectViews.jsx';

export function OverviewPage() {
  const { db, visibleProjects } = useApp();
  const projects = visibleProjects();
  const projectIds = new Set(projects.map(project => project.id));
  const items = db.items.filter(item => !item.isArchived && projectIds.has(item.projectId));
  const phases = db.phases.filter(phase => projectIds.has(phase.projectId));
  const done = items.filter(item => item.status === 'done').length;

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{ padding: '18px 20px 0' }}>
        <div className="eyebrow">Общий обзор</div>
        <h1 className="h1">Работа по всем доступным проектам</h1>
        <div className="subtitle">{projects.length} проектов · {items.length} задач · {items.length ? Math.round(done / items.length * 100) : 0}% выполнено</div>
      </div>
      <div style={{ height: 'calc(100% - 96px)' }}><KanbanView items={items} phases={phases} /></div>
    </div>
  );
}
