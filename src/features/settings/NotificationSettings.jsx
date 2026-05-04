import React from 'react';
import { useApp } from '../../app/AppContext.jsx';

const roles = [
  ['superadmin', 'Суперадмин'], ['admin', 'Админ'], ['teamLead', 'Руководитель'],
  ['projectManager', 'Менеджер'], ['member', 'Участник'], ['guest', 'Гость']
];

export function NotificationSettings() {
  const { db, patchNotificationRule, hasPermission } = useApp();
  const canGlobal = hasPermission('notification.manageGlobal');
  const deliveryRows = (db.notificationDeliveryLog || []).slice(0, 40).map(row => ({
    ...row,
    notification: (db.notifications || []).find(n => n.id === row.notificationId)
  }));

  return <div className="grid">
    <div className="card card-pad">
      <div className="section-title">Глобальные правила уведомлений</div>
      <div className="table-card">
        <div className="table-head" style={{ gridTemplateColumns: '220px 70px 170px minmax(0,1fr)' }}><div>Событие</div><div>Вкл</div><div>Видимость проекта</div><div>Получатели</div></div>
        {(db.notificationRules || []).map(rule => <div key={rule.id} className="table-row" style={{ gridTemplateColumns: '220px 70px 170px minmax(0,1fr)' }}>
          <div><strong>{rule.title}</strong><div className="small muted">{rule.eventCode}</div></div>
          <input disabled={!canGlobal} type="checkbox" checked={Boolean(rule.isActive)} onChange={e => patchNotificationRule(rule.id, { isActive: e.target.checked })} />
          <select disabled={!canGlobal} className="select" value={rule.respectProjectVisibility ? 'yes' : 'no'} onChange={e => patchNotificationRule(rule.id, { respectProjectVisibility: e.target.value === 'yes' })}><option value="yes">Учитывать</option><option value="no">Не учитывать</option></select>
          <div className="role-toggle-list">
            {roles.map(([code, label]) => <label key={code} className="mini-check"><input disabled={!canGlobal} type="checkbox" checked={(rule.targetRoles || []).includes(code)} onChange={e => {
              const next = e.target.checked ? [...(rule.targetRoles || []), code] : (rule.targetRoles || []).filter(x => x !== code);
              patchNotificationRule(rule.id, { targetRoles: next });
            }} />{label}</label>)}
          </div>
        </div>)}
      </div>
    </div>
    <div className="card card-pad"><div className="section-title">Журнал доставки и прочтения</div>
      <div className="small muted">Лог фиксирует созданные in-app уведомления. Статус прочтения меняется сразу после открытия уведомления в колокольчике. Между устройствами realtime появится после подключения Supabase Realtime.</div>
      <div className="table-card" style={{ marginTop: 10 }}>
        <div className="table-head" style={{ gridTemplateColumns: '150px 140px 110px 110px minmax(0,1fr)' }}><div>Создано</div><div>Пользователь</div><div>Канал</div><div>Статус</div><div>Прочитано / Событие</div></div>
        {deliveryRows.map(row => <div key={row.id} className="table-row" style={{ gridTemplateColumns: '150px 140px 110px 110px minmax(0,1fr)' }}>
          <div>{new Date(row.sentAt).toLocaleString('ru-RU')}</div>
          <div>{db.users.find(u => u.id === row.userId)?.name || row.userId}</div>
          <div>{row.channel}</div>
          <div><span className={`badge ${row.status === 'read' ? 'badge-done' : 'badge-task'}`}>{row.status === 'read' ? 'Прочитано' : 'Создано'}</span></div>
          <div><span>{row.readAt ? new Date(row.readAt).toLocaleString('ru-RU') : '—'}</span><div className="small muted">{row.notification?.title || row.notificationId}</div></div>
        </div>)}
      </div>
    </div>
  </div>;
}
