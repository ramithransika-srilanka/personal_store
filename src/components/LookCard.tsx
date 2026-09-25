import { forwardRef, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { formatPrice, type Look } from '../data/looks';
import { HeroVideo } from './HeroVideo';

type Props = {
  look: Look;
  imageIndex: number;
  /** On screen or next to it: load every photo now rather than waiting to scroll near. */
  near: boolean;
  /** Tapping anywhere on the price pill (price or Buy) starts the purchase chat. */
  onBuy: () => void;
  /** A clean tap on the photo. The feed decides whether it counts (not while scrolling). */
  onPhotoTap: () => void;
};

// How long a picked photo may keep the old one on screen while it decodes. Past this (a slow
// network) it fades in over its blurred placeholder instead, so the tap never feels ignored.
const MAX_SWAP_WAIT_MS = 300;

// A tap on the photo must stay within this distance and be let go within this time; anything
// more is a swipe or a press, not a tap.
const TAP_SLOP_PX = 10;
const TAP_MAX_MS = 400;

export const LookCard = forwardRef<HTMLElement, Props>(function LookCard(
  { look, imageIndex, near, onBuy, onPhotoTap },
  ref,
) {
  // The photo on screen trails the selected one until the selected one can paint, so the
  // cross-fade never goes through a half-loaded or blank frame.
  const [shown, setShown] = useState(imageIndex);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [eager, setEager] = useState(near);
  if (near && !eager) setEager(true);

  useEffect(() => {
    if (imageIndex === shown) return;
    let done = false;
    const show = () => {
      if (done) return;
      done = true;
      setShown(imageIndex);
    };
    const timer = window.setTimeout(show, MAX_SWAP_WAIT_MS);
    const img = imgRefs.current[imageIndex];
    if (img) img.decode().then(show, show);
    else show();
    return () => {
      done = true;
      clearTimeout(timer);
    };
  }, [imageIndex, shown]);

  const press = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    press.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const onPhotoClick = (e: MouseEvent) => {
    const start = press.current;
    press.current = null;
    // The price pill handles its own taps.
    if ((e.target as Element).closest('.buy-bar')) return;
    if (!start) return;
    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (moved > TAP_SLOP_PX || e.timeStamp - start.t > TAP_MAX_MS) return;
    onPhotoTap();
  };

  return (
    <section className="look" ref={ref} aria-label={look.name}>
      <div className="look__media" onPointerDown={onPointerDown} onClick={onPhotoClick}>
        {look.images.map((photo, i) => (
          <img
            key={photo.src}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={photo.src}
            alt={i === 0 ? look.name : ''}
            className={`look__img${i === shown ? ' is-active' : ''}`}
            style={{ backgroundImage: photo.placeholder }}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'auto'}
            decoding={i === 0 ? 'sync' : 'async'}
          />
        ))}
        {look.video && <HeroVideo src={look.video} active={shown === 0} />}
        <div className="buy-bar">
          <img className="buy-bar__logo" src={look.store.logo} alt={look.store.name} decoding="async" />
          <div className="price-pill" onClick={onBuy}>
            <span className="price-pill__price">{formatPrice(look.price)}</span>
            <button className="price-pill__buy">
              Buy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});
