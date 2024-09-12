import { createEffect, JSXElement } from "solid-js";

import { lazy } from 'solid-js';
import { useNavigate } from "@solidjs/router";
import type { RouteDefinition } from '@solidjs/router';

import { LandingPage } from "./pages/LandingPage";
import { Home } from "./pages/Home";


function ProtectedRoute(props: {route: () => JSXElement}): JSXElement {
  const navigate = useNavigate();

  createEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  });

  return <>{props.route()}</>;
};

export default ProtectedRoute;

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: () => <LandingPage />
  },
  {
    path: '/home',
    component: () => <ProtectedRoute route={Home} />
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
