import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('src/app/shell/tabs/tabs.routes').then((m) => m.routes),
  },
];
