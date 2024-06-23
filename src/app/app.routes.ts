import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'folder/inbox',
    pathMatch: 'full',
  }, 
  {
    path: 'folder/map',
    loadComponent: () => import('./map/map.page').then(m => m.MapPage)
  },
  {
    path: 'folder/gps',
    loadComponent: () => import('./gps/gps.page').then( m => m.GpsPage)
  },
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },

];
