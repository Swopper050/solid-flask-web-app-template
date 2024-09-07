import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import ('./pages/LandingPage')),
  },
  {
    path: '/home',
    component: lazy(() => import('./pages/Home')),
  },
  {
    path: '/about',
    component: lazy(() => import('./pages/About')),
  },
  //{
    //path: '**',
    //component: lazy(() => import('./errors/404')),
  //},
];
