import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from 'react';
import { suggestions, type Look } from '../data/looks';
import { AskBar } from './AskBar';

type Props = {
  look: Look;
  imageIndex: number;
  onSelectImage: (index: number) => void;
  onSearch: (query: string) => void;
};

type Row = { look: Look; mode: 'thumbs' | 'chips' };

// The outgoing row fades out this fast before the next one staggers in (see .row-leaving).
const LEAVE_MS = 180;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function BottomDock({ look, imageIndex, onSelectImage, onSearch }: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  // What the row shows trails what it should show: on a new look or a chips toggle the old
  // row fades out first, then the new one enters. Scrolling past several looks quickly just
  // keeps the old row faded until the scroll settles on one.
  const target: Row = { look, mode: showSuggestions ? 'chips' : 'thumbs' };
  const [row, setRow] = useState<Row>(target);
  const [phase, setPhase] = useState<'idle' | 'leaving' | 'entering'>('idle');
  const changed = row.look !== target.look || row.mode !== target.mode;

  useEffect(() => {
    if (!changed) {
      // Switched back before the swap (e.g. + tapped twice): bring the same row back in.
      setPhase((p) => (p === 'leaving' ? 'entering' : p));
      return;
    }
    setPhase('leaving');
    const timer = window.setTimeout(
      () => {
        setRow({ look, mode: showSuggestions ? 'chips' : 'thumbs' });
        setPhase('entering');
      },
      reducedMotion() ? 0 : LEAVE_MS,
    );
    return () => clearTimeout(timer);
  }, [changed, look, showSuggestions]);

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
  }, [row]);

  // The first photo is the one already shown full-size above, so the strip leads with the
  // second and keeps the first at the end, where it can still be picked.
  const order = row.look.images.map((_, i) => (i + 1) % row.look.images.length);
  const rowClass = phase === 'leaving' ? ' row-leaving' : phase === 'entering' ? ' row-entering' : '';
  // Drop the entrance once its last item has landed, so it can't replay on a later render.
  const endEntering = (e: AnimationEvent<HTMLDivElement>) => {
    if (phase === 'entering' && e.target === e.currentTarget.lastElementChild) setPhase('idle');
  };

  const search = (query: string) => {
    onSearch(query);
    setShowSuggestions(false);
  };

  return (
    <div className="dock">
      {row.mode === 'chips' ? (
        <div className={`chips${rowClass}`} onAnimationEnd={endEntering}>
          {suggestions.map((s, i) => (
            <button
              key={s}
              className="chip"
              style={{ '--i': i } as CSSProperties}
              onClick={() => search(s)}
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div
          ref={thumbsRef}
          className={`thumbs${hasMore ? ' has-more' : ''}${rowClass}`}
          onScroll={updateFade}
          onAnimationEnd={endEntering}
          role="tablist"
          aria-label={`${row.look.name} photos`}
        >
          {order.map((i, position) => {
            const photo = row.look.images[i];
            // The highlight waits for the row to catch up with the look it belongs to.
            const selected = !changed && i === imageIndex;
            return (
              <button
                key={photo.src}
                role="tab"
                aria-selected={selected}
                aria-label={`Photo ${i + 1}`}
                className={`thumb${selected ? ' is-active' : ''}`}
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
      <AskBar
        placeholder="What are you looking for?"
        onSubmit={search}
        onPlus={() => setShowSuggestions((v) => !v)}
        plusOpen={showSuggestions}
        plusLabel={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
        sendLabel="Search"
        enterKeyHint="search"
      />
    </div>
  );
}
