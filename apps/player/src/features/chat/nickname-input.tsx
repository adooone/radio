import { useT } from '@/i18n';
import { LampButton, LampIconButton } from '@dendelion/func-ui';
import { type KeyboardEvent, useState } from 'react';
import { CheckIcon } from './icons';

type NicknameInputProps = {
  onSetNickname: (name: string) => void;
  onNicknameChange?: () => void;
  error: string | null;
  /** On the island: no pill of its own — the join lamp and the field join
      the island's row, in the play lamp's and the words' places. */
  island?: boolean;
};

export const NicknameInput = ({
  onSetNickname,
  onNicknameChange,
  error,
  island = false,
}: NicknameInputProps) => {
  const t = useT();
  const [nickInput, setNickInput] = useState('');

  const handleSetNickname = () => {
    const name = nickInput.trim();
    if (!name) return;
    onSetNickname(name);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSetNickname();
  };

  const field = (
    <input
      value={nickInput}
      onChange={(e) => {
        setNickInput(e.target.value);
        onNicknameChange?.();
      }}
      onKeyDown={handleKeyDown}
      placeholder={t('chat.nickname.placeholder')}
      aria-invalid={!!error}
      className={`w-full flex-grow rounded bg-transparent p-2 type-ui text-base text-cream outline-none placeholder:text-cream/45 ${
        island ? 'min-w-0 text-base' : ''
      } ${error ? 'border border-accent/50 bg-accent/10' : ''}`}
    />
  );

  if (island) {
    return (
      <>
        <LampIconButton
          type="button"
          tone={nickInput ? 'red' : 'dark'}
          size="md"
          disabled={!nickInput}
          onClick={handleSetNickname}
          label={t('chat.nickname.join')}
          icon={<CheckIcon />}
          className={`shrink-0 disabled:cursor-default disabled:opacity-60 ${
            nickInput ? 'text-ink' : 'text-cream'
          }`}
        />
        {field}
        {error && (
          <p
            role="alert"
            className="absolute right-4 bottom-full left-4 mb-2 rounded-lg border border-accent/20 bg-ink/90 px-3 py-1 type-ui text-accent"
          >
            {error}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {error && (
        <p className="type-ui rounded-lg border border-accent/20 bg-accent/10 px-3 py-1 text-accent">
          {error}
        </p>
      )}
      <div className="control-island flex flex-row items-center gap-2 rounded-full border border-cream/10 p-2 pl-4">
        {field}
        <LampButton
          type="button"
          tone={nickInput ? 'red' : 'dark'}
          size="sm"
          disabled={!nickInput}
          onClick={handleSetNickname}
          className="shrink-0 whitespace-nowrap"
        >
          {t(nickInput ? 'chat.nickname.go' : 'chat.nickname.join')}
        </LampButton>
      </div>
    </div>
  );
};
