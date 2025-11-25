import {
  JSXElement,
  createSignal,
  onMount,
  onCleanup,
  For,
  Show,
} from 'solid-js'
import { clsx } from 'clsx'
import { IconButton } from '../../components/Button'
import { DaisyUIColor } from '../../types'
import { rangeColorMap } from '../../classes'

type AudioPlayerProps = {
  src: string
  color?: DaisyUIColor
  minimal?: boolean
  showRate?: boolean
  withShortcuts?: boolean
}

export function AudioPlayer(props: AudioPlayerProps): JSXElement {
  let audioEl!: HTMLAudioElement

  const [ready, setReady] = createSignal(false)
  const [playing, setPlaying] = createSignal(false)
  const [dur, setDur] = createSignal(0)
  const [t, setT] = createSignal(0)
  const [rate, setRate] = createSignal(1)

  const getFiniteDuration = () => {
    const d = audioEl?.duration
    if (Number.isFinite(d) && d! > 0) return d!

    // Fallback: use seekable range end (often available on iOS PWA)
    const s = audioEl?.seekable
    if (s && s.length > 0) {
      return s.end(s.length - 1)
    }

    return 0
  }

  const refreshDuration = () => {
    const d = getFiniteDuration()
    if (d > 0) setDur(d)
  }

  const formatSeconds = (s: number) => {
    if (!Number.isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, '0')
    return `${m}:${sec}`
  }

  const toggle = async () => {
    if (!ready()) return

    if (playing()) {
      audioEl.pause()
      return
    }

    await audioEl.play()
  }

  const seek = (val: number) => {
    if (!ready()) return
    const d = dur() || 0
    const clamped = Math.max(0, Math.min(d, val))
    audioEl.currentTime = clamped
    setT(clamped)
  }

  onMount(() => {
    const onLoaded = () => {
      refreshDuration()
      setReady(true)
    }
    const onDuration = () => refreshDuration()
    const onTime = () => {
      setT(audioEl.currentTime || 0)
      refreshDuration()
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onRate = () => setRate(audioEl.playbackRate || 1)
    const onKey = (e: KeyboardEvent) => {
      if (!props.withShortcuts) return

      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault()
        seek(t() + 5)
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        seek(t() - 5)
      }
    }

    audioEl.addEventListener('loadedmetadata', onLoaded)
    audioEl.addEventListener('durationchange', onDuration)
    audioEl.addEventListener('loadeddata', onDuration)
    audioEl.addEventListener('canplay', onDuration)
    audioEl.addEventListener('timeupdate', onTime)
    audioEl.addEventListener('play', onPlay)
    audioEl.addEventListener('pause', onPause)
    audioEl.addEventListener('ratechange', onRate)
    window.addEventListener('keydown', onKey)

    onCleanup(() => {
      audioEl.removeEventListener('loadedmetadata', onLoaded)
      audioEl.removeEventListener('durationchange', onDuration)
      audioEl.removeEventListener('loadeddata', onDuration)
      audioEl.removeEventListener('canplay', onDuration)
      audioEl.removeEventListener('timeupdate', onTime)
      audioEl.removeEventListener('play', onPlay)
      audioEl.removeEventListener('pause', onPause)
      audioEl.removeEventListener('ratechange', onRate)
      window.removeEventListener('keydown', onKey)
    })
  })

  const safeDur = () => dur() || 0
  const remaining = () => Math.max(safeDur() - t(), 0)

  return (
    <div class="w-full">
      <audio
        ref={audioEl!}
        src={props.src}
        preload={'metadata'}
        class="hidden"
      />

      <div class="flex items-center gap-3">
        <Show when={props.minimal}>
          <IconButton
            icon={playing() ? 'fa-solid fa-pause' : 'fa-solid fa-play'}
            color={props.color ?? 'primary'}
            variant="ghost"
            onClick={toggle}
            disabled={!ready()}
            class="w-8"
          />
        </Show>

        <div class="flex flex-col w-full">
          <input
            type="range"
            min="0"
            max={safeDur()}
            step="0.01"
            value={t()}
            onInput={(e) =>
              seek(Number((e.currentTarget as HTMLInputElement).value))
            }
            class={clsx(
              'range',
              rangeColorMap[props.color ?? 'primary'],
              'mt-1 w-full [--range-thumb-size:12px]'
            )}
          />

          <div class="flex justify-between text-xs opacity-70 mt-1">
            <span>{formatSeconds(t())}</span>
            <span>-{formatSeconds(remaining())}</span>
          </div>
        </div>

        <Show when={props.minimal && props.showRate}>
          <div class="text-xs opacity-70">
            <RateDropdown
              rate={rate()}
              setRate={(r) => {
                audioEl.playbackRate = r
                setRate(r)
              }}
            />
          </div>
        </Show>
      </div>

      <Show when={!props.minimal}>
        <div class="relative flex items-center justify-center gap-8 mt-4">
          <IconButton
            icon="fa-solid fa-arrow-rotate-left"
            size="lg"
            onClick={() => seek(t() - 10)}
          />

          <IconButton
            icon={playing() ? 'fa-solid fa-pause' : 'fa-solid fa-play'}
            color={props.color ?? 'primary'}
            variant="circle"
            onClick={toggle}
            disabled={!ready()}
            size="lg"
          />

          <IconButton
            icon="fa-solid fa-arrow-rotate-right"
            size="lg"
            onClick={() => seek(t() + 10)}
          />

          <Show when={props.showRate}>
            <div class="absolute right-0 text-xs opacity-70">
              <RateDropdown
                rate={rate()}
                setRate={(r) => {
                  audioEl.playbackRate = r
                  setRate(r)
                }}
              />
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

function RateDropdown(props: {
  rate: number
  setRate: (r: number) => void
}): JSXElement {
  return (
    <div class="dropdown dropdown-end">
      <div tabindex={0} role="button" class="btn btn-ghost btn-xs">
        {props.rate}×
      </div>
      <ul
        tabindex={0}
        class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-20 text-xs"
      >
        <For each={[0.5, 0.75, 1, 1.25, 1.5, 2]}>
          {(r) => (
            <li>
              <a onClick={() => props.setRate(r)}>x{r}</a>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
