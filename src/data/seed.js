import { DEFAULT_ROLE_PERMISSIONS } from './permissions.js';

export const SEED_DATA = {
  appVersion: 2,
  rolePermissions: DEFAULT_ROLE_PERMISSIONS,
  users: [
    {
      id: 'u1',
      name: 'Алёна Смирнова',
      email: 'superadmin@roadmap.local',
      password: 'admin123',
      initials: 'АС',
      color: 'linear-gradient(135deg,#245B8F,#48A3B8)',
      platformRole: 'superadmin',
      status: 'active'
    },
    {
      id: 'u2',
      name: 'Мария Соколова',
      email: 'maria@roadmap.local',
      password: 'demo123',
      initials: 'МС',
      color: 'linear-gradient(135deg,#1D7C6F,#64B6AC)',
      platformRole: 'user',
      status: 'active'
    },
    {
      id: 'u3',
      name: 'Иван Петров',
      email: 'ivan@roadmap.local',
      password: 'demo123',
      initials: 'ИП',
      color: 'linear-gradient(135deg,#596F9D,#7EA0C4)',
      platformRole: 'admin',
      status: 'active'
    },
    {
      id: 'u4',
      name: 'Андрей Ким',
      email: 'andrey@roadmap.local',
      password: 'demo123',
      initials: 'АК',
      color: 'linear-gradient(135deg,#B16B54,#D6A081)',
      platformRole: 'user',
      status: 'active'
    },
    {
      id: 'u5',
      name: 'Светлана Рай',
      email: 'svetlana@roadmap.local',
      password: 'demo123',
      initials: 'СР',
      color: 'linear-gradient(135deg,#345F7A,#89A9B8)',
      platformRole: 'user',
      status: 'active'
    }
  ],
  teams: [
    {
      id: 't1',
      name: 'Digital Products',
      color: 'linear-gradient(135deg,#245B8F,#48A3B8)',
      members: [
        { userId: 'u2', role: 'teamLead' },
        { userId: 'u4', role: 'member' }
      ]
    },
    {
      id: 't2',
      name: 'BI & Analytics',
      color: 'linear-gradient(135deg,#596F9D,#7EA0C4)',
      members: [
        { userId: 'u5', role: 'teamLead' }
      ]
    }
  ],
  projects: [
    {
      id: 'p1',
      teamId: 't1',
      title: 'Запуск цифрового канала МФО',
      desc: 'Стратегия, интеграции и MVP.',
      status: 'progress',
      horizon: 'Q2 2024',
      start: '2024-05-16',
      due: '2024-07-31',
      ownerId: 'u2',
      access: [
        { userId: 'u2', role: 'projectManager' },
        { userId: 'u4', role: 'member' },
        { userId: 'u5', role: 'guest' }
      ]
    },
    {
      id: 'p2',
      teamId: 't1',
      title: 'Telegram Bot → Bitrix24',
      desc: 'Автоматизация входящих заявок и маршрутизации задач.',
      status: 'progress',
      horizon: 'Q2 2026',
      start: '2026-04-15',
      due: '2026-06-01',
      ownerId: 'u2',
      access: [
        { userId: 'u2', role: 'projectManager' },
        { userId: 'u4', role: 'projectManager' }
      ]
    },
    {
      id: 'p3',
      teamId: 't2',
      title: 'Power BI Platform',
      desc: 'RLS, витрины, семантические модели и дашборды.',
      status: 'new',
      horizon: 'Q3 2026',
      start: '2026-05-01',
      due: '2026-08-01',
      ownerId: 'u5',
      access: [
        { userId: 'u5', role: 'projectManager' }
      ]
    }
  ],
  phases: [
    { id: 'ph1', projectId: 'p1', title: 'Стратегия и анализ', sort: 1 },
    { id: 'ph2', projectId: 'p1', title: 'Проектирование', sort: 2 },
    { id: 'ph3', projectId: 'p1', title: 'Интеграция и приёмка', sort: 3 },
    { id: 'ph4', projectId: 'p2', title: 'Диагностика данных', sort: 1 },
    { id: 'ph5', projectId: 'p3', title: 'Архитектура', sort: 1 }
  ],
  items: [
    {
      id: 'i1', projectId: 'p1', phaseId: 'ph1', type: 'task',
      title: 'Определить продукт и программу страхования',
      result: 'Согласованные программы и условия',
      desc: 'Собрать параметры продукта, ограничения, тарифную сетку и условия согласования.',
      status: 'progress', ownerId: 'u2', people: ['u4'],
      start: '2024-05-16', due: '2024-05-22',
      smart: ['Продукт описан', 'Параметры утверждены', 'Есть владельцы', 'Нужно для запуска', 'До 22.05.2024'],
      subtasks: [
        { id: 's1', title: 'Собрать параметры продукта', due: '2024-05-18', done: true },
        { id: 's2', title: 'Согласовать исключения', due: '2024-05-21', done: false }
      ],
      comments: [{ id: 'c1', userId: 'u2', text: 'Проверить тарифную сетку.', date: '2024-05-16' }]
    },
    {
      id: 'i2', projectId: 'p1', phaseId: 'ph1', type: 'task',
      title: 'Финансовая модель канала', result: 'Модель на 18 месяцев', desc: '',
      status: 'new', ownerId: 'u2', people: [], start: '2024-05-23', due: '2024-05-25',
      smart: ['', '', '', '', ''], subtasks: [], comments: []
    },
    {
      id: 'i3', projectId: 'p1', phaseId: 'ph2', type: 'task',
      title: 'Процесс продаж и страхования', result: 'Карта процесса', desc: '',
      status: 'progress', ownerId: 'u4', people: [], start: '2024-05-26', due: '2024-05-31',
      smart: ['', '', '', '', ''], subtasks: [], comments: []
    },
    {
      id: 'i4', projectId: 'p1', phaseId: 'ph2', type: 'risk',
      title: 'Риск задержки согласования ИТ', result: 'План обхода', desc: '',
      status: 'risk', ownerId: 'u2', people: [], start: '2024-06-01', due: '2024-06-05',
      smart: ['', '', '', '', ''], subtasks: [], comments: []
    },
    {
      id: 'i5', projectId: 'p1', phaseId: 'ph3', type: 'milestone',
      title: 'Приёмка MVP', result: 'Протоколы и акты', desc: '',
      status: 'done', ownerId: 'u2', people: ['u4'], start: '2024-06-21', due: '2024-06-30',
      smart: ['', '', '', '', ''], subtasks: [], comments: []
    },
    {
      id: 'i6', projectId: 'p2', phaseId: 'ph4', type: 'task',
      title: 'Передача chat_id из Telegram', result: 'Стабильный chat_id', desc: '',
      status: 'progress', ownerId: 'u2', people: ['u4'], start: '2026-04-15', due: '2026-04-22',
      smart: ['', '', '', '', ''], subtasks: [], comments: []
    },
    {
      id: 'i7', projectId: 'p3', phaseId: 'ph5', type: 'task',
      title: 'Карта источников данных', result: 'Реестр источников', desc: '',
      status: 'new', ownerId: 'u5', people: [], start: '2026-05-01', due: '2026-05-10',
      smart: ['', '', '', '', ''], subtasks: [], comments: []
    }
  ],
  dictionaries: [
    { id: 'd_status', code: 'task_statuses', title: 'Статусы задач', isSystem: true },
    { id: 'd_types', code: 'task_types', title: 'Типы элементов roadmap', isSystem: true },
    { id: 'd_project_roles', code: 'project_roles', title: 'Проектные роли', isSystem: true },
    { id: 'd_priorities', code: 'priorities', title: 'Приоритеты', isSystem: true }
  ],
  dictionaryItems: [
    { id: 'di_new', dictionaryId: 'd_status', code: 'new', title: 'Не начато', sort: 1, color: '#DDEEFF', isActive: true },
    { id: 'di_progress', dictionaryId: 'd_status', code: 'progress', title: 'В работе', sort: 2, color: '#E0F2F1', isActive: true },
    { id: 'di_approval', dictionaryId: 'd_status', code: 'approval', title: 'Согласование', sort: 3, color: '#E0F7FA', isActive: true },
    { id: 'di_risk', dictionaryId: 'd_status', code: 'risk', title: 'Риск', sort: 4, color: '#FFEBEE', isActive: true },
    { id: 'di_done', dictionaryId: 'd_status', code: 'done', title: 'Готово', sort: 5, color: '#E0F2F1', isActive: true },
    { id: 'di_task', dictionaryId: 'd_types', code: 'task', title: 'Задача', sort: 1, isActive: true },
    { id: 'di_milestone', dictionaryId: 'd_types', code: 'milestone', title: 'Веха', sort: 2, isActive: true },
    { id: 'di_risk_type', dictionaryId: 'd_types', code: 'risk', title: 'Риск', sort: 3, isActive: true },
    { id: 'di_pm', dictionaryId: 'd_project_roles', code: 'projectManager', title: 'Менеджер проекта', sort: 1, isActive: true },
    { id: 'di_member', dictionaryId: 'd_project_roles', code: 'member', title: 'Участник', sort: 2, isActive: true },
    { id: 'di_guest', dictionaryId: 'd_project_roles', code: 'guest', title: 'Гость', sort: 3, isActive: true },
    { id: 'di_high', dictionaryId: 'd_priorities', code: 'high', title: 'Высокий', sort: 1, isActive: true },
    { id: 'di_normal', dictionaryId: 'd_priorities', code: 'normal', title: 'Средний', sort: 2, isActive: true },
    { id: 'di_low', dictionaryId: 'd_priorities', code: 'low', title: 'Низкий', sort: 3, isActive: true }
  ],
  projectTemplates: [
    { id: 'tpl1', title: 'Запуск цифрового проекта', desc: 'Базовый шаблон: стратегия, проектирование, запуск и приемка.', category: 'Digital', visibility: 'all', teamId: null, isActive: true, isArchived: false, version: 1, createdBy: 'u1', updatedBy: 'u1', createdAt: '2026-04-30', updatedAt: '2026-04-30' },
    { id: 'tpl2', title: 'BI / Power BI внедрение', desc: 'Шаблон для аналитических проектов: источники, модель, RLS, дашборды.', category: 'Analytics', visibility: 'all', teamId: 't2', isActive: true, isArchived: false, version: 1, createdBy: 'u5', updatedBy: 'u5', createdAt: '2026-04-30', updatedAt: '2026-04-30' }
  ],
  templatePhases: [
    { id: 'tph1', templateId: 'tpl1', title: 'Инициация и SMART', sort: 1, durationDays: 5 },
    { id: 'tph2', templateId: 'tpl1', title: 'Проектирование процесса', sort: 2, durationDays: 10 },
    { id: 'tph3', templateId: 'tpl1', title: 'Запуск и приемка', sort: 3, durationDays: 7 },
    { id: 'tph4', templateId: 'tpl2', title: 'Источники и модель данных', sort: 1, durationDays: 8 },
    { id: 'tph5', templateId: 'tpl2', title: 'Дашборды и доступы', sort: 2, durationDays: 12 }
  ],
  templateItems: [
    { id: 'titem1', templateId: 'tpl1', templatePhaseId: 'tph1', type: 'task', title: 'Сформулировать SMART-цели', result: 'Цели проекта согласованы', relativeStartDay: 0, relativeDueDay: 2, defaultOwnerRole: 'projectManager', priority: 'high', sort: 1 },
    { id: 'titem2', templateId: 'tpl1', templatePhaseId: 'tph2', type: 'task', title: 'Описать процесс AS IS / TO BE', result: 'Карта процесса и зоны автоматизации', relativeStartDay: 3, relativeDueDay: 10, defaultOwnerRole: 'member', priority: 'normal', sort: 2 },
    { id: 'titem3', templateId: 'tpl1', templatePhaseId: 'tph3', type: 'milestone', title: 'Приёмка результата', result: 'Протокол приемки', relativeStartDay: 18, relativeDueDay: 22, defaultOwnerRole: 'projectManager', priority: 'high', sort: 3 },
    { id: 'titem4', templateId: 'tpl2', templatePhaseId: 'tph4', type: 'task', title: 'Собрать реестр источников', result: 'Источники, владельцы, частота обновления', relativeStartDay: 0, relativeDueDay: 4, defaultOwnerRole: 'projectManager', priority: 'high', sort: 1 },
    { id: 'titem5', templateId: 'tpl2', templatePhaseId: 'tph5', type: 'task', title: 'Настроить RLS и роли доступа', result: 'Ролевая модель опубликована', relativeStartDay: 9, relativeDueDay: 14, defaultOwnerRole: 'projectManager', priority: 'high', sort: 2 }
  ],
  templateVersions: [
    { id: 'tv1', templateId: 'tpl1', version: 1, changedBy: 'u1', changeComment: 'Создан стартовый шаблон', date: '2026-04-30', snapshot: {} },
    { id: 'tv2', templateId: 'tpl2', version: 1, changedBy: 'u5', changeComment: 'Создан BI-шаблон', date: '2026-04-30', snapshot: {} }
  ],
  notificationRules: [
    { id: 'nr_phase_created', eventCode: 'phase.created', title: 'Добавлена новая фаза', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member'], respectProjectVisibility: true },
    { id: 'nr_template_created', eventCode: 'template.created', title: 'Создан новый шаблон', isActive: true, channels: ['inApp'], targetRoles: ['superadmin', 'admin', 'teamLead'], respectProjectVisibility: false },
    { id: 'nr_template_updated', eventCode: 'template.updated', title: 'Изменён шаблон', isActive: true, channels: ['inApp'], targetRoles: ['superadmin', 'admin', 'teamLead'], respectProjectVisibility: false },
    { id: 'nr_task_completed', eventCode: 'task.completed', title: 'Задача завершена', isActive: true, channels: ['inApp'], targetRoles: ['projectManager'], respectProjectVisibility: true },
    { id: 'nr_task_overdue', eventCode: 'task.overdue', title: 'Задача просрочена', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member'], respectProjectVisibility: true, deadlineDays: 0 },
    { id: 'nr_deadline_soon', eventCode: 'task.deadline_soon', title: 'Скоро истекает срок', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member'], respectProjectVisibility: true, deadlineDays: 3 },
    { id: 'nr_member_added', eventCode: 'project.member_added', title: 'Вас добавили в проект', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member', 'guest'], respectProjectVisibility: true },
    { id: 'nr_role_changed', eventCode: 'project.role_changed', title: 'Изменилась роль в проекте', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member', 'guest'], respectProjectVisibility: true },
    { id: 'nr_dates_changed', eventCode: 'project.dates_changed', title: 'Сроки проекта изменились', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member'], respectProjectVisibility: true },
    { id: 'nr_phase_dates_changed', eventCode: 'phase.dates_changed', title: 'Сроки фазы изменились', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member'], respectProjectVisibility: true },
    { id: 'nr_task_dates_changed', eventCode: 'task.dates_changed', title: 'Сроки задачи изменились', isActive: true, channels: ['inApp'], targetRoles: ['projectManager', 'member'], respectProjectVisibility: true },
    { id: 'nr_project_from_template', eventCode: 'project.created_from_template', title: 'Проект создан из шаблона', isActive: true, channels: ['inApp'], targetRoles: ['projectManager'], respectProjectVisibility: true }
  ],
  notificationPreferences: [],
  notifications: [
    { id: 'n1', userId: 'u1', eventCode: 'system.ready', title: 'Система готова к настройке', message: 'Добавлены роли, шаблоны, уведомления, справочники и аудит.', isRead: false, createdAt: '2026-04-30' }
  ],
  notificationDeliveryLog: [],
  systemSettings: {
    deadlineSoonDays: 3,
    notificationHour: '09:00',
    useWorkdaysForTemplates: false,
    requireReasonOnArchive: true,
    requireCommentOnDateChange: false,
    locale: 'ru-KZ'
  },
  entityVersions: [],
  attachments: [],
  taskDependencies: [],
  approvalRequests: [],
  savedViews: [],
  favorites: [],
  archive: [],
  audit: [
    { id: 'a1', date: '2026-04-30', action: 'Система инициализирована', userId: 'u1' }
  ]
};
