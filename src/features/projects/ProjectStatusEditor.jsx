import React, { useEffect, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { Button } from '../../shared/ui/Button.jsx';

const STATUS_OPTIONS = [
  ['new', 'Не начато'],
  ['progress', 'В работе'],
  ['approval', 'Согласование'],
  ['risk', 'Риск'],
  ['done', 'Готово']
];

function canEditProjectStatus(currentUser, project, hasPermission) {
  if (!currentUser || !project) return false;
  if (['superadmin', 'admin'].includes(currentUser.platformRole)) return true;
  return Boolean(
    hasPermission('team.project.manageAccess', { teamId: project.teamId }) ||
    hasPermission('project.member.changeRole', { projectId: project.id }) ||
    hasPermission('project.task.statusAny', { projectId: project.id })
  );
}

export function ProjectStatusEditor({ project, compact = false }) {
  const { currentUser, updateProject, hasPermission } = useApp();
  const [draftStatus, setDraftStatus] = useState(project?.status || 'new');
  const canEdit = canEditProjectStatus(currentUser, project, hasPermission);
  const changed = draftStatus !== (project?.status || 'new');

  useEffect(() => {
    setDraftStatus(project?.status || 'new');
  }, [project?.id, project?.status]);

  if (!project) return null;
  if (!canEdit) return <Badge value={project.status} />;

  function save(event) {
    event?.stopPropagation?.();
    if (!changed) return;
    updateProject(project.id, { status: draftStatus });
  }

  return (
    <div className={`project-status-editor ${compact ? 'compact' : ''}`} onClick={event => event.stopPropagation()}>
      <select
        className={`select status-control status-${draftStatus}`}
        value={draftStatus}
        onChange={event => setDraftStatus(event.target.value)}
        aria-label="Статус проекта"
      >
        {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {changed ? <Button size="sm" variant="primary" onClick={save}>Сохранить</Button> : null}
    </div>
  );
}
