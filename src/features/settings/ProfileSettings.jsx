import React, { useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';

export function ProfileSettings() {
  const { currentUser, updateUser, resetDemoData, hasPermission } = useApp();
  const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email, password: currentUser.password });
  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  return (
    <div className="card card-pad">
      <div className="section-title">Мой профиль</div>
      <div className="form-grid">
        <label className="field"><span className="label">Имя</span><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></label>
        <label className="field"><span className="label">Email</span><input className="input" value={form.email} onChange={e => set('email', e.target.value)} /></label>
      </div>
      <label className="field"><span className="label">Пароль</span><input className="input" value={form.password} onChange={e => set('password', e.target.value)} /></label>
      <Button variant="primary" onClick={() => updateUser(currentUser.id, form)}>Сохранить профиль</Button>
      {hasPermission('system.reset') ? <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}><Button variant="danger" onClick={resetDemoData}>Сбросить демо-данные</Button></div> : null}
    </div>
  );
}
