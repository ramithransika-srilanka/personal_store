import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './Icons';

type Props = {
  open: boolean;
  title: string;
  side?: 'bottom' | 'left';
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ open, title, side = 'bottom', onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`sheet-layer${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className={`sheet sheet--${side}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet__head">
          <h2>{title}</h2>
          <button className="sheet__close" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
