import { LampButton, LampIconButton } from '@dendelion/func-ui';
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { SendIcon } from './icons';

type ChatInputProps = {
  onSend: (text: string) => void;
  /** On the island: no pill of its own — the send lamp and the field join
      the island's row, in the play lamp's and the words' places. */
  island?: boolean;
};

export const ChatInput = ({ onSend, island = false }: ChatInputProps) => {
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

  const field = (
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
      className={`min-h-[38px] w-full flex-grow resize-none overflow-hidden bg-transparent p-2 font-sans text-sm text-cream outline-none placeholder:text-cream/35 ${
        island ? 'min-w-0 max-h-[64px] text-base' : 'max-h-[200px]'
      }`}
    />
  );

  if (island) {
    return (
      <form onSubmit={handleSend} className="contents">
        <LampIconButton
          type="submit"
          tone="red"
          size="md"
          label="Send"
          icon={<SendIcon />}
          className="shrink-0 text-ink"
        />
        {field}
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSend}
      className="control-island flex w-full flex-row items-end gap-2 rounded-full border border-cream/10 p-2 pl-4"
    >
      {field}
      <LampButton type="submit" tone="red" size="sm" className="shrink-0">
        Send
      </LampButton>
    </form>
  );
};
