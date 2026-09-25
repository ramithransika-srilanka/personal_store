import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { formatPrice, type Look } from '../data/looks';
import { AskBar } from './AskBar';
import { ChevronLeftIcon } from './Icons';

export type Rect = { x: number; y: number; width: number; height: number };

type Props = {
  look: Look;
  /** The photo that was on screen when Buy was tapped. */
  imageIndex: number;
  /** Where that photo was on screen; it flies from here into the thread. */
  from?: Rect;
  closing: boolean;
  onClose: () => void;
};

type Message = { id: string; from: 'me' | 'bot'; text: string };

// Opening, in ms from the tap:
//   0    the page fades in and the photo starts lifting off the feed
//   280  the product's name, price and store follow the photo in (50ms apart)
//   500  the store starts "typing"
//   1100 its questions pop in (60ms apart, the size question after the colour row)
const FLIGHT_MS = 440;
const PRODUCT_AT = [280, 330, 380];
const TYPING_AT = 500;
const QUESTIONS_AT = 1100;
const QUESTION_STAGGER = [0, 60, 200, 260];
// How long the store "types" before asking about a fit check.
const REPLY_MS = 700;

// Same curve as the sheets: an iOS-like glide that settles softly.
const FLIGHT_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Typing() {
  return (
    <p className="bubble bubble--bot bubble--typing enter" aria-label="Typing">
      <span />
      <span />
      <span />
    </p>
  );
}

export function Chat({ look, imageIndex, from, closing, onClose }: Props) {
  const [stage, setStage] = useState<'product' | 'typing' | 'questions'>('product');
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  // Everything after the opening questions. A picked colour or size is one message that
  // updates in place if the pick changes.
  const [log, setLog] = useState<Message[]>([]);
  const [replying, setReplying] = useState(false);
  // The photo in the thread stays hidden while its copy is flying in.
  const [flies] = useState(() => !!from && !reducedMotion());
  const [flying, setFlying] = useState(flies);
  const logRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const photo = look.images[imageIndex];

  // The shared-photo flight: a copy of the photo starts exactly where it was in the feed and
  // glides and shrinks into its slot, where the real one takes over. It lives outside the
  // chat so it doesn't fade in with the page. One fixed element, so animating its box is cheap,
  // and it keeps object-fit: cover correct the whole way (a scale would squash the photo).
  useLayoutEffect(() => {
    const target = photoRef.current?.getBoundingClientRect();
    if (!flying || !from || !target) return;
    const copy = document.createElement('img');
    copy.src = photo.src;
    copy.className = 'chat-flight';
    copy.style.backgroundImage = photo.placeholder;
    document.body.appendChild(copy);
    const box = (r: Rect, radius: number) => ({
      left: `${r.x}px`,
      top: `${r.y}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      borderRadius: `${radius}px`,
    });
    const flight = copy.animate([box(from, 0), box(target, 8)], {
      duration: FLIGHT_MS,
      easing: FLIGHT_EASE,
      fill: 'forwards',
    });
    flight.onfinish = () => {
      setFlying(false);
      // Let the real photo paint before the copy goes, so there's no blink.
      requestAnimationFrame(() => copy.remove());
    };
    return () => {
      flight.cancel();
      copy.remove();
    };
    // Runs once, on opening.
  }, []);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage('typing'), TYPING_AT),
      window.setTimeout(() => setStage('questions'), QUESTIONS_AT),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

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
  const askedFitCheck = log.some((m) => m.id === 'fit-check');
  useEffect(() => {
    if (!bothPicked || askedFitCheck) return;
    setReplying(true);
    const timer = window.setTimeout(() => {
      setReplying(false);
      say({ id: 'fit-check', from: 'bot', text: 'Do you want me to run a fit check?' });
    }, REPLY_MS);
    return () => clearTimeout(timer);
  }, [bothPicked, askedFitCheck]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (el && (log.length || replying)) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [log, replying]);

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
            ref={photoRef}
            // Without a flight (reduced motion), it fades in like the bubbles.
            className={`chat__photo${flies ? '' : ' enter'}`}
            style={{ backgroundImage: photo.placeholder, visibility: flying ? 'hidden' : undefined }}
            src={photo.src}
            alt={look.name}
          />
          <p className="bubble bubble--me enter" style={delay(PRODUCT_AT[0])}>
            {look.name}
          </p>
          <p className="bubble bubble--me enter" style={delay(PRODUCT_AT[1])}>
            {formatPrice(look.price)}
          </p>
          <p className="bubble bubble--me enter" style={delay(PRODUCT_AT[2])}>
            From {look.store.name} Store
          </p>
        </div>

        {stage === 'typing' && (
          <div className="msgs">
            <Typing />
          </div>
        )}

        {stage === 'questions' && (
          <div className="msgs">
            <p className="bubble bubble--bot enter" style={delay(QUESTION_STAGGER[0])}>
              Pick your color
            </p>
            <div className="swatches enter" style={delay(QUESTION_STAGGER[1])} role="radiogroup" aria-label="Color">
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
            <p className="bubble bubble--bot enter" style={delay(QUESTION_STAGGER[2])}>
              Pick your size
            </p>
            <div className="options enter" style={delay(QUESTION_STAGGER[3])} role="radiogroup" aria-label="Size">
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
        )}

        {groups.map((group) => (
          <div key={group[0].id} className={`msgs${group[0].from === 'me' ? ' msgs--me' : ''}`}>
            {group.map((m) => (
              <p key={m.id} className={`bubble bubble--${m.from} enter`}>
                {m.text}
              </p>
            ))}
          </div>
        ))}
        {replying && (
          <div className="msgs">
            <Typing />
          </div>
        )}
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
