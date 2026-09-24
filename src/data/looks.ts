import floralHero from '../assets/looks/floral-hero.webp';
import floral1 from '../assets/looks/floral-1.webp';
import floral2 from '../assets/looks/floral-2.webp';
import floral3 from '../assets/looks/floral-3.webp';
import floral4 from '../assets/looks/floral-4.webp';
import satinHero from '../assets/looks/satin-hero.webp';

export type Look = {
  id: string;
  name: string;
  price: number;
  sizes: string[];
  tags: string[];
  images: string[];
};

// Sample catalogue. Swap for an API call once a backend exists.
export const looks: Look[] = [
  {
    id: 'floral-ruffle-crop',
    name: 'Floral Ruffle Crop Top',
    price: 3999,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    tags: ['top', 'crop', 'floral', 'print', 'ruffle', 'summer'],
    images: [floralHero, floral1, floral2, floral3, floral4],
  },
  {
    id: 'lime-satin-halter',
    name: 'Lime Satin Halter Top',
    price: 4499,
    sizes: ['XS', 'S', 'M', 'L'],
    tags: ['top', 'crop', 'satin', 'halter', 'green', 'party'],
    images: [satinHero],
  },
];

export const suggestions = ['Crop tops', 'Floral', 'Satin', 'Party wear'];

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
