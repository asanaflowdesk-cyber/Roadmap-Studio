import React, { useMemo, useState } from 'react';
import { useApp } from '../app/AppContext.jsx';
import { Badge } from '../shared/ui/Badge.jsx';
import { ProjectCard } from '../features/projects/ProjectCard.jsx';
import { CreateProjectModal } from '../features/projects/CreateProjectModal.jsx';

function roleForTeam(currentUser, team) {
  if (!currentUser) return '—';
  if (['superadmin', 'admin'].includes(currentUser.platformRole)) return '';
  const member = team.members?.find(item => item.userId === currentUser.id);
  if (member?.role === 'teamLead') return 'Руководитель';
  if (member?.role === 'projectManager') return 'Менеджер';
  if (member?.role === 'member') return 'Участник';
  return 'Доступ';
}

function projectRoleForUser(project, currentUser, team) {
  if (!currentUser) return 'none';
  if (currentUser.platformRole === 'superadmin' || currentUser.platformRole === 'admin') return 'admin';
  const projectRole = project.access?.find(item => item.userId === currentUser.id)?.role;
  if (projectRole) return projectRole;
  const teamRole = team.members?.find(item => item.userId === currentUser.id)?.role;
  return teamRole || 'none';
}

function matchesRole(project, currentUser, team, roleFilter) {
  if (roleFilter === 'all') return true;
  const role = projectRoleForUser(project, currentUser, team);
  if (roleFilter === 'lead') return ['admin', 'teamLead', 'projectManager'].includes(role);
  if (roleFilter === 'member') return role === 'member';
  return true;
}

function teamInitials(name = '') {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
}

export function ProjectsPage() {
  const { db, currentUser, setRoute, visibleTeams, visibleProjects, hasPermission } = useApp();
  const teams = visibleTeams();
  const [modalTeamId, setModalTeamId] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const groupedTeams = useMemo(() => teams.map(team => {
    const projects = visibleProjects(team.id).filter(project => {
      const text = `${project.title || ''} ${project.desc || ''}`.toLowerCase();
      const queryOk = !query.trim() || text.includes(query.trim().toLowerCase());
      const statusOk = statusFilter === 'all' || project.status === statusFilter;
      const roleOk = matchesRole(project, currentUser, team, roleFilter);
      return queryOk && statusOk && roleOk;
    });
    return { team, projects };
  }), [db, teams, currentUser, query, statusFilter, roleFilter]);

  if (!teams.length) {
    return <div className="page"><div className="empty"><div><strong>Нет доступных команд</strong><span>Попросите администратора добавить вас в команду или проект.</span></div></div></div>;
  }

  return (
    <div className="page projects-page">
      <div className="projects-toolbar">
        <div className="project-search">
          <span>⌕</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск проектов..." />
        </div>

        <div className="filter-group">
          <span className="filter-label">Статус</span>
          {[
            ['all', 'Все'],
            ['progress', 'В работе'],
            ['new', 'Не начато'],
            ['done', 'Готово'],
            ['risk', 'Риски'],
          ].map(([value, label]) => (
            <button key={value} className={`filter-pill ${statusFilter === value ? 'active' : ''}`} onClick={() => setStatusFilter(value)}>{label}</button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Моя роль</span>
          {[
            ['all', 'Все'],
            ['lead', 'Руководитель'],
            ['member', 'Участник'],
          ].map(([value, label]) => (
            <button key={value} className={`filter-pill ${roleFilter === value ? 'active' : ''}`} onClick={() => setRoleFilter(value)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="projects-board">
        {groupedTeams.map(({ team, projects }) => {
          const canCreate = hasPermission('team.project.create', { teamId: team.id });
          const visibleCount = visibleProjects(team.id).length;
          return (
            <section className="team-project-section" key={team.id}>
              <div className="team-row-head">
                <div className="team-square" style={{ background: team.color }}>{teamInitials(team.name)}</div>
                <div className="team-row-name">{team.name}</div>
                <div className="team-row-count">{visibleCount} проектов</div>
                {roleForTeam(currentUser, team) ? <span className="team-role-chip">{roleForTeam(currentUser, team)}</span> : null}
              </div>

              <div className="project-card-grid">
                {projects.map(project => <ProjectCard key={project.id} project={project} />)}
                {canCreate ? (
                  <button className="project-create-tile" onClick={() => setModalTeamId(team.id)}>
                    <span>+ Новый проект</span>
                  </button>
                ) : null}
                {!projects.length && !canCreate ? (
                  <div className="project-empty-note">Нет проектов по выбранным фильтрам</div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <CreateProjectModal open={Boolean(modalTeamId)} onClose={() => setModalTeamId(null)} teamId={modalTeamId || teams[0]?.id} />
    </div>
  );
}
