import React, { useMemo } from 'react';
import { useApp } from '../app/AppContext.jsx';
import { projectById } from '../services/permissions.js';
import { TaskTable } from '../features/roadmap/TaskTable.jsx';
import { TaskDetail } from '../features/roadmap/TaskDetail.jsx';
import { KanbanView, GanttView, RoadmapView, CalendarView, AnalyticsView } from '../features/roadmap/ProjectViews.jsx';
import { ProjectAccessPanel } from '../features/access/ProjectAccessPanel.jsx';
import { ProjectStatusEditor } from '../features/projects/ProjectStatusEditor.jsx';

function ProjectHeaderCard({ project, items }) {
  const done = items.filter(item => item.status === 'done').length;
  const progress = items.length ? Math.round(done / items.length * 100) : 0;
  return (
    <section className="project-detail-card card">
      <div className="project-detail-main">
        <div className="eyebrow">Карточка проекта</div>
        <h1 className="h1 project-detail-title">{project.title}</h1>
        <div className="subtitle">{project.desc || 'Описание проекта не заполнено.'}</div>
      </div>
      <div className="project-detail-side">
        <ProjectStatusEditor project={project} />
        <div className="small muted">{items.length} задач · {progress}% готово</div>
      </div>
    </section>
  );
}

export function ProjectPage() {
  const { db, route } = useApp();
  const project = projectById(db, route.projectId);
  const phases = useMemo(() => db.phases.filter(phase => phase.projectId === route.projectId).sort((a,b) => a.sort - b.sort), [db, route.projectId]);
  const items = useMemo(() => db.items.filter(item => !item.isArchived && item.projectId === route.projectId), [db, route.projectId]);
  const selected = db.items.find(item => item.id === route.itemId) || items[0] || null;

  if (!project) return <div className="page"><div className="empty"><div><strong>Проект не найден</strong><span>Вернитесь к списку проектов.</span></div></div></div>;

  if (route.tab === 'access') return <ProjectAccessPanel project={project} />;

  let content = <TaskTable project={project} phases={phases} items={items} />;
  if (route.tab === 'kanban') content = <KanbanView items={items} phases={phases} />;
  if (route.tab === 'gantt') content = <GanttView project={project} items={items} phases={phases} />;
  if (route.tab === 'roadmap') content = <RoadmapView items={items} phases={phases} />;
  if (route.tab === 'calendar') content = <CalendarView items={items} phases={phases} />;
  if (route.tab === 'analytics') content = <AnalyticsView project={project} items={items} db={db} />;

  return (
    <div className="project-detail-layout">
      <ProjectHeaderCard project={project} items={items} />
      <div className="project-shell">
        {content}
        <TaskDetail item={selected} />
      </div>
    </div>
  );
}
