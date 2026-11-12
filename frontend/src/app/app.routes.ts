import { Type } from '@angular/core';
import { Routes } from '@angular/router';
import { HomePage } from './home-page';

const learningModuleRoutes: { id: string; load: () => Promise<Type<unknown>> }[] = [
  { id: 'csharp-fundamentals', load: () => import('./learning/modules/pages/csharp-fundamentals/csharp-fundamentals.component').then((module) => module.CsharpFundamentalsComponent) },
  { id: 'csharp-coding-algorithms', load: () => import('./learning/modules/pages/csharp-coding-algorithms/csharp-coding-algorithms.component').then((module) => module.CsharpCodingAlgorithmsComponent) },
  { id: 'dotnet-async-memory', load: () => import('./learning/modules/pages/dotnet-async-memory/dotnet-async-memory.component').then((module) => module.DotnetAsyncMemoryComponent) },
  { id: 'aspnet-core-web-api', load: () => import('./learning/modules/pages/aspnet-core-web-api/aspnet-core-web-api.component').then((module) => module.AspnetCoreWebApiComponent) },
  { id: 'api-security-auth', load: () => import('./learning/modules/pages/api-security-auth/api-security-auth.component').then((module) => module.ApiSecurityAuthComponent) },
  { id: 'api-concurrency-resilience', load: () => import('./learning/modules/pages/api-concurrency-resilience/api-concurrency-resilience.component').then((module) => module.ApiConcurrencyResilienceComponent) },
  { id: 'microservices', load: () => import('./learning/modules/pages/microservices/microservices.component').then((module) => module.MicroservicesComponent) },
  { id: 'design-patterns', load: () => import('./learning/modules/pages/design-patterns/design-patterns.component').then((module) => module.DesignPatternsComponent) },
  { id: 'sql-server', load: () => import('./learning/modules/pages/sql-server/sql-server.component').then((module) => module.SqlServerComponent) },
  { id: 'angular', load: () => import('./learning/modules/pages/angular/angular.component').then((module) => module.AngularComponent) },
  { id: 'ef-core-diagnostics', load: () => import('./learning/modules/pages/ef-core-diagnostics/ef-core-diagnostics.component').then((module) => module.EfCoreDiagnosticsComponent) },
  { id: 'system-design', load: () => import('./learning/modules/pages/system-design/system-design.component').then((module) => module.SystemDesignComponent) },
  { id: 'azure-cloud', load: () => import('./learning/modules/pages/azure-cloud/azure-cloud.component').then((module) => module.AzureCloudComponent) },
  { id: 'gen-ai-dotnet', load: () => import('./learning/modules/pages/gen-ai-dotnet/gen-ai-dotnet.component').then((module) => module.GenAiDotnetComponent) },
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomePage, title: 'Home | Concepts of Engineering' },
  {
    path: 'learning',
    loadComponent: () => import('./learning-page').then((module) => module.LearningPage),
    title: 'Learning | Concepts of Engineering',
  },
  ...learningModuleRoutes.flatMap(({ id, load }) => [
    {
      path: `learning/${id}/:topicId`,
      loadComponent: load,
      title: 'Lesson | Concepts of Engineering',
    },
    {
      path: `learning/${id}`,
      loadComponent: load,
      title: 'Learning module | Concepts of Engineering',
    },
  ]),
  { path: '**', redirectTo: 'home' },
];
