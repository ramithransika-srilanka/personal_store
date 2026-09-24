import { useState, type FormEvent } from 'react';
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
        <div className="thumbs" role="tablist" aria-label={`${look.name} photos`}>
          {look.images.map((src, i) => (
            <button
              key={src}
              role="tab"
              aria-selected={i === imageIndex}
              aria-label={`Photo ${i + 1}`}
              className={`thumb${i === imageIndex ? ' is-active' : ''}`}
              onClick={() => onSelectImage(i)}
            >
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
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
