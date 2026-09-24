import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  /** Whether this is the photo currently selected for the look. */
  active: boolean;
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = () =>
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * Looping, muted background video layered over its poster image (the video's first
 * frame, rendered by LookCard). It only becomes visible once frames are actually
 * playing, so a slow network or blocked autoplay just leaves the identical poster.
 */
export function HeroVideo({ src, active }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState === 'visible');
  const [allowed] = useState(() => !reducedMotion() && !saveData());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // React doesn't reflect `muted` as an attribute; iOS needs it for inline autoplay.
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute('muted', '');

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(el);
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Play only while it can be seen; pause (keeping its position) otherwise to save battery.
  const shouldPlay = allowed && active && inView && pageVisible;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!shouldPlay) {
      el.pause();
      return;
    }
    let retry: (() => void) | null = null;
    el.play().catch(() => {
      // Autoplay refused (e.g. iOS Low Power Mode): try again on the first touch.
      retry = () => el.play().catch(() => {});
      window.addEventListener('pointerdown', retry, { once: true });
    });
    return () => {
      if (retry) window.removeEventListener('pointerdown', retry);
    };
  }, [shouldPlay]);

  if (!allowed) return null;

  return (
    <video
      ref={ref}
      className={`look__img look__video${active && playing ? ' is-active' : ''}`}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    />
  );
}
