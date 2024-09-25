import {createSignal, JSXElement, Show} from "solid-js";
import {useNavigate} from "@solidjs/router";
import { clsx } from "clsx";

import { useUser } from "../context";
import { DotsIcon } from "./icons/Dots";

import api from "../api";


function ProfileMenu(): JSXElement {
  const navigate = useNavigate();

  const { user, setUser } = useUser();
  const [loggingOut, setLoggingOut] = createSignal(false);
  const [showLogoutFailedToast, setShowLogoutFailedToast] = createSignal(false);

  const timeLogoutFailedToast = () => {
    setShowLogoutFailedToast(true);
    setTimeout(() => setShowLogoutFailedToast(false), 5000);
  }

  const logout = async () => {
    setLoggingOut(true)

    api.post("/logout").then(() => {
      setUser(null);
      navigate("/");
    }).catch(() => {
      timeLogoutFailedToast();
    }).finally(() => {
      setLoggingOut(false);
    })
  }

  return (
    <details class="dropdown dropdown-end">
      <summary class="btn btn-ghost">
        <span class="text">{user().email}</span>
        <DotsIcon />
      </summary>

      <ul class="menu dropdown-content bg-base-200 rounded-box">
        <li class="text-left">
          <button class="btn btn-ghost text-left">
            <i class="fa-regular fa-address-card" />
            Profile
          </button>
        </li>
        <li class="text-left">
          <button class={clsx("btn", "btn-ghost", "text-left", loggingOut() && "btn-disabled")} onClick={logout}>
            <Show when={loggingOut()} fallback={<i class="fa-solid fa-arrow-right-from-bracket" />}>
              <span class="loading loading-ball text-neutral loading-sm" />
            </Show>
            Logout
          </button>
        </li>
      </ul>

      <Show when={showLogoutFailedToast()}>
        <div class="toast toast-end">
          <div class="alert alert-error">
            <span>Could not logout. Please try again later</span>
          </div>
        </div>
      </Show>
    </details>
  )
}

export default ProfileMenu;
