import { JSXElement, createSignal, onMount, onCleanup } from 'solid-js'
import { clsx } from 'clsx'
import Hls from 'hls.js'
import { IconButton } from '../../components/Button'
import { DaisyUIColor } from '../../types'
import { rangeColorMap } from '../../classes'

type VideoPlayerProps = {
  src: string
  color?: DaisyUIColor
  poster?: string
  showControls?: boolean
  withShortcuts?: boolean
}

export function VideoPlayer(props: VideoPlayerProps): JSXElement {
  let videoEl!: HTMLVideoElement
  let containerRef!: HTMLDivElement

  const [ready, setReady] = createSignal(false)
  const [playing, setPlaying] = createSignal(false)
  const [dur, setDur] = createSignal(0)
  const [t, setT] = createSignal(0)
  const [volume, setVolume] = createSignal(1)
  const [muted, setMuted] = createSignal(false)
  const [fullscreen, setFullscreen] = createSignal(false)
  const [showControls, setShowControls] = createSignal(true)
  const [buffered, setBuffered] = createSignal(0)

  let hideControlsTimeout: number | null = null

  const getFiniteDuration = () => {
    const d = videoEl?.duration
    if (Number.isFinite(d) && d! > 0) return d!

    const s = videoEl?.seekable
    if (s && s.length > 0) {
      return s.end(s.length - 1)
    }

    return 0
  }

  const refreshDuration = () => {
    const d = getFiniteDuration()
    if (d > 0) setDur(d)
  }

  const updateBuffered = () => {
    if (!videoEl) return
    const buf = videoEl.buffered
    if (buf.length > 0) {
      const end = buf.end(buf.length - 1)
      setBuffered(end)
    }
  }

  const formatSeconds = (s: number) => {
    if (!Number.isFinite(s)) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
      .toString()
      .padStart(2, '0')

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${sec}`
    }
    return `${m}:${sec}`
  }

  const toggle = async () => {
    if (!ready()) return

    if (playing()) {
      videoEl.pause()
      return
    }

    await videoEl.play()
  }

  const seek = (val: number) => {
    if (!ready()) return
    const d = dur() || 0
    const clamped = Math.max(0, Math.min(d, val))
    videoEl.currentTime = clamped
    setT(clamped)
  }

  const toggleMute = () => {
    if (!videoEl) return
    videoEl.muted = !videoEl.muted
    setMuted(videoEl.muted)
  }

  const changeVolume = (val: number) => {
    if (!videoEl) return
    const clamped = Math.max(0, Math.min(1, val))
    videoEl.volume = clamped
    setVolume(clamped)
    if (clamped > 0 && muted()) {
      videoEl.muted = false
      setMuted(false)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef) return

    if (!document.fullscreenElement) {
      await containerRef.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }

  const scheduleHideControls = () => {
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout)
    }
    setShowControls(true)
    if (playing()) {
      hideControlsTimeout = window.setTimeout(() => {
        setShowControls(false)
      }, 1500)
    }
  }

  onMount(() => {
    // Initialize HLS if supported
    if (Hls.isSupported() && props.src.endsWith('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        xhrSetup: (xhr, url) => {
          // Intercept segment requests and route through auth endpoint
          if (url.includes('/stream/') && url.includes('.ts')) {
            // Extract the segment filename from the URL
            const match = url.match(/\/stream\/([^?]+)/)
            if (match) {
              const segmentPath = decodeURIComponent(match[1])
              // Extract content_id from the playlist URL (props.src)
              const contentIdMatch = props.src.match(/\/content\/(\d+)\/stream/)
              if (contentIdMatch) {
                const contentId = contentIdMatch[1]
                // Rebuild URL to go through auth endpoint
                xhr.open(
                  'GET',
                  `/api/content/${contentId}/stream?path=${encodeURIComponent(segmentPath)}`,
                  true
                )
                return
              }
            }
          }
        },
      })

      hls.loadSource(props.src)
      hls.attachMedia(videoEl)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        refreshDuration()
        setReady(true)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('Fatal HLS error:', data)
        }
      })

      onCleanup(() => {
        hls.destroy()
      })
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoEl.src = props.src
    }

    const onLoaded = () => {
      refreshDuration()
      setReady(true)
    }
    const onDuration = () => refreshDuration()
    const onTime = () => {
      setT(videoEl.currentTime || 0)
      refreshDuration()
      updateBuffered()
    }
    const onPlay = () => {
      setPlaying(true)
      scheduleHideControls()
    }
    const onPause = () => {
      setPlaying(false)
      setShowControls(true)
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout)
      }
    }
    const onVolumeChange = () => {
      setVolume(videoEl.volume)
      setMuted(videoEl.muted)
    }
    const onProgress = () => updateBuffered()

    const onFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }

    const onKey = (e: KeyboardEvent) => {
      if (!props.withShortcuts) return

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

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
      if (e.code === 'KeyF') {
        e.preventDefault()
        toggleFullscreen()
      }
      if (e.code === 'KeyM') {
        e.preventDefault()
        toggleMute()
      }
      if (e.code === 'ArrowUp') {
        e.preventDefault()
        changeVolume(volume() + 0.1)
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault()
        changeVolume(volume() - 0.1)
      }
    }

    const onMouseMove = () => {
      scheduleHideControls()
    }

    videoEl.addEventListener('loadedmetadata', onLoaded)
    videoEl.addEventListener('durationchange', onDuration)
    videoEl.addEventListener('loadeddata', onDuration)
    videoEl.addEventListener('canplay', onDuration)
    videoEl.addEventListener('timeupdate', onTime)
    videoEl.addEventListener('play', onPlay)
    videoEl.addEventListener('pause', onPause)
    videoEl.addEventListener('volumechange', onVolumeChange)
    videoEl.addEventListener('progress', onProgress)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    window.addEventListener('keydown', onKey)
    containerRef.addEventListener('mousemove', onMouseMove)

    onCleanup(() => {
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout)
      }
      videoEl.removeEventListener('loadedmetadata', onLoaded)
      videoEl.removeEventListener('durationchange', onDuration)
      videoEl.removeEventListener('loadeddata', onDuration)
      videoEl.removeEventListener('canplay', onDuration)
      videoEl.removeEventListener('timeupdate', onTime)
      videoEl.removeEventListener('play', onPlay)
      videoEl.removeEventListener('pause', onPause)
      videoEl.removeEventListener('volumechange', onVolumeChange)
      videoEl.removeEventListener('progress', onProgress)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      window.removeEventListener('keydown', onKey)
      containerRef.removeEventListener('mousemove', onMouseMove)
    })
  })

  const safeDur = () => dur() || 0
  const bufferPercentage = () => {
    const d = safeDur()
    return d > 0 ? (buffered() / d) * 100 : 0
  }

  const getVolumeIcon = () => {
    if (muted() || volume() === 0) return 'fa-solid fa-volume-xmark'
    if (volume() < 0.5) return 'fa-solid fa-volume-low'
    return 'fa-solid fa-volume-high'
  }

  return (
    <div
      ref={containerRef}
      class={clsx(
        'relative w-full bg-black rounded-lg overflow-hidden',
        fullscreen() ? 'h-screen' : 'aspect-video'
      )}
    >
      <video
        ref={videoEl}
        poster={props.poster}
        preload="metadata"
        class="w-full h-full cursor-pointer"
        onClick={toggle}
      />

      <div class="absolute inset-0 cursor-pointer" onClick={toggle} />

      <div
        class={clsx(
          'absolute inset-0 bg-gradient-to-t from-black/70 to-transparent',
          'transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none',
          showControls() || !playing() ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Progress Bar */}
        <div class="relative mb-3 pointer-events-auto">
          {/* Buffered Progress */}
          <div class="absolute inset-5 h-1 bg-white/20 rounded-full">
            <div
              class="h-full bg-white/40 rounded-full transition-all"
              style={{ width: `${bufferPercentage()}%` }}
            />
          </div>

          {/* Seekable Progress */}
          <input
            type="range"
            min="0"
            max={safeDur()}
            step="0.01"
            value={t()}
            onInput={(e) => seek(Number(e.currentTarget.value))}
            class={clsx(
              'range w-full relative z-10 cursor-pointer inset-2',
              rangeColorMap[props.color ?? 'primary'],
              '[--range-thumb-size:10px]'
            )}
          />
        </div>

        {/* Controls Bar */}
        <div class="flex items-center gap-3 text-white pointer-events-auto">
          {/* Play/Pause */}
          <IconButton
            icon={playing() ? 'fa-solid fa-pause' : 'fa-solid fa-play'}
            variant="ghost"
            onClick={toggle}
            disabled={!ready()}
            class="text-white hover:text-white w-8"
          />

          {/* Time Display */}
          <div class="text-sm font-medium">
            <span>{formatSeconds(t())}</span>
            <span class="opacity-60"> / {formatSeconds(safeDur())}</span>
          </div>

          <div class="flex-1" />

          {/* Volume Control */}
          <div class="flex items-center gap-2 group">
            <IconButton
              icon={getVolumeIcon()}
              variant="ghost"
              onClick={toggleMute}
              class="text-white hover:text-white"
            />
            <div class="w-0 group-hover:w-20 overflow-hidden transition-all duration-200">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted() ? 0 : volume()}
                onInput={(e) => changeVolume(Number(e.currentTarget.value))}
                class={clsx(
                  'range w-20',
                  rangeColorMap[props.color ?? 'primary'],
                  '[--range-thumb-size:8px]'
                )}
              />
            </div>
          </div>

          {/* Fullscreen */}
          <IconButton
            icon={fullscreen() ? 'fa-solid fa-compress' : 'fa-solid fa-expand'}
            variant="ghost"
            onClick={toggleFullscreen}
            class="text-white hover:text-white"
          />
        </div>
      </div>
    </div>
  )
}
