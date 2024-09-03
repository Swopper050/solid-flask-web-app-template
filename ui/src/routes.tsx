import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import LandingPage from './pages/LandingPage';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: LandingPage,
  },
  //{
    //path: '/about',
    //component: lazy(() => import('./pages/about')),
    //data: AboutData,
  //},
  //{
    //path: '**',
    //component: lazy(() => import('./errors/404')),
  //},
];
