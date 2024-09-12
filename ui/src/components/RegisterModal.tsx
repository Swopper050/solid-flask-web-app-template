import {JSXElement} from "solid-js";


export function RegisterModal(): JSXElement {
  return (
    <dialog id="register_modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Hello!</h3>
        <p class="py-2">This is the register modal.</p>
        <p class="py-4">Press ESC key or click the button below to close</p>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}
