import { useState, type FormEvent } from 'react';
import { ArrowUpIcon, PlusIcon } from './Icons';

type Props = {
  placeholder: string;
  onSubmit: (text: string) => void;
  /** Leave out for a + that does nothing yet. */
  onPlus?: () => void;
  plusOpen?: boolean;
  plusLabel?: string;
  sendLabel?: string;
  enterKeyHint?: 'search' | 'send';
};

// The chat box shared by the feed and the chat: + on the left, text, send on the right.
export function AskBar({ placeholder, onSubmit, onPlus, plusOpen = false, plusLabel = 'More', sendLabel = 'Send', enterKeyHint = 'send' }: Props) {
  const [text, setText] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <form className="ask" onSubmit={submit}>
      <div className="ask__left">
        <button
          type="button"
          className={`ask__btn ask__btn--plus${plusOpen ? ' is-open' : ''}`}
          aria-label={plusLabel}
          aria-expanded={onPlus ? plusOpen : undefined}
          onClick={onPlus}
        >
          <PlusIcon />
        </button>
        <input
          className="ask__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          enterKeyHint={enterKeyHint}
        />
      </div>
      <button type="submit" className="ask__btn ask__btn--send" aria-label={sendLabel} disabled={!text.trim()}>
        <ArrowUpIcon />
      </button>
    </form>
  );
}
