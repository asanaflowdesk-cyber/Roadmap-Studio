import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../app/AppContext.jsx';
import { Button } from '../../shared/ui/Button.jsx';

export function NotificationBell() {
  const { db, currentUser, markNotificationRead, markAllNotificationsRead, hasPermission } = useApp();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const wrapRef = useRef(null);
  const prevUnread = useRef(0);
  if (!hasPermission('notification.viewOwn')) return null;
  const items = useMemo(() => (db.notifications || []).filter(item => item.userId === currentUser.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 12), [db.notifications, currentUser.id]);
  const unread = items.filter(item => !item.isRead).length;

  useEffect(() => {
    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (unread > prevUnread.current) {
      const newest = items.find(item => !item.isRead);
      if (newest) {
        setToast(newest);
        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
      }
    }
    prevUnread.current = unread;
  }, [unread, items]);

  return (
    <div className="notify-wrap" ref={wrapRef}>
      <button className={`nav-btn notify-btn ${unread ? 'has-unread' : ''}`} onClick={() => setOpen(prev => !prev)} title="Уведомления">🔔{unread ? <span>{unread}</span> : null}</button>
      {toast ? <button className="notify-toast" onClick={() => { setOpen(true); setToast(null); if (!toast.isRead) markNotificationRead(toast.id); }}><strong>{toast.title}</strong><small>{toast.message}</small></button> : null}
      {open ? <div className="notify-panel card">
        <div className="notify-head"><strong>Уведомления</strong><Button size="sm" variant="ghost" onClick={markAllNotificationsRead}>Прочитать всё</Button></div>
        {!items.length ? <div className="empty-mini">Уведомлений нет.</div> : items.map(item => <button key={item.id} className={`notify-item ${item.isRead ? '' : 'unread'}`} onClick={() => markNotificationRead(item.id)}>
          <strong>{item.title}</strong><span>{item.message}</span><small>{new Date(item.createdAt).toLocaleString('ru-RU')}</small>
        </button>)}
      </div> : null}
    </div>
  );
}
