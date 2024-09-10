import type { Component } from 'solid-js';
import { useRoutes, useNavigate } from '@solidjs/router';

import { routes } from './routes';
import ProfileMenu from "./components/ProfileMenu";

const App: Component = () => {
  const Route = useRoutes(routes);
  const navigate = useNavigate();

  return (
    <div class="drawer drawer-open">
      <input id="main-sidebar" type="checkbox" class="drawer-toggle" />
      <div class="drawer-side border-r">
        <ul class="menu bg-base-200 text-base-content min-h-full w-56">
          <li class="mb-2"><ProfileMenu /></li>
          <li class="mb-1"><a onClick={() => navigate('/home')}>Home</a></li>
          <li class="mb-1"><a onClick={() => navigate("/about")}>About</a></li>
        </ul>
      </div>

      <div class="drawer-content flex flex-col">
        <div class="navbar bg-base-100">
          <div class="flex-1"></div>
          <div class="flex-none">
            <button class="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block h-5 w-5 stroke-current">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
              </svg>
            </button>
          </div>
        </div>

        <main>
          <Route />
        </main>
      </div>
    </div>
  );
};

export default App;
