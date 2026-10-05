import { Button } from '@/components/ui';
import clsx from 'clsx';
import { useCallback, useRef, useState } from 'react';
import type { ChatInputProps } from './types';

export const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <form onSubmit={handleSend} className={clsx(styles.form)}>
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          adjustTextareaHeight();
        }}
        onKeyDown={handleKeyDown}
        className={clsx(styles.input)}
        placeholder="Шо кажеш?"
        rows={1}
      />
      <Button
        type="submit"
        variant="ember"
        className="h-[40px] px-6 py-1 text-xl md:text-lg whitespace-nowrap"
      >
        Ентер
      </Button>
    </form>
  );
};

const styles = {
  form: [
    'flex flex-row items-end gap-2 ',
    'bg-coal-relic/40 backdrop-blur-l rounded-2xl border border-moss/40 p-2',
  ],
  input: [
    'flex-grow w-full p-2 rounded font-sans text-white bg-neutral-800/0',
    'focus:bg-neutral-800/0 focus:outline-none resize-none overflow-hidden',
    'min-h-[40px] max-h-[200px]',
  ],
};
