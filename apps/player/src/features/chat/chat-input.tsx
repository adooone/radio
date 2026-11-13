import { useT } from '@/i18n';
import { LampButton, LampIconButton, Textarea } from '@dendelion/func-ui';
import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { SendIcon } from './icons';

type ChatInputProps = {
  onSend: (text: string) => void;
  /** On the island: no pill of its own — the field and the send lamp join
      the island's row, send at the right end, under the thumb. */
  island?: boolean;
};

export const ChatInput = ({ onSend, island = false }: ChatInputProps) => {
  const t = useT();
  const [message, setMessage] = useState('');
  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    onSend(text);
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const field = (
    <Textarea
      bare
      autoGrow
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={t('chat.input.placeholder')}
      rows={1}
      className={`min-h-[38px] w-full flex-grow ${
        island ? 'min-w-0 max-h-[64px]' : 'max-h-[200px]'
      }`}
    />
  );

  if (island) {
    return (
      <form onSubmit={handleSend} className="contents">
        {field}
        <LampIconButton
          type="submit"
          tone="red"
          size="md"
          label={t('chat.input.send')}
          icon={<SendIcon />}
          className="shrink-0 text-ink"
        />
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
        {t('chat.input.send')}
      </LampButton>
    </form>
  );
};
