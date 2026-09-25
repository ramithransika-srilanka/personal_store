import { useCallback, useEffect, useRef, useState, type UIEvent } from 'react';
import { BottomDock } from './components/BottomDock';
import { Chat, type Rect } from './components/Chat';
import { Header } from './components/Header';
import { LookCard } from './components/LookCard';
import { Sheet } from './components/Sheet';
import { formatPrice, looks, searchLooks } from './data/looks';
import { preloadImages } from './lib/preload';

type BagItem = { lookId: string };

const BAG_KEY = 'personal-store:bag';
const INTRO_MS = 2300;
// Matches the .chat.is-closing transition.
const CHAT_CLOSE_MS = 180;
// A photo tap this soon after the feed last moved is a tap to stop the scroll, not to buy.
const SCROLL_SETTLE_MS = 250;

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
  // Nothing adds to the bag yet: Buy now starts the purchase chat, which doesn't check out.
  const [bag] = useState<BagItem[]>(loadBag);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [intro, setIntro] = useState<'pending' | 'playing' | 'done'>('pending');
  // The look being bought and the photo that was showing when Buy was tapped.
  const [chat, setChat] = useState<{ look: number; image: number; from?: Rect } | null>(null);
  const [chatClosing, setChatClosing] = useState(false);
  const lastScrollAt = useRef(0);
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

  // The look snapped to the top of the feed drives the dock's photo strip.
  const handleFeedScroll = (e: UIEvent<HTMLElement>) => {
    lastScrollAt.current = performance.now();
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

  const openChat = (index: number) => {
    setChatClosing(false);
    // Where the photo is now, so the chat can lift it from there into its thread.
    const media = sectionRefs.current[index]?.querySelector('.look__media');
    const r = media?.getBoundingClientRect();
    setChat({ look: index, image: imageIndex[index], from: r && { x: r.x, y: r.y, width: r.width, height: r.height } });
  };

  // Only the look settled on screen opens from its photo, and only once the feed is still
  // (not mid-swipe, mid-momentum or mid-snap).
  const tapPhoto = (index: number) => {
    const el = sectionRefs.current[index];
    const feed = el?.parentElement;
    if (!el || !feed) return;
    if (performance.now() - lastScrollAt.current < SCROLL_SETTLE_MS) return;
    if (Math.abs(el.offsetTop - feed.scrollTop) > 2) return;
    openChat(index);
  };

  const closeChat = useCallback(() => setChatClosing(true), []);

  useEffect(() => {
    if (!chatClosing) return;
    const t = setTimeout(() => {
      setChat(null);
      setChatClosing(false);
    }, CHAT_CLOSE_MS);
    return () => clearTimeout(t);
  }, [chatClosing]);

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
            onBuy={() => openChat(i)}
            onPhotoTap={() => tapPhoto(i)}
          />
        ))}
        <div className="feed__end">You're all caught up</div>
      </main>

      {/* Dark, blurred fade behind the dock so it reads over any photo. */}
      <div className="dock-scrim" aria-hidden="true" />

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

      {chat && (
        <Chat
          key={`${chat.look}-${chat.image}`}
          look={looks[chat.look]}
          imageIndex={chat.image}
          from={chat.from}
          closing={chatClosing}
          onClose={closeChat}
        />
      )}

      <div className={`toast${toast ? ' is-visible' : ''}`} role="status">
        {toast}
      </div>
    </div>
  );
}
