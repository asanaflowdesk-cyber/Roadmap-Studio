import React, { useMemo } from 'react';
import { useApp } from '../app/AppContext.jsx';
import { projectById } from '../services/permissions.js';
import { TaskTable } from '../features/roadmap/TaskTable.jsx';
import { TaskDetail } from '../features/roadmap/TaskDetail.jsx';
import { KanbanView, GanttView, RoadmapView, CalendarView, AnalyticsView } from '../features/roadmap/ProjectViews.jsx';
import { ProjectAccessPanel } from '../features/access/ProjectAccessPanel.jsx';

export function ProjectPage() {
  const { db, route } = useApp();
  const project = projectById(db, route.projectId);
  const phases = useMemo(() => db.phases.filter(phase => phase.projectId === route.projectId).sort((a,b) => a.sort - b.sort), [db, route.projectId]);
  const items = useMemo(() => db.items.filter(item => !item.isArchived && item.projectId === route.projectId), [db, route.projectId]);
  const selected = db.items.find(item => item.id === route.itemId) || items[0] || null;

  if (!project) return <div className="page"><div className="empty"><div><strong>Проект не найден</strong><span>Вернитесь к списку проектов.</span></div></div></div>;

  if (route.tab === 'kanban') return <KanbanView items={items} phases={phases} />;
  if (route.tab === 'gantt') return <GanttView items={items} phases={phases} />;
  if (route.tab === 'roadmap') return <RoadmapView items={items} phases={phases} />;
  if (route.tab === 'calendar') return <CalendarView items={items} phases={phases} />;
  if (route.tab === 'analytics') return <AnalyticsView project={project} items={items} db={db} />;
  if (route.tab === 'access') return <ProjectAccessPanel project={project} />;

  return (
    <div className="project-shell">
      <TaskTable project={project} phases={phases} items={items} />
      <TaskDetail item={selected} />
    </div>
  );
}
