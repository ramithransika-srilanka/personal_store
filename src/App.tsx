import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { Header } from './components/Header';
import { LookCard } from './components/LookCard';
import { Sheet } from './components/Sheet';
import { formatPrice, looks, searchLooks } from './data/looks';

type BagItem = { lookId: string };

const BAG_KEY = 'personal-store:bag';

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
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    } catch {
      /* storage unavailable */
    }
  }, [bag]);

  // Track which look is snapped into view so the dock shows its photos.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(sectionRefs.current.indexOf(entry.target as HTMLElement));
          }
        }
      },
      { threshold: 0.6 },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    <div className="app">
      <Header bagCount={bag.length} onMenu={() => setMenuOpen(true)} onBag={showBag} />

      <main className="feed">
        {looks.map((look, i) => (
          <LookCard
            key={look.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            look={look}
            imageIndex={imageIndex[i]}
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
                <img src={look.images[0]} alt="" />
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
