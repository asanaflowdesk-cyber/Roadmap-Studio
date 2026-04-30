import React, { useEffect, useState } from 'react';
import { useApp } from '../app/AppContext.jsx';
import { ProfileSettings } from '../features/settings/ProfileSettings.jsx';
import { UsersSettings } from '../features/settings/UsersSettings.jsx';
import { TeamsSettings } from '../features/settings/TeamsSettings.jsx';
import { RolesSettings } from '../features/settings/RolesSettings.jsx';
import { TemplatesSettings } from '../features/settings/TemplatesSettings.jsx';
import { NotificationSettings } from '../features/settings/NotificationSettings.jsx';
import { DictionariesSettings } from '../features/settings/DictionariesSettings.jsx';
import { AuditSettings } from '../features/settings/AuditSettings.jsx';
import { ArchiveSettings } from '../features/settings/ArchiveSettings.jsx';
import { SystemSettings } from '../features/settings/SystemSettings.jsx';

const componentMap = {
  profile: ProfileSettings,
  teams: TeamsSettings,
  users: UsersSettings,
  roles: RolesSettings,
  templates: TemplatesSettings,
  notifications: NotificationSettings,
  dictionaries: DictionariesSettings,
  audit: AuditSettings,
  archive: ArchiveSettings,
  system: SystemSettings
};

export function SettingsPage() {
  const { hasPermission } = useApp();
  const availableTabs = [
    ['profile', 'Мой профиль', true],
    ['teams', 'Команды', hasPermission('team.create') || hasPermission('team.viewAllPlatform') || hasPermission('team.member.add')],
    ['users', 'Пользователи', hasPermission('user.create') || hasPermission('user.edit')],
    ['roles', 'Роли и доступы', hasPermission('system.settings')],
    ['templates', 'Шаблоны', hasPermission('template.view')],
    ['notifications', 'Уведомления', hasPermission('notification.manageOwn') || hasPermission('notification.manageGlobal')],
    ['dictionaries', 'Справочники', hasPermission('dictionary.view')],
    ['audit', 'Аудит', hasPermission('system.audit')],
    ['archive', 'Архив', hasPermission('system.archive.view')],
    ['system', 'Система', hasPermission('system.settings')]
  ].filter(([, , visible]) => visible);
  const [tab, setTab] = useState(availableTabs[0]?.[0] || 'profile');
  useEffect(() => { if (!availableTabs.some(([id]) => id === tab)) setTab(availableTabs[0]?.[0] || 'profile'); }, [availableTabs.map(([id]) => id).join('|')]);
  const Active = componentMap[tab] || ProfileSettings;

  return (
    <div className="page">
      <div className="page-narrow">
        <div className="page-head">
          <div><div className="eyebrow">Администрирование</div><h1 className="h1">Настройки</h1><div className="subtitle">Роли, шаблоны, уведомления, справочники, архив и аудит связаны с доступами.</div></div>
        </div>
        <div className="tabs">{availableTabs.map(([id, label]) => <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>)}</div>
        <Active />
      </div>
    </div>
  );
}
