export const ROLE_META = {
  superadmin: {
    label: 'Суперадмин',
    scope: 'Платформа',
    icon: '◎',
    tone: 'indigo',
    description: 'Полный контроль над платформой: пользователи, команды, роли, системные настройки, аудит, шаблоны, уведомления и восстановление данных.'
  },
  admin: {
    label: 'Администратор',
    scope: 'Платформа',
    icon: '◈',
    tone: 'blue',
    description: 'Управляет пользователями, командами, справочниками, шаблонами и аудитом. Не меняет суперадмина.'
  },
  teamLead: {
    label: 'Руководитель команды',
    scope: 'Команда',
    icon: '◆',
    tone: 'green',
    description: 'Управляет своей командой, проектами, шаблонами команды, участниками и доступами.'
  },
  projectManager: {
    label: 'Менеджер проекта',
    scope: 'Проект',
    icon: '◇',
    tone: 'amber',
    description: 'Управляет конкретным проектом: фазы, задачи, сроки, участники и проектные уведомления.'
  },
  member: {
    label: 'Участник',
    scope: 'Проект',
    icon: '○',
    tone: 'slate',
    description: 'Работает с задачами в проектах, куда добавлен. Редактирует свои задачи и получает уведомления по видимым проектам.'
  },
  guest: {
    label: 'Гость',
    scope: 'Проект',
    icon: '△',
    tone: 'rose',
    description: 'Видит только явно разрешенные проекты. Ничего не изменяет.'
  }
};

export const PERMISSION_GROUPS = [
  {
    id: 'platformUsers',
    title: 'Пользователи',
    scope: 'Платформа',
    permissions: [
      ['user.create', 'Создать пользователя'],
      ['user.edit', 'Редактировать профиль пользователя'],
      ['user.delete', 'Деактивировать пользователя'],
      ['user.setPlatformRole', 'Назначить роль платформы'],
      ['user.resetPassword', 'Сбросить / изменить пароль']
    ]
  },
  {
    id: 'platformTeams',
    title: 'Команды',
    scope: 'Платформа',
    permissions: [
      ['team.create', 'Создать команду'],
      ['team.delete', 'Архивировать команду'],
      ['team.assignLead', 'Назначить руководителя команды'],
      ['team.viewAllPlatform', 'Видеть все команды платформы']
    ]
  },
  {
    id: 'system',
    title: 'Система',
    scope: 'Платформа',
    permissions: [
      ['system.settings', 'Изменить настройки платформы'],
      ['system.audit', 'Видеть аудит-лог'],
      ['system.reset', 'Сброс данных'],
      ['system.archive.view', 'Видеть архив'],
      ['system.archive.restore', 'Восстанавливать из архива'],
      ['system.scheduler.manage', 'Настраивать планировщик уведомлений']
    ]
  },
  {
    id: 'dictionaries',
    title: 'Справочники',
    scope: 'Платформа',
    permissions: [
      ['dictionary.view', 'Видеть справочники'],
      ['dictionary.manage', 'Создавать и редактировать справочники']
    ]
  },
  {
    id: 'teamMembers',
    title: 'Участники команды',
    scope: 'Команда',
    permissions: [
      ['team.member.add', 'Добавить участника в команду'],
      ['team.member.remove', 'Удалить участника из команды'],
      ['team.member.changeRole', 'Изменить роль в команде'],
      ['team.member.viewAll', 'Видеть всех участников команды']
    ]
  },
  {
    id: 'teamProjects',
    title: 'Проекты команды',
    scope: 'Команда',
    permissions: [
      ['team.project.create', 'Создать проект в команде'],
      ['team.project.delete', 'Архивировать проект'],
      ['team.project.viewList', 'Видеть список всех проектов команды'],
      ['team.project.manageAccess', 'Управлять доступами к проектам']
    ]
  },
  {
    id: 'teamSettings',
    title: 'Настройки команды',
    scope: 'Команда',
    permissions: [
      ['team.settings.rename', 'Переименовать команду']
    ]
  },
  {
    id: 'templates',
    title: 'Шаблоны проектов',
    scope: 'Платформа / Команда',
    permissions: [
      ['template.view', 'Видеть шаблоны'],
      ['template.use', 'Создавать проект из шаблона'],
      ['template.create', 'Создать шаблон'],
      ['template.update', 'Редактировать шаблон'],
      ['template.archive', 'Архивировать шаблон'],
      ['template.version.view', 'Видеть версии шаблона'],
      ['template.version.restore', 'Восстановить версию шаблона']
    ]
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    scope: 'Платформа / Личное',
    permissions: [
      ['notification.viewOwn', 'Видеть свои уведомления'],
      ['notification.manageOwn', 'Настраивать свои уведомления'],
      ['notification.manageGlobal', 'Настраивать глобальные правила'],
      ['notification.templates.manage', 'Редактировать тексты уведомлений'],
      ['notification.deliveryLog.view', 'Видеть журнал рассылок']
    ]
  },
  {
    id: 'projectStructure',
    title: 'Структура проекта',
    scope: 'Проект',
    permissions: [
      ['project.phase.manage', 'Создать / удалить фазу'],
      ['project.task.create', 'Создать задачу / веху / риск'],
      ['project.task.editAny', 'Редактировать любую задачу'],
      ['project.task.editOwn', 'Редактировать свои задачи'],
      ['project.task.delete', 'Удалить задачу'],
      ['project.task.statusAny', 'Менять статус любой задачи'],
      ['project.task.statusOwn', 'Менять статус своих задач'],
      ['project.subtask.manageAny', 'Добавлять подзадачи в любую задачу'],
      ['project.subtask.manageOwn', 'Добавлять подзадачи в свои задачи'],
      ['project.comment.create', 'Оставлять комментарии'],
      ['project.attachment.upload', 'Загружать вложения'],
      ['project.dependencies.manage', 'Управлять зависимостями задач'],
      ['project.approval.manage', 'Управлять согласованием']
    ]
  },
  {
    id: 'projectView',
    title: 'Просмотр',
    scope: 'Проект',
    permissions: [
      ['project.view', 'Видеть проект и все задачи'],
      ['project.comment.view', 'Видеть комментарии'],
      ['project.export', 'Экспортировать данные'],
      ['project.history.view', 'Видеть историю проекта']
    ]
  },
  {
    id: 'projectAccess',
    title: 'Доступы проекта',
    scope: 'Проект',
    permissions: [
      ['project.member.add', 'Добавить участника в проект'],
      ['project.member.changeRole', 'Изменить роль в проекте'],
      ['project.member.remove', 'Удалить участника из проекта']
    ]
  },
  {
    id: 'personalViews',
    title: 'Личные представления',
    scope: 'Личное',
    permissions: [
      ['savedView.create', 'Создавать личные представления'],
      ['savedView.manageOwn', 'Редактировать свои представления'],
      ['favorite.manageOwn', 'Управлять избранным']
    ]
  }
];

