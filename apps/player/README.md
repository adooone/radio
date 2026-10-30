# Puget Sound · Vinyl Radio — player

The public listening page of the vinyl radio, after the Figma design
(Laboratory → Puget Sound): one dark room — the turntable photograph under
a warm shade — with the neon sign over it, dressed as old film (grain,
scratches, light leaks, a camera-eye vignette). The splat record is the
play control; while the air plays, the live picture fills the frame.

## Dev

```sh
pnpm player:dev
```

Vite on port 3030, `--host` (reachable as `deimos:3030` over the tailnet).
`VITE_STREAM_URL` points at the HLS manifest (see `.env.example`);
nginx-rtmp answers 404 on it while nobody publishes, which the page shows
as a quiet air and retries every 15 s.

## Build

```sh
pnpm --filter @radio/player build
```

Static output in `dist/`, deployed to Vercel at radio.adoo.one.

## Brand assets

`public/brand/` holds the Figma exports: the background photograph, the
dust texture, and the sign's SVGs (wordmark, script, splat in three
layers) with their neon glow baked in. `src/features/player/sign.tsx`
copies the design's geometry; re-export from Figma if the sign changes.
