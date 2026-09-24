import avatar from '../assets/avatar.webp';
import { BagIcon, MenuIcon } from './Icons';

type Props = {
  bagCount: number;
  onMenu: () => void;
  onBag: () => void;
};

export function Header({ bagCount, onMenu, onBag }: Props) {
  return (
    <header className="header">
      <button className="icon-btn" aria-label="Open menu" onClick={onMenu}>
        <MenuIcon />
      </button>
      <img className="header__avatar" src={avatar} alt="Store profile" />
      <button className="icon-btn" aria-label={`Open bag, ${bagCount} items`} onClick={onBag}>
        <BagIcon />
        {bagCount > 0 && <span className="badge">{bagCount}</span>}
      </button>
    </header>
  );
}
