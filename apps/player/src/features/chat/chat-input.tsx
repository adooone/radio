import { LampButton } from '@dendelion/func-ui';
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
      className="control-island flex flex-row items-end gap-2 rounded-full border border-cream/10 p-2 pl-4"
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          adjustHeight();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Say something…"
        rows={1}
        className="max-h-[200px] min-h-[38px] w-full flex-grow resize-none overflow-hidden bg-transparent p-2 font-sans text-sm text-cream outline-none placeholder:text-cream/35"
      />
      <LampButton type="submit" tone="red" size="sm" className="shrink-0">
        Send
      </LampButton>
    </form>
  );
};
