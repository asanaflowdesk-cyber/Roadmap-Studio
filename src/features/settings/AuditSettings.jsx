import React from 'react';
import { useApp } from '../../app/AppContext.jsx';

export function AuditSettings() {
  const { db } = useApp();
  const audit = (db.audit || []).slice(0, 150);
  return <div className="table-card">
    <div className="table-head" style={{ gridTemplateColumns: '120px 180px minmax(0,1fr)' }}><div>Дата</div><div>Пользователь</div><div>Действие</div></div>
    {audit.map(row => {
      const user = db.users.find(u => u.id === row.userId);
      return <div key={row.id} className="table-row" style={{ gridTemplateColumns: '120px 180px minmax(0,1fr)' }}><div>{row.date}</div><div>{user?.name || row.userId}</div><div>{row.action}</div></div>;
    })}
  </div>;
}
