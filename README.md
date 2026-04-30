# Roadmap Studio

Vite + React prototype for project roadmaps, roles, templates, notifications and audit.

## Demo login

```txt
email: superadmin@roadmap.local
password: admin123
```

Registration is not public. Users are created by the administrator in Settings → Users.

## Run locally

```bash
npm install
npm run dev
npm run build
```

## Vercel

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Included modules

- Role and permission matrix.
- User management without public registration.
- Team and project management.
- Project access roles: projectManager / member / guest / none.
- Project creation from templates.
- Template editor with phases, items, relative dates and versions.
- Notification rules and in-app notification center.
- Notification visibility linked to project access.
- Dictionaries for statuses, types, roles and priorities.
- Audit log.
- Archive and restore flow.
- System settings for notification timing and deadline warnings.
- Draft Supabase schema in `supabase/migrations/001_product_schema.sql`.

## Current storage

The prototype still uses `localStorage` as a temporary data layer. For multi-device work, connect Supabase and replace `src/services/storage.js` with database services.

## Important files

```txt
src/data/seed.js                         demo data and local dictionaries
src/data/permissions.js                  role meta and permission matrix
src/app/AppContext.jsx                   local business logic
src/features/settings/TemplatesSettings.jsx
src/features/settings/NotificationSettings.jsx
src/features/notifications/NotificationBell.jsx
supabase/migrations/001_product_schema.sql
```
