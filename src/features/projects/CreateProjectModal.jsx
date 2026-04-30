import React, { useMemo, useState } from 'react';
import { Modal } from '../../shared/ui/Modal.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { useApp } from '../../app/AppContext.jsx';
import { today } from '../../shared/utils/date.js';

export function CreateProjectModal({ open, onClose, teamId }) {
  const { db, currentUser, createProject, createProjectFromTemplate, hasPermission } = useApp();
  const [mode, setMode] = useState('blank');
  const [form, setForm] = useState({ title: '', desc: '', horizon: '', start: today(), due: today(), status: 'new', templateId: '', managerId: '' });
  const team = db.teams.find(item => item.id === teamId);
  const teamUsers = useMemo(() => (team?.members || [])
    .map(member => db.users.find(user => user.id === member.userId))
    .filter(user => user && user.status !== 'blocked' && user.platformRole === 'user'), [db, teamId]);
  const templates = useMemo(() => (db.projectTemplates || []).filter(t => !t.isArchived && t.isActive && hasPermission('template.use', { teamId: t.teamId || teamId })), [db, teamId]);
  const needManager = currentUser?.platformRole !== 'user';

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function submit() {
    if (!form.title.trim() && mode === 'blank') return;
    if (needManager && !form.managerId) return;
    const project = mode === 'template'
      ? createProjectFromTemplate(teamId, form.templateId, form)
      : createProject(teamId, form);
    if (project) {
      setForm({ title: '', desc: '', horizon: '', start: today(), due: today(), status: 'new', templateId: '', managerId: '' });
      setMode('blank');
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Новый проект" footer={<><Button onClick={onClose}>Отмена</Button><Button variant="primary" onClick={submit}>Создать</Button></>}>
      <div className="tabs"><button className={`tab ${mode === 'blank' ? 'active' : ''}`} onClick={() => setMode('blank')}>С нуля</button><button className={`tab ${mode === 'template' ? 'active' : ''}`} onClick={() => setMode('template')}>Из шаблона</button></div>
      {mode === 'template' ? <label className="field"><span className="label">Шаблон</span><select className="select" value={form.templateId} onChange={e => {
        const tpl = templates.find(t => t.id === e.target.value);
        setForm(prev => ({ ...prev, templateId: e.target.value, title: tpl ? `${tpl.title} — новый проект` : prev.title, desc: tpl?.desc || prev.desc }));
      }}><option value="">Выберите шаблон</option>{templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label> : null}
      <label className="field"><span className="label">Название</span><input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></label>
      <label className="field"><span className="label">Описание</span><textarea className="textarea" value={form.desc} onChange={e => set('desc', e.target.value)} /></label>
      <div className="form-grid">
        <label className="field"><span className="label">Старт</span><input className="input" type="date" value={form.start} onChange={e => set('start', e.target.value)} /></label>
        <label className="field"><span className="label">Дедлайн</span><input className="input" type="date" value={form.due} onChange={e => set('due', e.target.value)} /></label>
      </div>
      {needManager ? <label className="field"><span className="label">Менеджер проекта</span><select className="select" value={form.managerId} onChange={e => set('managerId', e.target.value)}><option value="">Выберите пользователя</option>{teamUsers.map(user => <option value={user.id} key={user.id}>{user.name}</option>)}</select><span className="small muted">Админ и суперадмин не добавляются в участники проекта. Назначьте рабочего менеджера проекта.</span></label> : null}
      <label className="field"><span className="label">Горизонт</span><input className="input" value={form.horizon} onChange={e => set('horizon', e.target.value)} placeholder="Q2 2026" /></label>
    </Modal>
  );
}
