import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'jobs', loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent) },
  { path: 'analyze', loadComponent: () => import('./pages/cv-form/cv-form.component').then(m => m.CvFormComponent) },
  { path: 'candidate', loadComponent: () => import('./pages/candidate-portal/candidate-portal.component').then(m => m.CandidatePortalComponent) },
  { path: 'recruiter', loadComponent: () => import('./pages/recruiter/recruiter.component').then(m => m.RecruiterComponent) },
  { path: 'admin', loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
  { path: 'showcase', loadComponent: () => import('./pages/showcase/showcase.component').then(m => m.ShowcaseComponent) },
  { path: '**', redirectTo: '' }
];
