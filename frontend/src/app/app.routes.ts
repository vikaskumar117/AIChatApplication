import { Routes } from '@angular/router';
import { HomePage } from './home-page';

const learningModulePage = () =>
  import('./learning/learning-module-page').then((module) => module.LearningModulePage);

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomePage, title: 'Home | Concepts of Engineering' },
  {
    path: 'learning',
    loadComponent: () => import('./learning-page').then((module) => module.LearningPage),
    title: 'Learning | Concepts of Engineering',
  },
  {
    path: 'learning/:moduleId/:topicId',
    loadComponent: learningModulePage,
    title: 'Lesson | Concepts of Engineering',
  },
  {
    path: 'learning/:moduleId',
    loadComponent: learningModulePage,
    title: 'Learning module | Concepts of Engineering',
  },
  { path: '**', redirectTo: 'home' },
];
