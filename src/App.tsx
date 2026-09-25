import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react';
import { BottomDock } from './components/BottomDock';
import { Header } from './components/Header';
import { LookCard } from './components/LookCard';
import { Sheet } from './components/Sheet';
import { formatPrice, looks, searchLooks } from './data/looks';
import { preloadImages } from './lib/preload';

type BagItem = { lookId: string };

const BAG_KEY = 'personal-store:bag';
const INTRO_MS = 2300;

function loadBag(): BagItem[] {
  try {
    return JSON.parse(localStorage.getItem(BAG_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function App() {
  const [active, setActive] = useState(0);
  const [imageIndex, setImageIndex] = useState<number[]>(() => looks.map(() => 0));
  const [bag, setBag] = useState<BagItem[]>(loadBag);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [intro, setIntro] = useState<'pending' | 'playing' | 'done'>('pending');
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Start the intro once the first photo is ready (or after 1s at most), and drop the
  // animations when it ends so later re-renders (e.g. a new photo strip) don't replay it.
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const start = () => {
      if (cancelled) return;
      cancelled = true;
      setIntro('playing');
      timers.push(window.setTimeout(() => setIntro('done'), INTRO_MS));
    };
    const img = new Image();
    img.src = looks[0].images[0].src;
    img.decode().then(() => timers.push(window.setTimeout(start, 150)), start);
    timers.push(window.setTimeout(start, 1000));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  // Once the first photo is up, quietly fetch the rest: every strip thumbnail first (small, and
  // needed the moment a look scrolls in), then the full photos in feed order.
  const introStarted = intro !== 'pending';
  useEffect(() => {
    if (!introStarted) return;
    return preloadImages([
      ...looks.flatMap((look) => look.images.map((photo) => photo.thumb)),
      ...looks.flatMap((look) => look.images.map((photo) => photo.src)),
    ]);
  }, [introStarted]);

  useEffect(() => {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    } catch {
      /* storage unavailable */
    }
  }, [bag]);

  // The look snapped to the top of the feed drives the dock's photo strip.
  const handleFeedScroll = (e: UIEvent<HTMLElement>) => {
    const top = e.currentTarget.scrollTop;
    let nearest = 0;
    sectionRefs.current.forEach((el, i) => {
      const best = sectionRefs.current[nearest];
      if (el && best && Math.abs(el.offsetTop - top) < Math.abs(best.offsetTop - top)) nearest = i;
    });
    setActive(nearest);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const scrollToLook = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    const index = searchLooks(query);
    if (index === -1) {
      setToast(`No looks found for “${query}”`);
      return;
    }
    scrollToLook(index);
  };

  const addToBag = (index: number) => {
    setBag((b) => [...b, { lookId: looks[index].id }]);
    setToast('Added to bag');
  };

  const showBag = () => {
    if (!bag.length) {
      setToast('Your bag is empty');
      return;
    }
    const total = bag.reduce((sum, item) => sum + (looks.find((l) => l.id === item.lookId)?.price ?? 0), 0);
    setToast(`${bag.length} ${bag.length === 1 ? 'item' : 'items'} · ${formatPrice(total)}`);
  };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="app" data-intro={intro}>
      <Header bagCount={bag.length} onMenu={() => setMenuOpen(true)} onBag={showBag} />

      <main className="feed" onScroll={handleFeedScroll}>
        {looks.map((look, i) => (
          <LookCard
            key={look.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            look={look}
            imageIndex={imageIndex[i]}
            near={Math.abs(i - active) <= 1}
            onBuy={() => addToBag(i)}
          />
        ))}
        <div className="feed__end">You're all caught up</div>
      </main>

      <BottomDock
        look={looks[active]}
        imageIndex={imageIndex[active]}
        onSelectImage={(img) => setImageIndex((prev) => prev.map((v, i) => (i === active ? img : v)))}
        onSearch={handleSearch}
      />

      <Sheet open={menuOpen} title="Shop" onClose={closeMenu}>
        <ul className="menu-list">
          {looks.map((look, i) => (
            <li key={look.id}>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  scrollToLook(i);
                }}
              >
                <img src={look.images[0].thumb} alt="" />
                <span>{look.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <div className={`toast${toast ? ' is-visible' : ''}`} role="status">
        {toast}
      </div>
    </div>
  );
}
