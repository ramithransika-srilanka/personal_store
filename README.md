# Personal Store

Mobile-only shopping web app built from the Figma design
[Purchase trigger pitch](https://www.figma.com/design/vnehR1wsnaJeifKT7oXJZt/Purchase-trigger-pitch?node-id=339-1010).

- Vertical, snap-scrolling feed of looks with the store's logo and a price / **Buy** pill on each photo
- Photo strip for the look in view, plus a "What are you looking for?" search bar
- Tapping the photo (a clean tap, never a scroll) or the price / **Buy** pill opens a purchase chat: the
  photo flies into the thread, then the store asks for a colour and a size and offers a fit check
- Menu to jump between looks
- After the last look, a "Powered by Polysocial" block (Create your own store / Add your brand) and the
  Polysocial site footer; while it's on screen the header turns dark on light grey and the dock hides

On screens wider than a phone the app stays in a centred 430px column.

## Develop

```bash
npm install
npm run dev      # served on your LAN too, so you can open it on a phone
npm run build
```

### Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds with `BASE_PATH=/<repo>/`
and deploys `dist` with GitHub's Pages actions to
https://ramithransika-srilanka.github.io/personal_store/ (Settings → Pages → Source: GitHub Actions).

### Hero video

`public/media/hero.mp4` is the first look's background (H.264, no audio, 720×1200, faststart,
1s keyframes, ~1.3 MB). Its last half-second is cross-faded into its start so the loop has no jump,
and `hero-poster.webp` is its exact first frame, preloaded from `index.html` so something shows
instantly. The video plays only while it's on screen and selected, and stays on the poster under
reduced motion or data saver. Serve `/media` with long cache headers and byte-range support
(most static hosts do both).

### Images

Product photos in `src/assets/looks/` are used as-is (1080×1350 WebP, never recompressed).
`npm run images` makes their companions (commit the output after adding or replacing a photo):
3× thumbnails for the photo strip in `src/assets/looks/thumbs/`, and ~200-byte blurred placeholders
in `src/data/placeholders.ts` that show under each photo until it paints.

After the first photo appears, every thumbnail and then every full photo is fetched in idle time,
and the looks on and next to the screen load theirs eagerly. A photo picked from the strip keeps
the previous one up until it has decoded, so the cross-fade never shows a blank frame. In
production, `public/sw.js` keeps the photos, fonts and built files on the device, so repeat visits
load them without touching the network.

Products live in `src/data/looks.ts` (sample data — replace with an API when a backend exists).
Checkout is not wired up yet.
