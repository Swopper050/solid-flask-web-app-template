import {JSXElement} from "solid-js";


function ProfileMenu(): JSXElement {
  return (
    <div tabindex="0" class="dropdown dropdown-bottom">
      <div class="avatar">
        <div class="mask mask-squircle w-6">
          <i class="fas fa-check"></i>
        </div>
      </div>
      <div
        tabindex="0"
        class="dropdown-content card card-compact bg-primary text-primary-content z-[1] w-64 p-2 shadow"
      >
        <div class="card-body">
          <h3 class="card-title">Card title!</h3>
          <p>you can use any element as a dropdown.</p>
        </div>
      </div>
    </div>
  )
}

export default ProfileMenu;
