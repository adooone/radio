import { type FormEvent, type KeyboardEvent, useCallback, useRef, useState } from 'react';

type ChatInputProps = {
  onSend: (text: string) => void;
};

export const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex flex-row items-end gap-2 rounded-2xl border border-accent/25 bg-cream/5 p-2"
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Шо кажеш?"
        rows={1}
        className="max-h-[200px] min-h-[38px] w-full flex-grow resize-none overflow-hidden bg-transparent p-2 font-sans text-sm text-cream outline-none placeholder:text-cream/35"
      />
      <button
        type="submit"
        className="shrink-0 cursor-pointer rounded-xl bg-accent px-4 py-2 font-sans text-sm font-medium text-ink"
      >
        Ентер
      </button>
    </form>
  );
};
