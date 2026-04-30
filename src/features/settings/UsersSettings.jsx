import React, { useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';

export function UsersSettings() {
  const { db, currentUser, createUser, updateUser, deleteUser, hasPermission } = useApp();
  const [form, setForm] = useState({ name: '', email: '', password: 'demo123', platformRole: 'user' });
  const canCreate = hasPermission('user.create');
  const canEdit = hasPermission('user.edit');
  const canDelete = hasPermission('user.delete');
  const canRole = hasPermission('user.setPlatformRole');

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function submit() {
    if (!form.name.trim() || !form.email.trim()) return;
    const result = createUser(form);
    if (result.ok) setForm({ name: '', email: '', password: 'demo123', platformRole: 'user' });
    else alert(result.message);
  }

  return (
    <div className="grid">
      {canCreate ? <section className="card card-pad">
        <div className="section-title">Создать пользователя</div>
        <div className="form-grid">
          <label className="field"><span className="label">Имя</span><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></label>
          <label className="field"><span className="label">Email</span><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></label>
          <label className="field"><span className="label">Пароль</span><input className="input" value={form.password} onChange={e => set('password', e.target.value)} /></label>
          <label className="field"><span className="label">Роль платформы</span><select className="select" value={form.platformRole} disabled={currentUser.platformRole !== 'superadmin'} onChange={e => set('platformRole', e.target.value)}><option value="user">Пользователь</option><option value="admin">Администратор</option>{currentUser.platformRole === 'superadmin' ? <option value="superadmin">Суперадмин</option> : null}</select></label>
        </div>
        <Button variant="primary" onClick={submit}>Создать пользователя</Button>
      </section> : null}

      <section className="table-card">
        <div className="table-head" style={{ gridTemplateColumns: '1.8fr 1fr 1fr 160px' }}><div>Пользователь</div><div>Роль платформы</div><div>Статус</div><div>Действия</div></div>
        {db.users.map(user => <div className="table-row" style={{ gridTemplateColumns: '1.8fr 1fr 1fr 160px' }} key={user.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar user={user} /><div><div className="strong">{user.name}</div><div className="small muted">{user.email}</div></div></div>
          <div>{canRole && user.platformRole !== 'superadmin' && currentUser.platformRole === 'superadmin' ? <select className="select" value={user.platformRole} onChange={e => updateUser(user.id, { platformRole: e.target.value })}><option value="user">Пользователь</option><option value="admin">Админ</option></select> : <Badge value={user.platformRole} />}</div>
          <div><select className="select" disabled={!canEdit || user.platformRole === 'superadmin'} value={user.status || 'active'} onChange={e => updateUser(user.id, { status: e.target.value })}><option value="active">Активен</option><option value="blocked">Заблокирован</option></select></div>
          <div style={{ display: 'flex', gap: 6 }}>{canEdit ? <Button size="sm" onClick={() => { const password = prompt('Новый пароль', user.password || ''); if (password) updateUser(user.id, { password }); }}>Пароль</Button> : null}{canDelete && user.id !== currentUser.id ? <Button size="sm" variant="danger" onClick={() => deleteUser(user.id)}>Удалить</Button> : null}</div>
        </div>)}
      </section>
    </div>
  );
}
