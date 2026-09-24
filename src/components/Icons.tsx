// Coolicons (Menu_Duo_LG, Shopping_Bag_02, Add_Plus, Arrow_Up_MD) as used in the Figma file.
type IconProps = { className?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const MenuIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M3 15H21M3 9H21" />
  </svg>
);

export const BagIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 8H20L19.2 19.1C19.1 20.2 18.2 21 17.2 21H6.8C5.8 21 4.9 20.2 4.8 19.1L4 8Z" />
    <path d="M9 11V7C9 5.3 10.3 4 12 4C13.7 4 15 5.3 15 7V11" />
  </svg>
);

export const PlusIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M6 12H18M12 6V18" />
  </svg>
);

export const ArrowUpIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 19V5M12 5L6 11M12 5L18 11" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
);
