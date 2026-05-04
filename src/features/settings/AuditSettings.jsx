import React from 'react';
import { useApp } from '../../app/AppContext.jsx';

export function AuditSettings() {
  const { db } = useApp();
  const audit = (db.audit || []).slice(0, 200);
  return <div className="grid compact-grid">
    <section className="card card-pad compact-card audit-summary">
      <div><div className="section-title">Аудит действий</div><div className="small muted">Фиксируются изменения пользователей, ролей, проектов, задач, шаблонов, справочников, уведомлений и системных настроек.</div></div>
      <span className="badge badge-task">{audit.length} записей</span>
    </section>
    <section className="table-card compact-table-card audit-table">
      <div className="table-head" style={{ gridTemplateColumns: '104px 170px minmax(0,1.5fr) minmax(0,1fr)' }}><div>Дата</div><div>Пользователь</div><div>Действие</div><div>Детали</div></div>
      {!audit.length ? <div className="empty-mini">Лог пока пуст. Любое сохранённое изменение появится здесь.</div> : audit.map(row => {
        const user = db.users.find(u => u.id === row.userId);
        return <div key={row.id} className="table-row" style={{ gridTemplateColumns: '104px 170px minmax(0,1.5fr) minmax(0,1fr)' }}><div className="small muted">{row.date}</div><div className="strong small">{user?.name || row.userId}</div><div>{row.action}</div><div className="small muted audit-meta">{row.meta ? JSON.stringify(row.meta) : '—'}</div></div>;
      })}
    </section>
  </div>;
}
