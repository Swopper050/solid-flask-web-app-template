import type { Component } from 'solid-js';
import { useRoutes, useNavigate } from '@solidjs/router';

import { routes } from './routes';
import ProfileMenu from "./components/ProfileMenu";

const App: Component = () => {
  const Route = useRoutes(routes);
  const navigate = useNavigate();

  return (
    <main>
      <Route />
    </main>
  );
};

export default App;
