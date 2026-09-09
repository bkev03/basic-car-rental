import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        title: 'Basic Car Rental - Home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'search',
        title: 'Basic Car Rental - Search',
        loadComponent: () => import('./pages/search/search').then(m => m.Search)
    },
    {
        path: 'rent',
        title: 'Basic Car Rental - Rent Car',
        loadComponent: () => import('./pages/rent/rent').then(m => m.Rent)
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
