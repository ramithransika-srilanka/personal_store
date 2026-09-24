import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { Header } from './components/Header';
import { LookCard } from './components/LookCard';
import { Sheet } from './components/Sheet';
import { formatPrice, looks, searchLooks } from './data/looks';

type BagItem = { lookId: string; size: string };

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
  const [buyFor, setBuyFor] = useState<number | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [panel, setPanel] = useState<'menu' | 'bag' | null>(null);
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

  const openBuy = (index: number) => {
    setBuyFor(index);
    setSize(null);
  };

  const addToBag = () => {
    if (buyFor === null || !size) return;
    setBag((b) => [...b, { lookId: looks[buyFor].id, size }]);
    setBuyFor(null);
    setToast('Added to bag');
  };

  const closePanel = useCallback(() => setPanel(null), []);
  const closeBuy = useCallback(() => setBuyFor(null), []);

  const bagLooks = bag.map((item) => ({ ...item, look: looks.find((l) => l.id === item.lookId)! }));
  const total = bagLooks.reduce((sum, item) => sum + item.look.price, 0);
  const buyLook = buyFor !== null ? looks[buyFor] : null;

  return (
    <div className="app">
      <Header bagCount={bag.length} onMenu={() => setPanel('menu')} onBag={() => setPanel('bag')} />

      <main className="feed">
        {looks.map((look, i) => (
          <LookCard
            key={look.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            look={look}
            imageIndex={imageIndex[i]}
            onBuy={() => openBuy(i)}
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

      <Sheet open={buyLook !== null} title={buyLook?.name ?? ''} onClose={closeBuy}>
        {buyLook && (
          <div className="buy">
            <div className="buy__row">
              <img className="buy__img" src={buyLook.images[0]} alt="" />
              <div>
                <p className="buy__price">{formatPrice(buyLook.price)}</p>
                <p className="muted">Select a size</p>
              </div>
            </div>
            <div className="sizes" role="radiogroup" aria-label="Size">
              {buyLook.sizes.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={size === s}
                  className={`size${size === s ? ' is-active' : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <button className="primary-btn" disabled={!size} onClick={addToBag}>
              Add to bag
            </button>
          </div>
        )}
      </Sheet>

      <Sheet open={panel === 'bag'} title="Your bag" onClose={closePanel}>
        {bagLooks.length === 0 ? (
          <p className="muted empty">Your bag is empty.</p>
        ) : (
          <>
            <ul className="bag-list">
              {bagLooks.map((item, i) => (
                <li key={i} className="bag-item">
                  <img src={item.look.images[0]} alt="" />
                  <div className="bag-item__info">
                    <p>{item.look.name}</p>
                    <p className="muted">Size {item.size}</p>
                  </div>
                  <div className="bag-item__side">
                    <p>{formatPrice(item.look.price)}</p>
                    <button className="link-btn" onClick={() => setBag((b) => b.filter((_, j) => j !== i))}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bag-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className="primary-btn" onClick={() => setToast('Checkout is coming soon')}>
              Checkout
            </button>
          </>
        )}
      </Sheet>

      <Sheet open={panel === 'menu'} title="Shop" side="left" onClose={closePanel}>
        <ul className="menu-list">
          {looks.map((look, i) => (
            <li key={look.id}>
              <button
                onClick={() => {
                  setPanel(null);
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
