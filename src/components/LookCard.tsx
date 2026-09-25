import { forwardRef, useEffect, useRef, useState } from 'react';
import { formatPrice, type Look } from '../data/looks';
import { HeroVideo } from './HeroVideo';

type Props = {
  look: Look;
  imageIndex: number;
  /** On screen or next to it: load every photo now rather than waiting to scroll near. */
  near: boolean;
  onBuy: () => void;
};

// How long a picked photo may keep the old one on screen while it decodes. Past this (a slow
// network) it fades in over its blurred placeholder instead, so the tap never feels ignored.
const MAX_SWAP_WAIT_MS = 300;

export const LookCard = forwardRef<HTMLElement, Props>(function LookCard(
  { look, imageIndex, near, onBuy },
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

  return (
    <section className="look" ref={ref} aria-label={look.name}>
      <div className="look__media">
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
          <div className="price-pill">
            <span className="price-pill__price">{formatPrice(look.price)}</span>
            <button className="price-pill__buy" onClick={onBuy}>
              Buy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});
