import React, { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';
import { Badge } from '../../shared/ui/Badge.jsx';

function splitName(user) {
  const firstName = user.firstName || (user.name || '').split(' ').slice(0, 1).join(' ');
  const lastName = user.lastName || (user.name || '').split(' ').slice(1).join(' ');
  return { firstName, lastName };
}

export function UsersSettings() {
  const { db, currentUser, createUser, updateUser, deleteUser, hasPermission } = useApp();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: 'demo123', platformRole: 'user' });
  const canCreate = hasPermission('user.create');
  const canEdit = hasPermission('user.edit');
  const canDelete = hasPermission('user.delete');
  const canRole = hasPermission('user.setPlatformRole');

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function submit() {
    if (!form.firstName.trim() || !form.email.trim()) return;
    const result = createUser({
      ...form,
      name: [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
    });
    if (result.ok) setForm({ firstName: '', lastName: '', email: '', password: 'demo123', platformRole: 'user' });
    else alert(result.message);
  }

  const rows = useMemo(() => db.users.map(user => ({ ...user, ...splitName(user) })), [db.users]);

  return (
    <div className="grid compact-grid">
      {canCreate ? <section className="card card-pad compact-card">
        <div className="section-title">Создать пользователя</div>
        <div className="form-grid compact-form-grid">
          <label className="field"><span className="label">Имя</span><input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></label>
          <label className="field"><span className="label">Фамилия</span><input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></label>
          <label className="field"><span className="label">Email</span><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></label>
          <label className="field"><span className="label">Пароль</span><input className="input" value={form.password} onChange={e => set('password', e.target.value)} /></label>
          <label className="field"><span className="label">Роль платформы</span><select className="select" value={form.platformRole} disabled={currentUser.platformRole !== 'superadmin'} onChange={e => set('platformRole', e.target.value)}><option value="user">Пользователь</option><option value="admin">Администратор</option>{currentUser.platformRole === 'superadmin' ? <option value="superadmin">Суперадмин</option> : null}</select></label>
        </div>
        <Button variant="primary" onClick={submit}>Создать пользователя</Button>
      </section> : null}

      <section className="table-card compact-table-card">
        <div className="table-head" style={{ gridTemplateColumns: '1.5fr 1fr 120px 150px' }}><div>Пользователь</div><div>Роль платформы</div><div>Статус</div><div>Действия</div></div>
        {rows.map(user => <div className="table-row users-edit-row" style={{ gridTemplateColumns: '1.5fr 1fr 120px 150px' }} key={user.id}>
          <div className="users-edit-main">
            <div className="users-row-top"><Avatar user={user} /><div className="users-name-grid"><label className="field"><span className="label">Имя</span><input className="input" disabled={!canEdit} value={user.firstName || ''} onChange={e => updateUser(user.id, { firstName: e.target.value, lastName: user.lastName || '', name: [e.target.value, user.lastName || ''].filter(Boolean).join(' ').trim() })} /></label><label className="field"><span className="label">Фамилия</span><input className="input" disabled={!canEdit} value={user.lastName || ''} onChange={e => updateUser(user.id, { firstName: user.firstName || '', lastName: e.target.value, name: [user.firstName || '', e.target.value].filter(Boolean).join(' ').trim() })} /></label></div></div>
            <label className="field"><span className="label">Email</span><input className="input" type="email" disabled={!canEdit} value={user.email} onChange={e => updateUser(user.id, { email: e.target.value })} /></label>
          </div>
          <div>{canRole && currentUser.platformRole === 'superadmin' ? <select className="select" value={user.platformRole} onChange={e => updateUser(user.id, { platformRole: e.target.value })}><option value="user">Пользователь</option><option value="admin">Админ</option><option value="superadmin">Суперадмин</option></select> : <Badge value={user.platformRole} />}</div>
          <div><select className="select" disabled={!canEdit} value={user.status || 'active'} onChange={e => updateUser(user.id, { status: e.target.value })}><option value="active">Активен</option><option value="blocked">Заблокирован</option></select></div>
          <div className="users-actions">{canEdit ? <Button size="sm" onClick={() => { const password = prompt('Новый пароль', user.password || ''); if (password) updateUser(user.id, { password }); }}>Пароль</Button> : null}{canDelete && user.id !== currentUser.id ? <Button size="sm" variant="danger" onClick={() => deleteUser(user.id)}>Архив</Button> : null}</div>
        </div>)}
      </section>
    </div>
  );
}
