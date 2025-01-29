import { JSXElement, Show } from 'solid-js'
import { A } from '@solidjs/router'

import puppy from '/puppy.jpg'
import ProfileMenu from '../components/ProfileMenu'
import { ThemeSwitcher } from '../components/ThemeSwitcher'
import { useUser } from '../context/UserProvider'

export function NotFoundPage(): JSXElement {
  const { user } = useUser()
  return (
    <>
      <div class="navbar fixed bg-base-100 top-0 left-0">
        <div class="flex-1" />
        <ThemeSwitcher />
        <Show when={user() !== null}>
          <ProfileMenu />
        </Show>
      </div>

      <div class="flex justify-center items-center mt-40">
        <h1 class="text-4xl text-center font-bold">
          {'Woops, this page does not exist'}
        </h1>
      </div>
      <div class="flex justify-center items-center mt-40">
        <h1 class="text-3xl text-center font-bold">
          {'Here is a picture of a '}
          <span class="text-transparent bg-clip-text bg-gradient-to-tr from-primary to-secondary">
            {'puppy'}
          </span>
        </h1>
      </div>

      <div class="flex justify-center mt-20">
        <figure>
          <img src={puppy} alt="Puppy" />
        </figure>
      </div>

      <div class="flex justify-center mt-40">
        <A class="btn btn-primary" href="/home">
          Back to home
        </A>
      </div>
    </>
  )
}
