import { placeholders } from './placeholders';

const photos = import.meta.glob<string>('../assets/looks/*.webp', { eager: true, import: 'default' });
const thumbs = import.meta.glob<string>('../assets/looks/thumbs/*.webp', { eager: true, import: 'default' });

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

export type Look = {
  id: string;
  name: string;
  price: number;
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
    tags: ['top', 'polo', 'rugby', 'shirt', 'orange', 'navy', 'streetwear', 'casual'],
    images: [photo('rugby-polo-1'), photo('rugby-polo-2'), photo('rugby-polo-3'), photo('rugby-polo-4')],
  },
  {
    id: 'teal-slip-dress',
    name: 'Teal Slip Midi Dress',
    price: 5499,
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
