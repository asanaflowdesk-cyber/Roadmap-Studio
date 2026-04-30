import React, { useState } from 'react';
import { Modal } from '../../shared/ui/Modal.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { useApp } from '../../app/AppContext.jsx';
import { today } from '../../shared/utils/date.js';

export function CreatePhaseModal({ open, onClose, projectId }) {
  const { createPhase } = useApp();
  const [title, setTitle] = useState('');
  function submit() {
    if (!title.trim()) return;
    createPhase(projectId, title);
    setTitle('');
    onClose();
  }
  return (
    <Modal title="Новая фаза" open={open} onClose={onClose} footer={<><Button onClick={onClose}>Отмена</Button><Button variant="primary" onClick={submit}>Создать</Button></>}>
      <label className="field"><span className="label">Название фазы</span><input className="input" value={title} onChange={event => setTitle(event.target.value)} placeholder="Например: Анализ и проектирование" /></label>
    </Modal>
  );
}

export function CreateTaskModal({ open, onClose, projectId }) {
  const { db, currentUser, createItem } = useApp();
  const phases = db.phases.filter(phase => phase.projectId === projectId).sort((a,b) => a.sort - b.sort);
  const project = db.projects.find(item => item.id === projectId);
  const teamUsers = project ? [...new Set([...(project.access || []).map(entry => entry.userId), ...(db.teams.find(team => team.id === project.teamId)?.members || []).map(member => member.userId)])]
    .map(userId => db.users.find(user => user.id === userId))
    .filter(user => user && user.status !== 'blocked' && user.platformRole === 'user') : [];
  const [form, setForm] = useState({
    phaseId: phases[0]?.id || '', type: 'task', title: '', result: '', desc: '', status: 'new', ownerId: '', start: today(), due: today(), people: []
  });

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function submit() {
    if (!form.title.trim() || !form.phaseId) return;
    createItem(projectId, { ...form, ownerId: form.ownerId || undefined });
    setForm({ phaseId: phases[0]?.id || '', type: 'task', title: '', result: '', desc: '', status: 'new', ownerId: '', start: today(), due: today(), people: [] });
    onClose();
  }

  return (
    <Modal title="Новая задача / веха / риск" open={open} onClose={onClose} footer={<><Button onClick={onClose}>Отмена</Button><Button variant="primary" onClick={submit}>Создать</Button></>}>
      <div className="form-grid">
        <label className="field"><span className="label">Фаза</span><select className="select" value={form.phaseId} onChange={e => set('phaseId', e.target.value)}>{phases.map(phase => <option key={phase.id} value={phase.id}>{phase.title}</option>)}</select></label>
        <label className="field"><span className="label">Тип</span><select className="select" value={form.type} onChange={e => set('type', e.target.value)}><option value="task">Задача</option><option value="milestone">Веха</option><option value="risk">Риск</option></select></label>
      </div>
      <label className="field"><span className="label">Ключевые задачи и вехи</span><input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></label>
      <label className="field"><span className="label">Результат (Deliverable)</span><input className="input" value={form.result} onChange={e => set('result', e.target.value)} /></label>
      <div className="form-grid">
        <label className="field"><span className="label">Старт</span><input className="input" type="date" value={form.start} onChange={e => set('start', e.target.value)} /></label>
        <label className="field"><span className="label">Дедлайн</span><input className="input" type="date" value={form.due} onChange={e => set('due', e.target.value)} /></label>
      </div>
      <label className="field"><span className="label">Ответственный</span><select className="select" value={form.ownerId} onChange={e => set('ownerId', e.target.value)}><option value="">{currentUser.platformRole === 'user' ? 'Я' : 'Не назначать'}</option>{teamUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
    </Modal>
  );
}
