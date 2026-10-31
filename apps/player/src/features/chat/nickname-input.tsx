import { Button } from '@dendelion/func-ui';
import { type KeyboardEvent, useState } from 'react';

type NicknameInputProps = {
  onSetNickname: (name: string) => void;
  onNicknameChange?: () => void;
  error: string | null;
};

export const NicknameInput = ({
  onSetNickname,
  onNicknameChange,
  error,
}: NicknameInputProps) => {
  const [nickInput, setNickInput] = useState('');

  const handleSetNickname = () => {
    const name = nickInput.trim();
    if (!name) return;
    onSetNickname(name);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSetNickname();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 rounded-2xl border border-accent/25 bg-cream/5 p-2">
        <input
          value={nickInput}
          onChange={(e) => {
            setNickInput(e.target.value);
            onNicknameChange?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Your name…"
          className={`w-full flex-grow rounded bg-transparent p-2 font-sans text-sm text-cream outline-none placeholder:text-cream/35 ${
            error ? 'border border-accent/50 bg-accent/10' : ''
          }`}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!nickInput}
          onClick={handleSetNickname}
          className="shrink-0 whitespace-nowrap"
        >
          {nickInput ? "Let's go" : 'Join the chat'}
        </Button>
      </div>
      {error && (
        <p className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
};
