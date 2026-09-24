# Personal Store

Mobile-only shopping web app built from the Figma design
[Purchase trigger pitch](https://www.figma.com/design/vnehR1wsnaJeifKT7oXJZt/Purchase-trigger-pitch?node-id=339-1010).

- Vertical, snap-scrolling feed of looks with a price / **Buy** pill on each photo
- Photo strip for the look in view, plus a "What are you looking for?" search bar
- **Buy** adds straight to the bag (saved in `localStorage`); the bag icon shows the count and total
- Menu to jump between looks

On screens wider than a phone the app stays in a centred 430px column.

## Develop

```bash
npm install
npm run dev      # served on your LAN too, so you can open it on a phone
npm run build
```

### Hero video

`public/media/hero.mp4` is the first look's background (H.264, no audio, 720×1074, faststart,
1s keyframes, ~1.2 MB). Its last half-second is cross-faded into its start so the loop has no jump,
and `hero-poster.webp` is its exact first frame, preloaded from `index.html` so something shows
instantly. The video plays only while it's on screen and selected, and stays on the poster under
reduced motion or data saver. Serve `/media` with long cache headers and byte-range support
(most static hosts do both).

Products live in `src/data/looks.ts` (sample data — replace with an API when a backend exists).
Checkout is not wired up yet.
