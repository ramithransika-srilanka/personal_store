import floral1 from '../assets/looks/floral-1.webp';
import floral2 from '../assets/looks/floral-2.webp';
import floral3 from '../assets/looks/floral-3.webp';
import floral4 from '../assets/looks/floral-4.webp';
import rugbyPolo1 from '../assets/looks/rugby-polo-1.webp';
import rugbyPolo2 from '../assets/looks/rugby-polo-2.webp';
import rugbyPolo3 from '../assets/looks/rugby-polo-3.webp';
import rugbyPolo4 from '../assets/looks/rugby-polo-4.webp';
import tealSlipDress1 from '../assets/looks/teal-slip-dress-1.webp';
import tealSlipDress2 from '../assets/looks/teal-slip-dress-2.webp';
import tealSlipDress3 from '../assets/looks/teal-slip-dress-3.webp';
import tealSlipDress4 from '../assets/looks/teal-slip-dress-4.webp';

export type Look = {
  id: string;
  name: string;
  price: number;
  tags: string[];
  images: string[];
  /** Plays in place of images[0], which must be the video's first frame. */
  video?: string;
};

// Served from /public so index.html can preload the poster before any JS runs.
const floralVideo = `${import.meta.env.BASE_URL}media/hero.mp4`;
const floralPoster = `${import.meta.env.BASE_URL}media/hero-poster.webp`;

// Sample catalogue. Swap for an API call once a backend exists.
export const looks: Look[] = [
  {
    id: 'floral-ruffle-crop',
    name: 'Floral Ruffle Crop Top',
    price: 3999,
    tags: ['top', 'crop', 'floral', 'print', 'ruffle', 'summer'],
    images: [floralPoster, floral1, floral2, floral3, floral4],
    video: floralVideo,
  },
  {
    id: 'calista-rugby-polo',
    name: 'Calista Rugby Polo Shirt',
    price: 4299,
    tags: ['top', 'polo', 'rugby', 'shirt', 'orange', 'navy', 'streetwear', 'casual'],
    images: [rugbyPolo1, rugbyPolo2, rugbyPolo3, rugbyPolo4],
  },
  {
    id: 'teal-slip-dress',
    name: 'Teal Slip Midi Dress',
    price: 5499,
    tags: ['dress', 'midi', 'slip', 'teal', 'green', 'bodycon', 'party'],
    images: [tealSlipDress1, tealSlipDress2, tealSlipDress3, tealSlipDress4],
  },
];

export const suggestions = ['Crop tops', 'Floral', 'Polo shirts', 'Dresses'];

export function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString('en-US')}`;
}

export function searchLooks(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return -1;
  return looks.findIndex((look) => {
    const haystack = `${look.name} ${look.tags.join(' ')}`.toLowerCase();
    return words.some((w) => haystack.includes(w.replace(/s$/, '')));
  });
}
