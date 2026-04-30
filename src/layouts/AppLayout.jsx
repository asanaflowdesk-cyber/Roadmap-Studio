import React, { useMemo, useState } from 'react';
import { useApp } from '../app/AppContext.jsx';
import { Avatar } from '../shared/ui/Avatar.jsx';
import { Button } from '../shared/ui/Button.jsx';
import { projectById } from '../services/permissions.js';
import { CreatePhaseModal, CreateTaskModal } from '../features/roadmap/CreateRoadmapModals.jsx';
import { NotificationBell } from '../features/notifications/NotificationBell.jsx';

const projectTabs = [
  ['table', 'Таблица'],
  ['kanban', 'Канбан'],
  ['gantt', 'Гант'],
  ['roadmap', 'Roadmap'],
  ['calendar', 'Календарь'],
  ['analytics', 'Аналитика'],
  ['access', 'Доступы']
];

export function AppLayout({ children }) {
  const { db, currentUser, route, setRoute, logout, hasPermission } = useApp();
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const project = useMemo(() => route.projectId ? projectById(db, route.projectId) : null, [db, route.projectId]);
  const showProjectContext = route.view === 'project' && project;
  const canManagePhase = showProjectContext && hasPermission('project.phase.manage', { projectId: project.id });
  const canCreateTask = showProjectContext && hasPermission('project.task.create', { projectId: project.id });

  function nav(view) {
    setRoute(prev => ({ ...prev, view, projectId: null }));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="logo" onClick={() => nav('projects')}><span className="logo-mark">Roadmap</span> Studio</button>
        <nav className="nav">
          <button className={`nav-btn ${route.view === 'projects' || route.view === 'project' ? 'active' : ''}`} onClick={() => nav('projects')}>Карты проектов</button>
          <button className={`nav-btn ${route.view === 'overview' ? 'active' : ''}`} onClick={() => nav('overview')}>Обзор</button>
          <button className={`nav-btn ${route.view === 'people' ? 'active' : ''}`} onClick={() => nav('people')}>Люди</button>
        </nav>
        <div className="topbar-right">
          <button className={`nav-btn ${route.view === 'mytasks' ? 'active' : ''}`} onClick={() => nav('mytasks')}>☑ Мои задачи</button>
          <NotificationBell />
          <button className={`nav-btn ${route.view === 'settings' ? 'active' : ''}`} onClick={() => nav('settings')}>⚙ Настройки</button>
          <button className="user-chip" onClick={logout} title="Выйти">
            <Avatar user={currentUser} size="sm" />
            <span>{currentUser.name}</span>
          </button>
        </div>
      </header>

      <div className={`ctxbar ${showProjectContext ? 'show' : ''}`}>
        {showProjectContext ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => setRoute(prev => ({ ...prev, view: 'projects', projectId: null }))}>‹ Назад</Button>
            <div className="ctx-title">{project.title}</div>
            <div className="ctx-tabs">
              {projectTabs.map(([id, label]) => (
                <button key={id} className={`ctx-tab ${route.tab === id ? 'active' : ''}`} onClick={() => setRoute(prev => ({ ...prev, tab: id }))}>{label}</button>
              ))}
            </div>
            <div className="ctx-actions">
              <input className="input" style={{ height: 30, width: 170 }} placeholder="Поиск..." value={route.search || ''} onChange={event => setRoute(prev => ({ ...prev, search: event.target.value }))} />
              {canManagePhase ? <Button size="sm" onClick={() => setPhaseOpen(true)}>+ Фаза</Button> : null}
              {canCreateTask ? <Button size="sm" variant="primary" onClick={() => setTaskOpen(true)}>+ Задача</Button> : null}
            </div>
            <CreatePhaseModal open={phaseOpen} onClose={() => setPhaseOpen(false)} projectId={project.id} />
            <CreateTaskModal open={taskOpen} onClose={() => setTaskOpen(false)} projectId={project.id} />
          </>
        ) : <span />}
      </div>

      <main className="main">{children}</main>
    </div>
  );
}
