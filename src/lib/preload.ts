const requested = new Set<string>();

const whenIdle = (fn: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 50);

/**
 * Downloads images into the browser cache in the given order, a few at a time and only while
 * the page is idle, so they are already there when the viewer reaches them without competing
 * with what is on screen. Returns a function that stops the remaining downloads.
 */
export function preloadImages(srcs: string[], concurrency = 3) {
  const queue = srcs.filter((src) => !requested.has(src));
  let stopped = false;

  const next = () => {
    if (stopped) return;
    const src = queue.shift();
    if (!src) return;
    requested.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'low';
    img.onload = img.onerror = () => whenIdle(next);
    img.src = src;
  };

  for (let i = 0; i < concurrency; i++) whenIdle(next);
  return () => {
    stopped = true;
  };
}
