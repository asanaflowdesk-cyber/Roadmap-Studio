import React, { useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';

export function NotificationBell() {
  const { db, currentUser, markNotificationRead, markAllNotificationsRead, hasPermission } = useApp();
  const [open, setOpen] = useState(false);
  if (!hasPermission('notification.viewOwn')) return null;
  const items = (db.notifications || []).filter(item => item.userId === currentUser.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 12);
  const unread = items.filter(item => !item.isRead).length;
  return (
    <div className="notify-wrap">
      <button className={`nav-btn notify-btn ${unread ? 'has-unread' : ''}`} onClick={() => setOpen(prev => !prev)} title="Уведомления">🔔{unread ? <span>{unread}</span> : null}</button>
      {open ? <div className="notify-panel card">
        <div className="notify-head"><strong>Уведомления</strong><Button size="sm" variant="ghost" onClick={markAllNotificationsRead}>Прочитать всё</Button></div>
        {!items.length ? <div className="empty-mini">Уведомлений нет.</div> : items.map(item => <button key={item.id} className={`notify-item ${item.isRead ? '' : 'unread'}`} onClick={() => markNotificationRead(item.id)}>
          <strong>{item.title}</strong><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString('ru-RU')}</small>
        </button>)}
      </div> : null}
    </div>
  );
}
