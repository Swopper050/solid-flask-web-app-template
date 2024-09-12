import { JSXElement } from "solid-js";

import puppy from '../../public/puppy.jpg';
import preikestolen from '../../public/preikestolen.jpg';

import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { LoginModal } from "../components/LoginModal";
import { RegisterModal } from "../components/RegisterModal";

export function LandingPage(): JSXElement {
  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1">
          <a class="btn btn-ghost text-xl">My solid app</a>
        </div>

        <ThemeSwitcher />
        <div class="flex-none mx-1">
          <button class="btn btn-ghost" onClick={() => document.getElementById("login_modal").showModal()}>
            Login
          </button>
          <LoginModal />
        </div>
        <div class="flex-none mx-1">
          <button class="btn btn-ghost" onClick={() => document.getElementById("register_modal").showModal()}>
            Register
          </button>
          <RegisterModal />
        </div>
      </div>

      <div class="flex justify-center mt-40">
        <h1 class="text-4xl font-bold">
          This is 
          <span class="text-transparent bg-clip-text bg-gradient-to-tr from-primary to-secondary">
            your 
          </span>
          web application.
        </h1>
      </div>
      <div class="flex justify-center mt-5">
        <h2>
          You can build whatever you want.
        </h2>
      </div>

      <div class="flex justify-center my-40">
        <div class="card bg-base-100 w-96 shadow-xl mx-5">
          <figure>
            <img
              src={puppy}
              alt="Puppy"
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title">A puppy!</h2>
            <p>Want to show puppies?</p>
            <div class="card-actions justify-end">
              <button class="btn btn-ghost">You can!</button> 
            </div>
          </div>
        </div>

        <div class="card bg-base-100 w-96 shadow-xl mx-5">
          <figure>
            <img
              src={preikestolen}
              alt="Preikestolen"
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title">Preikestolen</h2>
            <p>Want to show rocks?</p>
            <div class="card-actions justify-end">
              <button class="btn btn-ghost">Someone might like it!</button> 
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
