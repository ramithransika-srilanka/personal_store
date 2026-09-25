import { useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { suggestions, type Look } from '../data/looks';
import { ArrowUpIcon, PlusIcon } from './Icons';

type Props = {
  look: Look;
  imageIndex: number;
  onSelectImage: (index: number) => void;
  onSearch: (query: string) => void;
};

export function BottomDock({ look, imageIndex, onSelectImage, onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // Fade the cut-off photo on the right only while there is more to scroll to.
  const updateFade = () => {
    const el = thumbsRef.current;
    setHasMore(!!el && el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  // Each look's strip starts from its left edge (the scroll position would otherwise carry
  // over from the previous look).
  useLayoutEffect(() => {
    if (thumbsRef.current) thumbsRef.current.scrollLeft = 0;
    updateFade();
  }, [look, showSuggestions]);

  // The first photo is the one already shown full-size above, so the strip leads with the
  // second and keeps the first at the end, where it can still be picked.
  const order = look.images.map((_, i) => (i + 1) % look.images.length);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="dock">
      {showSuggestions ? (
        <div className="chips">
          {suggestions.map((s) => (
            <button key={s} className="chip" onClick={() => { onSearch(s); setShowSuggestions(false); }}>
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div
          ref={thumbsRef}
          className={`thumbs${hasMore ? ' has-more' : ''}`}
          onScroll={updateFade}
          role="tablist"
          aria-label={`${look.name} photos`}
        >
          {order.map((i, position) => {
            const photo = look.images[i];
            return (
              <button
                key={photo.src}
                role="tab"
                aria-selected={i === imageIndex}
                aria-label={`Photo ${i + 1}`}
                className={`thumb${i === imageIndex ? ' is-active' : ''}`}
                style={{ '--i': position } as CSSProperties}
                onClick={() => onSelectImage(i)}
              >
                {/* Preloaded small thumbnails: decoding in sync means a new strip appears whole. */}
                <img src={photo.thumb} alt="" decoding="sync" style={{ backgroundImage: photo.placeholder }} />
              </button>
            );
          })}
        </div>
      )}
      <form className="ask" onSubmit={submit}>
        <div className="ask__left">
          <button
            type="button"
            className={`ask__btn ask__btn--plus${showSuggestions ? ' is-open' : ''}`}
            aria-label={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
            aria-expanded={showSuggestions}
            onClick={() => setShowSuggestions((v) => !v)}
          >
            <PlusIcon />
          </button>
          <input
            className="ask__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            aria-label="What are you looking for?"
            enterKeyHint="search"
          />
        </div>
        <button type="submit" className="ask__btn ask__btn--send" aria-label="Search" disabled={!query.trim()}>
          <ArrowUpIcon />
        </button>
      </form>
    </div>
  );
}
