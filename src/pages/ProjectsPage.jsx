import React, { useMemo, useState } from 'react';
import { useApp } from '../app/AppContext.jsx';
import { Button } from '../shared/ui/Button.jsx';
import { ProjectCard } from '../features/projects/ProjectCard.jsx';
import { CreateProjectModal } from '../features/projects/CreateProjectModal.jsx';

export function ProjectsPage() {
  const { db, route, setRoute, visibleTeams, visibleProjects, hasPermission } = useApp();
  const teams = visibleTeams();
  const activeTeamId = route.teamId || teams[0]?.id || null;
  const [modalOpen, setModalOpen] = useState(false);
  const projects = useMemo(() => visibleProjects(activeTeamId), [db, activeTeamId]);
  const activeTeam = db.teams.find(team => team.id === activeTeamId);
  const canCreate = activeTeamId && hasPermission('team.project.create', { teamId: activeTeamId });

  if (!teams.length) {
    return <div className="page"><div className="empty"><div><strong>Нет доступных команд</strong><span>Попросите администратора добавить вас в команду или проект.</span></div></div></div>;
  }

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-head">
          <div>
            <div className="eyebrow">Рабочая область</div>
            <h1 className="h1">Карты проектов</h1>
            <div className="subtitle">Проекты видны согласно роли и явным доступам.</div>
          </div>
          {canCreate ? <Button variant="primary" onClick={() => setModalOpen(true)}>+ Новый проект</Button> : null}
        </div>

        <div className="tabs">
          {teams.map(team => <button key={team.id} className={`tab ${activeTeamId === team.id ? 'active' : ''}`} onClick={() => setRoute(prev => ({ ...prev, teamId: team.id }))}>{team.name}</button>)}
        </div>

        <div className="card card-pad" style={{ marginBottom: 14 }}>
          <div className="strong">{activeTeam?.name}</div>
          <div className="small muted">{projects.length} проектов · команда доступна по вашей роли</div>
        </div>

        {projects.length ? <div className="grid project-grid">{projects.map(project => <ProjectCard key={project.id} project={project} />)}</div> : <div className="empty card"><div><strong>Проектов нет</strong><span>Создайте проект или попросите руководителя команды выдать доступ.</span></div></div>}
      </div>
      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} teamId={activeTeamId} />
    </div>
  );
}
