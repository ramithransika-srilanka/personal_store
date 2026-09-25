import { placeholders } from './placeholders';

const photos = import.meta.glob<string>('../assets/looks/*.webp', { eager: true, import: 'default' });
const thumbs = import.meta.glob<string>('../assets/looks/thumbs/*.webp', { eager: true, import: 'default' });
const storeLogos = import.meta.glob<string>('../assets/stores/*.webp', { eager: true, import: 'default' });

export type Photo = {
  /** Full-size photo (1080px wide). */
  src: string;
  /** Same photo at 3× the photo-strip size (see scripts/optimize-images.mjs). */
  thumb: string;
  /** Tiny blurred data URL shown until the photo has painted. */
  placeholder: string;
};

function photo(name: string, src = photos[`../assets/looks/${name}.webp`]): Photo {
  const thumb = thumbs[`../assets/looks/thumbs/${name}.webp`];
  if (!src || !thumb || !placeholders[name]) throw new Error(`Missing image "${name}"; run npm run images`);
  return { src, thumb, placeholder: `url("${placeholders[name]}")` };
}

export type Store = {
  name: string;
  /** Square logo, shown in a circle next to the price. */
  logo: string;
};

function store(name: string, file: string): Store {
  const logo = storeLogos[`../assets/stores/${file}.webp`];
  if (!logo) throw new Error(`Missing store logo "${file}"`);
  return { name, logo };
}

export type Swatch = { name: string; hex: string };

// Sizes offered in the chat, as in Figma.
const sizes = ['XSmall', 'Medium', 'Large'];

export type Look = {
  id: string;
  name: string;
  price: number;
  store: Store;
  colors: Swatch[];
  sizes: string[];
  tags: string[];
  images: Photo[];
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
    store: store('Carnage', 'carnage'),
    colors: [
      { name: 'White', hex: '#ffffff' },
      { name: 'Black', hex: '#2b2b2b' },
      { name: 'Pink', hex: '#ec8fd6' },
      { name: 'Sky blue', hex: '#3aa8e8' },
    ],
    sizes,
    tags: ['top', 'crop', 'floral', 'print', 'ruffle', 'summer'],
    images: [
      photo('hero-poster', floralPoster),
      photo('floral-1'),
      photo('floral-2'),
      photo('floral-3'),
      photo('floral-4'),
    ],
    video: floralVideo,
  },
  {
    id: 'calista-rugby-polo',
    name: 'Calista Rugby Polo Shirt',
    price: 4299,
    store: store('Briksy', 'briksy'),
    colors: [
      { name: 'Orange', hex: '#f07c2a' },
      { name: 'Navy', hex: '#1f2a4d' },
      { name: 'White', hex: '#ffffff' },
    ],
    sizes,
    tags: ['top', 'polo', 'rugby', 'shirt', 'orange', 'navy', 'streetwear', 'casual'],
    images: [photo('rugby-polo-1'), photo('rugby-polo-2'), photo('rugby-polo-3'), photo('rugby-polo-4')],
  },
  {
    id: 'teal-slip-dress',
    name: 'Teal Slip Midi Dress',
    price: 5499,
    store: store('Sunora', 'sunora'),
    colors: [
      { name: 'Teal', hex: '#1f8a86' },
      { name: 'Black', hex: '#2b2b2b' },
      { name: 'Wine', hex: '#7a1f3d' },
    ],
    sizes,
    tags: ['dress', 'midi', 'slip', 'teal', 'green', 'bodycon', 'party'],
    images: [
      photo('teal-slip-dress-1'),
      photo('teal-slip-dress-2'),
      photo('teal-slip-dress-3'),
      photo('teal-slip-dress-4'),
    ],
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
