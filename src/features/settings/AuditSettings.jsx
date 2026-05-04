import React, { useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';

function actionLabel(row) {
  return row.meta?.summary || row.action || 'Изменение';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString('ru-RU') : value;
}

export function AuditSettings() {
  const { db } = useApp();
  const [query, setQuery] = useState('');
  const audit = (db.audit || []).slice(0, 300).filter(row => {
    const text = `${row.action} ${row.meta?.summary || ''} ${JSON.stringify(row.meta?.changes || [])}`.toLowerCase();
    return !query.trim() || text.includes(query.trim().toLowerCase());
  });
  return <div className="grid compact-grid">
    <section className="card card-pad compact-card audit-summary">
      <div><div className="section-title">Аудит действий</div><div className="small muted">Фиксируются сохранённые изменения. Вместо технического id показываются объект, поля, было/стало.</div></div>
      <span className="badge badge-task">{audit.length} записей</span>
    </section>
    <section className="card card-pad compact-card audit-toolbar"><input className="input" placeholder="Поиск по аудиту" value={query} onChange={e => setQuery(e.target.value)} /></section>
    <section className="table-card compact-table-card audit-table">
      <div className="table-head audit-head"><div>Дата</div><div>Пользователь</div><div>Действие</div><div>Детали</div></div>
      {!audit.length ? <div className="empty-mini">Лог пока пуст. Любое сохранённое изменение появится здесь.</div> : audit.map(row => {
        const user = db.users.find(u => u.id === row.userId);
        const changes = row.meta?.changes || [];
        return <div key={row.id} className="table-row audit-row"><div className="small muted">{formatDate(row.date)}</div><div className="strong small">{user?.name || row.userId}</div><div>{actionLabel(row)}</div><div className="audit-detail-list">{changes.slice(0, 3).map(change => <div key={`${row.id}-${change.table}-${change.entityId}`} className="audit-detail"><strong>{change.entityLabel}: {change.title}</strong>{change.fields?.length ? <span>{change.fields.map(field => `${field.label}: ${field.before} → ${field.after}`).join('; ')}</span> : <span>{change.type === 'create' ? 'создано' : change.type === 'delete' ? 'удалено' : 'изменено'}</span>}</div>)}{!changes.length ? <span className="small muted">—</span> : null}</div></div>;
      })}
    </section>
  </div>;
}
