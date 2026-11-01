import { LampButton, LampSwitch } from '@dendelion/func-ui';
import { type KeyboardEvent, useState } from 'react';
import { NICKNAME_COLORS } from './colors';
import type { ChatRoom } from './use-chat-room';

type SettingsPageProps = {
  room: ChatRoom;
};

const SECTION_LABEL =
  'font-sans text-xs font-medium uppercase tracking-wide text-cream/40';

export const SettingsPage = ({ room }: SettingsPageProps) => {
  const [nickInput, setNickInput] = useState(room.nickname);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const handleSaveNickname = () => {
    const name = nickInput.trim();
    if (!name) return;
    room.setNickname(name);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') handleSaveNickname();
  };

  const handleClear = () => {
    room.clearData();
    setNickInput('');
    setConfirmingClear(false);
  };

  return (
    <div className="chat-scroll min-h-0 flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-1 py-2">
      <section className="space-y-2">
        <p className={SECTION_LABEL}>Nickname</p>
        <div className="control-island flex flex-row items-center gap-2 rounded-full border border-cream/10 p-2 pl-4">
          <input
            value={nickInput}
            onChange={(event) => {
              setNickInput(event.target.value);
              room.clearNicknameError();
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={!!room.nicknameError}
            className={`w-full flex-grow rounded bg-transparent p-2 font-sans text-sm text-cream outline-none placeholder:text-cream/35 ${
              room.nicknameError ? 'border border-accent/50 bg-accent/10' : ''
            }`}
          />
          <LampButton
            type="button"
            tone={nickInput.trim() ? 'red' : 'dark'}
            size="sm"
            disabled={!nickInput.trim()}
            onClick={handleSaveNickname}
            className="shrink-0 whitespace-nowrap"
          >
            Save
          </LampButton>
        </div>
        {room.nicknameError && (
          <p className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1 text-sm text-accent">
            {room.nicknameError}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <p className={SECTION_LABEL}>Name colour</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => room.setColorChoice(null)}
            className={`rounded-full border px-3 py-1 font-sans text-xs uppercase tracking-wide text-cream/70 ${
              room.colorChoice === null
                ? 'border-cream/60 bg-cream/10'
                : 'border-cream/15'
            }`}
          >
            Auto
          </button>
          {NICKNAME_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Use ${color} as the name colour`}
              onClick={() => room.setColorChoice(color)}
              className={`size-7 rounded-full border-2 ${
                room.colorChoice === color
                  ? 'border-cream/80'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className={SECTION_LABEL}>Chat sounds</p>
        <div className="space-y-2">
          <LampSwitch
            tone="red"
            size="sm"
            label="All sounds"
            checked={room.sound.isEnabled}
            onChange={room.sound.toggle}
          />
          <LampSwitch
            tone="red"
            size="sm"
            label="New message"
            checked={room.sound.types.message.enabled}
            disabled={!room.sound.isEnabled}
            onChange={room.sound.types.message.toggle}
          />
          <LampSwitch
            tone="red"
            size="sm"
            label="Sent message"
            checked={room.sound.types.send.enabled}
            disabled={!room.sound.isEnabled}
            onChange={room.sound.types.send.toggle}
          />
          <LampSwitch
            tone="red"
            size="sm"
            label="Someone joins"
            checked={room.sound.types.join.enabled}
            disabled={!room.sound.isEnabled}
            onChange={room.sound.types.join.toggle}
          />
        </div>
      </section>

      <section className="space-y-2">
        <p className={SECTION_LABEL}>Data</p>
        {confirmingClear ? (
          <div className="space-y-2 rounded-xl bg-cream/5 p-3">
            <p className="text-sm text-cream/70">
              This clears your nickname, colour and sound settings.
            </p>
            <div className="flex gap-2">
              <LampButton
                type="button"
                tone="red"
                size="sm"
                onClick={handleClear}
              >
                Yes, clear everything
              </LampButton>
              <LampButton
                type="button"
                tone="dark"
                size="sm"
                onClick={() => setConfirmingClear(false)}
                className="text-cream"
              >
                Cancel
              </LampButton>
            </div>
          </div>
        ) : (
          <LampButton
            type="button"
            tone="dark"
            size="sm"
            onClick={() => setConfirmingClear(true)}
            className="text-cream"
          >
            Clear all data
          </LampButton>
        )}
      </section>
    </div>
  );
};
