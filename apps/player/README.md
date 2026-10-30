# Puget Sound · Vinyl Radio — player

The public listening page of the vinyl radio, planned together on
papercamp IDEA-11: one black screen split 2 : 1 with no dividers — the
radio on the left, the chat on the right (portrait stacks them). The
palette is strict: red `#FF5647` for shapes and controls, warm white
`#F5F2EC` for reading text, red italic only for brand moments, all of it
under the old-film overlay (grain, scratches, light leaks, a camera-eye
vignette).

The centerpiece is the vinyl box: the album sleeve of the song on air
with the red disc half slid out of it. The disc spins while playing and
the bars at its edge move with the actual sound (Web Audio analyser on
the hls.js path; a time-driven swell of the same shape elsewhere).
Playback is audio-only — the stream's video track is never rendered.

## Dev

```sh
pnpm player:dev
```

Vite on port 3030, `--host` (reachable as `deimos:3030` over the tailnet).
`VITE_STREAM_URL` points at the HLS manifest (see `.env.example`);
nginx-rtmp answers 404 on it while nobody publishes, which the page shows
as a quiet air and retries every 15 s. `VITE_SOCKET_URL` points at wave's
WebSocket (chat and, once the backend announces it, now-playing); unset,
it guesses `ws://<host>:6871`.

## Build

```sh
pnpm --filter @radio/player build
```

Static output in `dist/`, deployed to Vercel at radio.adoo.one.

## Now playing

Wave has no now-playing source yet. The player listens for a
`now_playing` message on the WebSocket (`{ type, artist, title, cover }`)
and shows the house label on the sleeve until one arrives — the backend
side is its own future idea (see IDEA-11's thread).
