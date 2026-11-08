import { Routes } from '@angular/router';
import { HomePage } from './home-page';
import { LearningPage } from './learning-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomePage, title: 'Home | Concepts of Engineering' },
  { path: 'learning', component: LearningPage, title: 'Learning | Concepts of Engineering' },
  { path: '**', redirectTo: 'home' },
];
