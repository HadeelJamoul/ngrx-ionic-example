import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tasks',
        // modern Angular the lazy loading This means Angular loads the page only when the user visits that route.
        // if we used Component: TaskPage that easier but it would load the page immediately when the app starts, which is not efficient.
        loadChildren: () =>
          import('src/app/features/tasks/tasks.page').then((m) => m.TasksPage),
      },
      {
        path: 'settings',
        // modern Angular the lazy loading This means Angular loads the page only when the user visits that route.
        // if we used Component: TaskPage that easier but it would load the page immediately when the app starts, which is not efficient.
        loadChildren: () =>
          import('src/app/features/settings/settings.page').then(
            (m) => m.SettingsPage,
          ),
      },
      // redirect to tasks page if no path is provided
      {
        path: '',
        redirectTo: '/tabs/settings',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/settings',
    pathMatch: 'full',
  },
];
