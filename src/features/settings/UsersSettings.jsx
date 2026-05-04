import React, { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';
import { Avatar } from '../../shared/ui/Avatar.jsx';

function splitName(user) {
  const firstName = user.firstName || (user.name || '').split(' ').slice(0, 1).join(' ');
  const lastName = user.lastName || (user.name || '').split(' ').slice(1).join(' ');
  return { firstName, lastName };
}

const PAGE_SIZE = 8;

export function UsersSettings() {
  const { db, currentUser, createUser, updateUser, deleteUser, hasPermission } = useApp();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: 'demo123', platformRole: 'user' });
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const canCreate = hasPermission('user.create');
  const canEdit = hasPermission('user.edit');
  const canDelete = hasPermission('user.delete');
  const canRole = hasPermission('user.setPlatformRole');

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })); }
  function submit() {
    if (!form.firstName.trim() || !form.email.trim()) return;
    const result = createUser({ ...form, name: [form.firstName, form.lastName].filter(Boolean).join(' ').trim() });
    if (result.ok) setForm({ firstName: '', lastName: '', email: '', password: 'demo123', platformRole: 'user' });
    else alert(result.message);
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.users
      .map(user => ({ ...user, ...splitName(user) }))
      .filter(user => !q || `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(q))
      .filter(user => roleFilter === 'all' || user.platformRole === roleFilter)
      .filter(user => statusFilter === 'all' || (user.status || 'active') === statusFilter);
  }, [db.users, query, roleFilter, statusFilter]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const shown = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="grid compact-grid users-settings-compact">
      {canCreate ? <section className="card card-pad compact-card user-create-compact">
        <div className="section-title">Создать пользователя</div>
        <div className="user-create-row">
          <input className="input" placeholder="Имя" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
          <input className="input" placeholder="Фамилия" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          <input className="input" placeholder="Пароль" value={form.password} onChange={e => set('password', e.target.value)} />
          <select className="select" value={form.platformRole} disabled={currentUser.platformRole !== 'superadmin'} onChange={e => set('platformRole', e.target.value)}><option value="user">Пользователь</option><option value="admin">Админ</option>{currentUser.platformRole === 'superadmin' ? <option value="superadmin">Суперадмин</option> : null}</select>
          <Button variant="primary" onClick={submit}>Создать</Button>
        </div>
      </section> : null}

      <section className="card card-pad compact-card users-toolbar">
        <input className="input" placeholder="Поиск по имени или email" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} />
        <select className="select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}><option value="all">Все роли</option><option value="superadmin">Суперадмин</option><option value="admin">Админ</option><option value="user">Пользователь</option></select>
        <select className="select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}><option value="all">Все статусы</option><option value="active">Активен</option><option value="blocked">Заблокирован</option></select>
        <span className="small muted">{rows.length} пользователей</span>
      </section>

      <section className="table-card compact-table-card users-one-line-table">
        <div className="table-head users-one-line-head"><div>Пользователь</div><div>Имя</div><div>Фамилия</div><div>Email</div><div>Роль</div><div>Статус</div><div>Действия</div></div>
        {shown.map(user => <div className="table-row users-one-line-row" key={user.id}>
          <div><Avatar user={user} size="sm" /></div>
          <input className="input" disabled={!canEdit} value={user.firstName || ''} onChange={e => updateUser(user.id, { firstName: e.target.value, lastName: user.lastName || '' })} />
          <input className="input" disabled={!canEdit} value={user.lastName || ''} onChange={e => updateUser(user.id, { firstName: user.firstName || '', lastName: e.target.value })} />
          <input className="input" disabled={!canEdit} type="email" value={user.email} onChange={e => updateUser(user.id, { email: e.target.value })} />
          <select className="select" disabled={!canRole || currentUser.platformRole !== 'superadmin'} value={user.platformRole} onChange={e => updateUser(user.id, { platformRole: e.target.value })}><option value="user">Пользователь</option><option value="admin">Админ</option><option value="superadmin">Супер</option></select>
          <select className="select" disabled={!canEdit} value={user.status || 'active'} onChange={e => updateUser(user.id, { status: e.target.value })}><option value="active">Активен</option><option value="blocked">Блок</option></select>
          <div className="users-actions one-line-actions">{canEdit ? <Button size="sm" onClick={() => { const password = prompt('Новый пароль', user.password || ''); if (password) updateUser(user.id, { password }); }}>Пароль</Button> : null}{canDelete && user.id !== currentUser.id ? <Button size="sm" variant="danger" onClick={() => deleteUser(user.id)}>Архив</Button> : null}</div>
        </div>)}
        <div className="users-pagination"><span className="small muted">Страница {safePage} из {pages}</span><div><Button size="sm" variant="ghost" disabled={safePage <= 1} onClick={() => setPage(prev => Math.max(1, prev - 1))}>‹ Назад</Button><Button size="sm" variant="ghost" disabled={safePage >= pages} onClick={() => setPage(prev => Math.min(pages, prev + 1))}>Вперёд ›</Button></div></div>
      </section>
    </div>
  );
}
