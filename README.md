# Personal Store

Mobile-only shopping web app built from the Figma design
[Purchase trigger pitch](https://www.figma.com/design/vnehR1wsnaJeifKT7oXJZt/Purchase-trigger-pitch?node-id=339-1010).

- Vertical, snap-scrolling feed of looks with a price / **Buy** pill on each photo
- Photo strip for the look in view, plus a "What are you looking for?" search bar
- Size picker, bag (saved in `localStorage`), and a menu to jump between looks

On screens wider than a phone the app stays in a centred 430px column.

## Develop

```bash
npm install
npm run dev      # served on your LAN too, so you can open it on a phone
npm run build
```

Products live in `src/data/looks.ts` (sample data — replace with an API when a backend exists).
Checkout is not wired up yet.
