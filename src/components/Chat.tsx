import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { formatPrice, type Look } from '../data/looks';
import { AskBar } from './AskBar';
import { ChevronLeftIcon } from './Icons';

type Props = {
  look: Look;
  /** The photo that was on screen when Buy was tapped. */
  imageIndex: number;
  closing: boolean;
  onClose: () => void;
};

type Message = { id: string; from: 'me' | 'bot'; text: string };

// The opening messages stagger in on these delays (ms): the product first, then the questions.
const PRODUCT_AT = [150, 230, 290, 350];
const QUESTIONS_AT = [800, 880, 1100, 1180];
// Pause before the store replies once both a colour and a size are picked.
const REPLY_MS = 600;

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

export function Chat({ look, imageIndex, closing, onClose }: Props) {
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  // Everything after the opening questions. A picked colour or size is one message that
  // updates in place if the pick changes.
  const [log, setLog] = useState<Message[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const photo = look.images[imageIndex];

  const say = (message: Message) =>
    setLog((l) => (l.some((m) => m.id === message.id) ? l.map((m) => (m.id === message.id ? message : m)) : [...l, message]));

  const pickColor = (name: string) => {
    setColor(name);
    say({ id: 'color', from: 'me', text: name });
  };

  const pickSize = (name: string) => {
    setSize(name);
    say({ id: 'size', from: 'me', text: name });
  };

  const bothPicked = !!color && !!size;
  useEffect(() => {
    if (!bothPicked) return;
    const timer = window.setTimeout(
      () => say({ id: 'fit-check', from: 'bot', text: 'Do you want me to run a fit check?' }),
      REPLY_MS,
    );
    return () => clearTimeout(timer);
  }, [bothPicked]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (el && log.length) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [log]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Consecutive messages from the same side share a group.
  const groups: Message[][] = [];
  for (const m of log) {
    const last = groups[groups.length - 1];
    if (last && last[0].from === m.from) last.push(m);
    else groups.push([m]);
  }

  return (
    <div className={`chat${closing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={`Buy ${look.name}`}>
      <div className="chat__top">
        <button className="chat__back" onClick={onClose}>
          <ChevronLeftIcon />
          Back
        </button>
      </div>

      <div className="chat__log" ref={logRef} aria-live="polite">
        <div className="msgs msgs--me msgs--product">
          <img
            className="chat__photo enter"
            style={{ ...delay(PRODUCT_AT[0]), backgroundImage: photo.placeholder }}
            src={photo.src}
            alt={look.name}
          />
          <p className="bubble bubble--me enter" style={delay(PRODUCT_AT[1])}>
            {look.name}
          </p>
          <p className="bubble bubble--me enter" style={delay(PRODUCT_AT[2])}>
            {formatPrice(look.price)}
          </p>
          <p className="bubble bubble--me enter" style={delay(PRODUCT_AT[3])}>
            From {look.store.name} Store
          </p>
        </div>

        <div className="msgs">
          <p className="bubble bubble--bot enter" style={delay(QUESTIONS_AT[0])}>
            Pick your color
          </p>
          <div className="swatches enter" style={delay(QUESTIONS_AT[1])} role="radiogroup" aria-label="Color">
            {look.colors.map((c) => (
              <button
                key={c.name}
                className={`swatch${color === c.name ? ' is-selected' : ''}`}
                style={{ '--c': c.hex } as CSSProperties}
                role="radio"
                aria-checked={color === c.name}
                aria-label={c.name}
                onClick={() => pickColor(c.name)}
              />
            ))}
          </div>
          <p className="bubble bubble--bot enter" style={delay(QUESTIONS_AT[2])}>
            Pick your size
          </p>
          <div className="options enter" style={delay(QUESTIONS_AT[3])} role="radiogroup" aria-label="Size">
            {look.sizes.map((s) => (
              <button
                key={s}
                className={`option${size === s ? ' is-selected' : ''}`}
                role="radio"
                aria-checked={size === s}
                onClick={() => pickSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {groups.map((group) => (
          <div key={group[0].id} className={`msgs${group[0].from === 'me' ? ' msgs--me' : ''}`}>
            {group.map((m) => (
              <p key={m.id} className={`bubble bubble--${m.from} enter`}>
                {m.text}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="chat__dock">
        <AskBar
          placeholder="What are you looking for?"
          onSubmit={(text) => say({ id: `me-${Date.now()}`, from: 'me', text })}
        />
      </div>
    </div>
  );
}
