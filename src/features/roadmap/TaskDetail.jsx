import React, { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { canEditTask, canChangeTaskStatus, canManageSubtasks, isTaskOwnedBy } from '../../services/permissions.js';

const STATUS_OPTIONS = [
  ['new', 'Не начато'],
  ['progress', 'В работе'],
  ['approval', 'Согласование'],
  ['risk', 'Риск'],
  ['done', 'Готово']
];

const SMART_FIELDS = [
  ['S', 'Specific', 'Что именно должно быть сделано'],
  ['M', 'Measurable', 'Как измеряем результат'],
  ['A', 'Achievable', 'За счёт чего это достижимо'],
  ['R', 'Relevant', 'Зачем это нужно проекту'],
  ['T', 'Time-bound', 'Срок или временное ограничение']
];

export function TaskDetail({ item }) {
  const { db, currentUser, updateItem, deleteItem, addComment, addSubtask, updateSubtask, setRoute, hasPermission } = useApp();
  const [comment, setComment] = useState('');
  const [subtask, setSubtask] = useState('');
  const canEdit = useMemo(() => canEditTask(db, currentUser, item), [db, currentUser, item]);
  const canStatus = useMemo(() => canChangeTaskStatus(db, currentUser, item), [db, currentUser, item]);
  const canSubtasks = useMemo(() => canManageSubtasks(db, currentUser, item), [db, currentUser, item]);
  const canComment = item && hasPermission('project.comment.create', { projectId: item.projectId });
  const canViewComments = item && hasPermission('project.comment.view', { projectId: item.projectId });
  const project = item ? db.projects.find(project => project.id === item.projectId) : null;
  const projectUsers = project ? [...new Set([...(project.access || []).map(entry => entry.userId), ...(db.teams.find(team => team.id === project.teamId)?.members || []).map(member => member.userId)])]
    .map(userId => db.users.find(user => user.id === userId)).filter(user => user && user.platformRole === 'user') : [];

  if (!item) return <aside className="task-detail"><div className="empty"><div><strong>Выберите задачу</strong><span>Карточка появится справа.</span></div></div></aside>;

  function patch(key, value) {
    if (key === 'status' && !canStatus) return;
    if (key !== 'status' && !canEdit) return;
    updateItem(item.id, { [key]: value });
  }

  function patchSmart(index, value) {
    if (!canEdit) return;
    const nextSmart = [...(item.smart || ['', '', '', '', ''])];
    nextSmart[index] = value;
    updateItem(item.id, { smart: nextSmart });
  }

  function submitComment() {
    if (!comment.trim()) return;
    addComment(item.id, comment);
    setComment('');
  }

  function submitSubtask() {
    if (!subtask.trim() || !canSubtasks) return;
    addSubtask(item.id, subtask);
    setSubtask('');
  }

  return (
    <aside className="task-detail task-detail-slide">
      <section className="detail-card detail-hero compact-card task-compact-hero">
        <button className="detail-close" onClick={() => setRoute(prev => ({ ...prev, itemId: null }))} title="Закрыть">×</button>
        <div className="task-compact-head">
          <input className="input detail-title-input" disabled={!canEdit} value={item.title} onChange={e => patch('title', e.target.value)} />
          <div className="task-detail-statuses">
            <Badge value={item.type} />
            <select className={`status-pill-select status-${item.status}`} disabled={!canStatus} value={item.status} onChange={e => patch('status', e.target.value)}>{STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            {isTaskOwnedBy(currentUser, item) ? <span className="badge badge-member">своя</span> : null}
          </div>
        </div>
      </section>

      <section className="detail-card compact-card">
        <div className="section-title">Основное</div>
        <label className="field"><span className="label">Результат (Deliverable)</span><input className="input" disabled={!canEdit} value={item.result || ''} onChange={e => patch('result', e.target.value)} /></label>
        <div className="detail-field-stack">
          <label className="field"><span className="label">Старт</span><input className="input" type="date" disabled={!canEdit} value={item.start || ''} onChange={e => patch('start', e.target.value)} /></label>
          <label className="field"><span className="label">Дедлайн</span><input className="input" type="date" disabled={!canEdit} value={item.due || ''} onChange={e => patch('due', e.target.value)} /></label>
          <label className="field"><span className="label">Ответственный</span><select className="select" disabled={!canEdit} value={item.ownerId || ''} onChange={e => patch('ownerId', e.target.value)}><option value="">Не назначен</option>{projectUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        </div>
      </section>

      <section className="detail-card smart-card compact-card">
        <div className="section-title">SMART-описание</div>
        <div className="smart-grid compact-smart-grid">
          {SMART_FIELDS.map(([letter, title, hint], index) => (
            <label className="smart-field" key={letter}>
              <span className="smart-letter">{letter}</span>
              <span className="smart-meta"><strong>{title}</strong><small>{hint}</small></span>
              <textarea className="textarea smart-textarea" disabled={!canEdit} value={(item.smart || [])[index] || ''} onChange={e => patchSmart(index, e.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="detail-card compact-card">
        <div className="section-title">Подзадачи</div>
        {(item.subtasks || []).map(task => <div className="subtask-row" key={task.id}><input type="checkbox" disabled={!canSubtasks} checked={task.done} onChange={e => updateSubtask(item.id, task.id, { done: e.target.checked })} /><input className="input" style={{ padding: 5 }} disabled={!canSubtasks} value={task.title} onChange={e => updateSubtask(item.id, task.id, { title: e.target.value })} /><input className="input" style={{ padding: 5 }} disabled={!canSubtasks} type="date" value={task.due || ''} onChange={e => updateSubtask(item.id, task.id, { due: e.target.value })} /></div>)}
        {canSubtasks ? <div style={{ display: 'flex', gap: 8 }}><input className="input" value={subtask} placeholder="Новая подзадача" onChange={e => setSubtask(e.target.value)} /><Button size="sm" onClick={submitSubtask}>Добавить</Button></div> : <div className="small muted">Нет прав на изменение подзадач.</div>}
      </section>

      {canViewComments ? <section className="detail-card compact-card">
        <div className="section-title">Комментарии</div>
        {(item.comments || []).map(itemComment => {
          const user = db.users.find(entry => entry.id === itemComment.userId);
          return <div className="comment" key={itemComment.id || `${itemComment.userId}${itemComment.date}`}><div className="strong small">{user?.name || 'Пользователь'} <span className="muted">· {itemComment.date}</span></div><div className="small muted">{itemComment.text}</div></div>;
        })}
        {canComment ? <div style={{ display: 'grid', gap: 8 }}><textarea className="textarea" value={comment} onChange={e => setComment(e.target.value)} placeholder="Комментарий" /><Button size="sm" onClick={submitComment}>Отправить</Button></div> : null}
      </section> : null}

      {hasPermission('project.task.delete', { projectId: item.projectId }) ? <Button variant="danger" onClick={() => { if (deleteItem(item.id)) setRoute(prev => ({ ...prev, itemId: null })); }}>Удалить задачу</Button> : null}
    </aside>
  );
}
