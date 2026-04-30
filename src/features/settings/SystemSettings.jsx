import React from 'react';
import { useApp } from '../../app/AppContext.jsx';

export function SystemSettings() {
  const { db, updateSystemSettings, hasPermission } = useApp();
  const settings = db.systemSettings || {};
  const canEdit = hasPermission('system.settings');
  const set = (key, value) => updateSystemSettings({ [key]: value });
  return <div className="card card-pad">
    <div className="section-title">Системные настройки</div>
    <div className="form-grid">
      <label className="field"><span className="label">За сколько дней предупреждать о сроке</span><input disabled={!canEdit} className="input" type="number" value={settings.deadlineSoonDays ?? 3} onChange={e => set('deadlineSoonDays', Number(e.target.value))} /></label>
      <label className="field"><span className="label">Время рассылки</span><input disabled={!canEdit} className="input" type="time" value={settings.notificationHour || '09:00'} onChange={e => set('notificationHour', e.target.value)} /></label>
      <label className="field"><span className="label">Формат локали</span><input disabled={!canEdit} className="input" value={settings.locale || 'ru-KZ'} onChange={e => set('locale', e.target.value)} /></label>
      <label className="field"><span className="label">Расчет шаблонов по рабочим дням</span><select disabled={!canEdit} className="select" value={settings.useWorkdaysForTemplates ? 'yes' : 'no'} onChange={e => set('useWorkdaysForTemplates', e.target.value === 'yes')}><option value="no">Нет</option><option value="yes">Да</option></select></label>
    </div>
  </div>;
}
