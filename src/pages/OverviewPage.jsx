import React from 'react';
import { useApp } from '../app/AppContext.jsx';
import { KanbanView } from '../features/roadmap/ProjectViews.jsx';
import { TaskDetail } from '../features/roadmap/TaskDetail.jsx';

export function OverviewPage() {
  const { db, visibleProjects, route } = useApp();
  const projects = visibleProjects();
  const projectIds = new Set(projects.map(project => project.id));
  const items = db.items.filter(item => !item.isArchived && projectIds.has(item.projectId));
  const phases = db.phases.filter(phase => projectIds.has(phase.projectId));
  const done = items.filter(item => item.status === 'done').length;
  const selected = db.items.find(item => item.id === route.itemId) || null;

  return (
    <div className="project-detail-layout" style={{ paddingTop: 0 }}>
      <div style={{ padding: '18px 20px 0' }}>
        <div className="eyebrow">Общий обзор</div>
        <h1 className="h1">Работа по всем доступным проектам</h1>
        <div className="subtitle">{projects.length} проектов · {items.length} задач · {items.length ? Math.round(done / items.length * 100) : 0}% выполнено</div>
      </div>
      <div className="project-shell">
        <div style={{ height: 'calc(100% - 24px)' }}><KanbanView items={items} phases={phases} /></div>
        <TaskDetail item={selected} />
      </div>
    </div>
  );
}
