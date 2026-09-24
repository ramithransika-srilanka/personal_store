import { forwardRef } from 'react';
import { formatPrice, type Look } from '../data/looks';

type Props = {
  look: Look;
  imageIndex: number;
  onBuy: () => void;
};

export const LookCard = forwardRef<HTMLElement, Props>(function LookCard(
  { look, imageIndex, onBuy },
  ref,
) {
  return (
    <section className="look" ref={ref} aria-label={look.name}>
      <div className="look__media">
        {look.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === 0 ? look.name : ''}
            className={`look__img${i === imageIndex ? ' is-active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
        <div className="price-pill">
          <span className="price-pill__price">{formatPrice(look.price)}</span>
          <button className="price-pill__buy" onClick={onBuy}>
            Buy
          </button>
        </div>
      </div>
    </section>
  );
});
