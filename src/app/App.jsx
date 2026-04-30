import React from 'react';
import { useApp } from './AppContext.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { ProjectsPage } from '../pages/ProjectsPage.jsx';
import { OverviewPage } from '../pages/OverviewPage.jsx';
import { PeoplePage } from '../pages/PeoplePage.jsx';
import { MyTasksPage } from '../pages/MyTasksPage.jsx';
import { SettingsPage } from '../pages/SettingsPage.jsx';
import { ProjectPage } from '../pages/ProjectPage.jsx';

export function App() {
  const { currentUser, route } = useApp();
  if (!currentUser) return <LoginPage />;

  return (
    <AppLayout>
      {route.view === 'project' ? <ProjectPage /> : null}
      {route.view === 'projects' ? <ProjectsPage /> : null}
      {route.view === 'overview' ? <OverviewPage /> : null}
      {route.view === 'people' ? <PeoplePage /> : null}
      {route.view === 'mytasks' ? <MyTasksPage /> : null}
      {route.view === 'settings' ? <SettingsPage /> : null}
    </AppLayout>
  );
}
