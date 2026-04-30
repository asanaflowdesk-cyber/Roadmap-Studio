# Roadmap Studio: заложенные модули

В проект добавлены frontend-модули и локальные структуры данных под будущий Supabase backend.

## Реализовано в прототипе

- RBAC-матрица ролей и прав.
- Создание пользователей администратором, без публичной регистрации.
- Создание проекта с нуля или из шаблона.
- Редактируемые шаблоны проектов: фазы, типовые задачи, относительные сроки, версии.
- Уведомления: колокольчик, правила рассылки, журнал доставки.
- Уведомления учитывают видимость проекта.
- Справочники: статусы, типы, роли, приоритеты.
- Аудит действий.
- Архив вместо жесткого удаления.
- Системные настройки уведомлений и сроков.

## Заложено в схему Supabase

- project_templates / template_phases / template_items / template_versions
- notifications / notification_rules / notification_preferences / notification_delivery_log
- dictionaries / dictionary_items
- attachments
- task_dependencies
- approval_requests
- saved_views
- audit_log

## Важное ограничение текущей версии

Эта сборка остается frontend-прототипом на localStorage. Для работы с разных устройств нужно подключить Supabase и заменить storage.service на запросы к базе.
