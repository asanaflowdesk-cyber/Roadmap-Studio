import React from 'react';
import { useApp } from '../../app/AppContext.jsx';

const roles = [
  ['superadmin', 'Суперадмин'], ['admin', 'Админ'], ['teamLead', 'Руководитель'],
  ['projectManager', 'Менеджер'], ['member', 'Участник'], ['guest', 'Гость']
];

export function NotificationSettings() {
  const { db, patchNotificationRule, hasPermission } = useApp();
  const canGlobal = hasPermission('notification.manageGlobal');
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
    <div className="card card-pad"><div className="section-title">Журнал доставки</div>
      <div className="small muted">Показывает, какие in-app уведомления были созданы системой.</div>
      <div className="table-card" style={{ marginTop: 10 }}>
        <div className="table-head" style={{ gridTemplateColumns: '180px 130px 100px minmax(0,1fr)' }}><div>Дата</div><div>Пользователь</div><div>Канал</div><div>Статус</div></div>
        {(db.notificationDeliveryLog || []).slice(0, 30).map(row => <div key={row.id} className="table-row" style={{ gridTemplateColumns: '180px 130px 100px minmax(0,1fr)' }}><div>{new Date(row.sentAt).toLocaleString('ru-RU')}</div><div>{db.users.find(u => u.id === row.userId)?.name || row.userId}</div><div>{row.channel}</div><div>{row.status}</div></div>)}
      </div>
    </div>
  </div>;
}
