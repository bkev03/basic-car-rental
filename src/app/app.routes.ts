import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        title: 'Basic Car Rental - Home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'about',
        title: 'Basic Car Rental - About Us',
        loadComponent: () => import('./pages/about/about').then(m => m.About)
    },
    {
        path: 'admin',
        title: 'Basic Car Rental - Admin',
        loadComponent: () => import('./pages/admin/admin').then(m => m.Admin)
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        title: 'Basic Car Rental - 404',
        loadComponent: () => import('./shared/page-not-found/page-not-found').then(m => m.PageNotFound)
    }
];