const allPermissions = PERMISSION_GROUPS.flatMap(group => group.permissions.map(([key]) => key));
const boolMap = (keys = []) => Object.fromEntries(allPermissions.map(key => [key, keys.includes(key)]));

export const DEFAULT_ROLE_PERMISSIONS = {
  superadmin: Object.fromEntries(allPermissions.map(key => [key, true])),
  admin: boolMap([
    'user.create', 'user.edit', 'user.delete', 'user.setPlatformRole', 'user.resetPassword',
    'team.create', 'team.delete', 'team.assignLead', 'team.viewAllPlatform',
    'system.settings', 'system.audit', 'system.archive.view', 'system.archive.restore',
    'dictionary.view', 'dictionary.manage',
    'team.member.add', 'team.member.remove', 'team.member.changeRole', 'team.member.viewAll',
    'team.project.create', 'team.project.delete', 'team.project.viewList', 'team.project.manageAccess', 'team.settings.rename',
    'template.view', 'template.use', 'template.create', 'template.update', 'template.archive', 'template.version.view', 'template.version.restore',
    'notification.viewOwn', 'notification.manageOwn', 'notification.manageGlobal', 'notification.templates.manage', 'notification.deliveryLog.view',
    'project.view', 'project.comment.view', 'project.export', 'project.history.view',
    'project.phase.manage', 'project.task.create', 'project.task.editAny', 'project.task.delete', 'project.task.statusAny',
    'project.subtask.manageAny', 'project.comment.create', 'project.attachment.upload', 'project.dependencies.manage', 'project.approval.manage',
    'project.member.add', 'project.member.changeRole', 'project.member.remove',
    'savedView.create', 'savedView.manageOwn', 'favorite.manageOwn'
  ]),
  teamLead: boolMap([
    'team.member.add', 'team.member.remove', 'team.member.changeRole', 'team.member.viewAll',
    'team.project.create', 'team.project.delete', 'team.project.viewList', 'team.project.manageAccess', 'team.settings.rename',
    'template.view', 'template.use', 'template.create', 'template.update', 'template.archive', 'template.version.view',
    'notification.viewOwn', 'notification.manageOwn',
    'dictionary.view',
    'project.view', 'project.comment.view', 'project.export', 'project.history.view',
    'project.phase.manage', 'project.task.create', 'project.task.editAny', 'project.task.delete', 'project.task.statusAny',
    'project.subtask.manageAny', 'project.comment.create', 'project.attachment.upload', 'project.dependencies.manage', 'project.approval.manage',
    'project.member.add', 'project.member.changeRole', 'project.member.remove',
    'savedView.create', 'savedView.manageOwn', 'favorite.manageOwn'
  ]),
  projectManager: boolMap([
    'template.view', 'template.use',
    'notification.viewOwn', 'notification.manageOwn',
    'dictionary.view',
    'project.phase.manage', 'project.task.create', 'project.task.editAny', 'project.task.editOwn',
    'project.task.delete', 'project.task.statusAny', 'project.task.statusOwn',
    'project.subtask.manageAny', 'project.subtask.manageOwn', 'project.comment.create',
    'project.view', 'project.comment.view', 'project.export', 'project.history.view',
    'project.member.add', 'project.member.changeRole', 'project.member.remove',
    'project.attachment.upload', 'project.dependencies.manage', 'project.approval.manage',
    'savedView.create', 'savedView.manageOwn', 'favorite.manageOwn'
  ]),
  member: boolMap([
    'template.view', 'template.use',
    'notification.viewOwn', 'notification.manageOwn',
    'dictionary.view',
    'project.task.create', 'project.task.editOwn', 'project.task.statusOwn',
    'project.subtask.manageOwn', 'project.comment.create', 'project.view', 'project.comment.view',
    'project.attachment.upload',
    'savedView.create', 'savedView.manageOwn', 'favorite.manageOwn'
  ]),
  guest: boolMap([
    'template.view', 'template.use',
    'notification.viewOwn', 'notification.manageOwn',
    'dictionary.view',
    'project.view', 'project.comment.view', 'savedView.create', 'savedView.manageOwn', 'favorite.manageOwn'
  ])
};

export function permissionKeys() {
  return allPermissions;
}
