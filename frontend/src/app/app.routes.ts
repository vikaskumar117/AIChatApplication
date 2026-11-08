import { Routes } from '@angular/router';
import { HomePage } from './home-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomePage, title: 'Home | Concepts of Engineering' },
  {
    path: 'learning',
    loadComponent: () => import('./learning-page').then((module) => module.LearningPage),
    title: 'Learning | Concepts of Engineering',
  },
  { path: '**', redirectTo: 'home' },
];
