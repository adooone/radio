import clsx from 'clsx';
import { useState } from 'react';
import { useSound } from '@/features/radio/hooks';
import { useDetailedSound } from '@/features/radio/hooks/use-detailed-sound';
import { useUserList } from '@/features/radio/hooks/use-user-list';
import { useUserColor } from '@/features/radio/hooks/use-user-color';
import { getSocket } from '@/services/socket';
import { ColorPickerModal } from './color-picker-modal';
import { CloseButton, Button, ToggleButton } from '@/components/ui';

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  onNicknameChange: (newNickname: string) => void;
}

export const AccountSettings = ({
  isOpen,
  onClose,
  nickname,
  onNicknameChange,
}: AccountSettingsProps) => {
  const { isEnabled: masterSoundEnabled, toggle: toggleMasterSound } =
    useSound();
  const {
    messageSounds,
    sendSounds,
    joinSounds,
    toggleMessageSounds,
    toggleSendSounds,
    toggleJoinSounds,
  } = useDetailedSound();

  const users = useUserList();
  const { isAutoMode, getEffectiveColor } = useUserColor();
  const [newNickname, setNewNickname] = useState(nickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  if (!isOpen) return null;

  const handleClearAllData = () => {
    if (
      confirm(
        "Ви впевнені, що хочете очистити всі дані? Це скине ваше ім'я та налаштування.",
      )
    ) {
      localStorage.clear();
      onNicknameChange('');
      onClose();
      // Reload page to reset all state
      window.location.reload();
    }
  };

  const handleChangeNickname = () => {
    const trimmedName = newNickname.trim();

    // Clear previous error
    setNicknameError(null);

    // Basic validation
    if (trimmedName.length < 2) {
      setNicknameError("Ім'я має бути не менше 2 символів");
      return;
    }

    if (trimmedName.length > 20) {
      setNicknameError("Ім'я має бути не більше 20 символів");
      return;
    }

    // Check if nickname is reserved
    if (
      trimmedName.toLowerCase() === 'анонім' ||
      trimmedName.toLowerCase() === 'анон'
    ) {
      setNicknameError("Це ім'я зарезервоване, спробуй інше");
      return;
    }

    // Check if nickname is already taken (excluding current user)
    const isNicknameTaken = users.some(
      (user) =>
        user.nickname.toLowerCase() === trimmedName.toLowerCase() &&
        user.nickname.toLowerCase() !== nickname.toLowerCase(),
    );

    if (isNicknameTaken) {
      setNicknameError("Це ім'я вже зайняте, спробуй інше");
      return;
    }

    // If we get here, nickname is valid
    onNicknameChange(trimmedName);
    localStorage.setItem('nickname', trimmedName);

    // Send join message with new nickname
    try {
      const ws = getSocket();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'join', nickname: trimmedName }));
      }
    } catch {
      // Socket not ready yet, will be sent on next connection
    }

    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickname(e.target.value);
    // Clear error when user starts typing
    if (nicknameError) {
      setNicknameError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleChangeNickname();
    }
  };

  return (
    <div
      className={clsx(styles.overlay)}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="presentation"
    >
      <dialog
        className={clsx(styles.modal)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        open
        aria-labelledby="account-settings-title"
      >
        <div className={clsx(styles.header)}>
          <h3 id="account-settings-title" className={clsx(styles.title)}>
            Налаштування акаунту
          </h3>
          <CloseButton
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
            aria-label="Close account settings"
          />
        </div>

        <div className={clsx(styles.content)}>
          <div className={clsx(styles.section)}>
            <h4 className={clsx(styles.sectionTitle)}>Профіль</h4>
            <div className={clsx(styles.profileInfo)}>
              <span className={clsx(styles.label)}>Поточне ім'я:</span>
              <span
                className={clsx(
                  styles.nicknameDisplay,
                  getEffectiveColor(nickname, true),
                )}
              >
                {nickname}
              </span>
            </div>
            <div className={clsx(styles.nicknameChangeForm)}>
              <input
                value={newNickname}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Нове ім'я..."
                className={clsx(
                  styles.nicknameInput,
                  nicknameError && styles.inputError,
                )}
              />
              <Button
                variant="primary"
                onClick={handleChangeNickname}
                disabled={
                  !newNickname.trim() || newNickname.trim() === nickname
                }
                size="sm"
              >
                Змінити
              </Button>
            </div>
            {nicknameError && (
              <div className={clsx(styles.error)}>{nicknameError}</div>
            )}
          </div>

          <div className={clsx(styles.section)}>
            <h4 className={clsx(styles.sectionTitle)}>Колір імені</h4>
            <div className={clsx(styles.colorPreview)}>
              <div className={clsx(styles.colorPreviewText)}>
                <span className={clsx(styles.label)}>Поточний колір:</span>
                <span className={clsx(styles.colorMode)}>
                  {isAutoMode ? '(Автоматичний)' : '(Обраний вручну)'}
                </span>
              </div>
              <span
                className={clsx(
                  styles.nicknamePreview,
                  getEffectiveColor(nickname, true),
                )}
              >
                {nickname}
              </span>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsColorPickerOpen(true)}
            >
              Змінити колір
            </Button>
          </div>

          <div className={clsx(styles.section)}>
            <h4 className={clsx(styles.sectionTitle)}>Налаштування звуку</h4>
            <div className={clsx(styles.toggleContainer)}>
              <span className={clsx(styles.label)}>Головний перемикач</span>
              <ToggleButton
                checked={masterSoundEnabled}
                onToggle={toggleMasterSound}
                aria-label={`${masterSoundEnabled ? 'Вимкнути' : 'Увімкнути'} всі звуки`}
              />
            </div>

            <div className={clsx(styles.soundSubsection)}>
              <h5 className={clsx(styles.subsectionTitle)}>Типи звуків</h5>

              <div className={clsx(styles.toggleContainer)}>
                <span className={clsx(styles.label)}>Звуки повідомлень</span>
                <ToggleButton
                  checked={messageSounds && masterSoundEnabled}
                  onToggle={toggleMessageSounds}
                  disabled={!masterSoundEnabled}
                  aria-label={`${messageSounds ? 'Вимкнути' : 'Увімкнути'} звуки повідомлень`}
                />
              </div>

              <div className={clsx(styles.toggleContainer)}>
                <span className={clsx(styles.label)}>Звуки відправлення</span>
                <ToggleButton
                  checked={sendSounds && masterSoundEnabled}
                  onToggle={toggleSendSounds}
                  disabled={!masterSoundEnabled}
                  aria-label={`${sendSounds ? 'Вимкнути' : 'Увімкнути'} звуки відправлення`}
                />
              </div>

              <div className={clsx(styles.toggleContainer)}>
                <span className={clsx(styles.label)}>
                  Звуки входу користувачів
                </span>
                <ToggleButton
                  checked={joinSounds && masterSoundEnabled}
                  onToggle={toggleJoinSounds}
                  disabled={!masterSoundEnabled}
                  aria-label={`${joinSounds ? 'Вимкнути' : 'Увімкнути'} звуки входу користувачів`}
                />
              </div>
            </div>
          </div>

          <div className={clsx(styles.section)}>
            <h4 className={clsx(styles.sectionTitle)}>Дані</h4>
            <Button variant="danger" onClick={handleClearAllData}>
              Очистити всі дані
            </Button>
            <p className={clsx(styles.warning)}>
              Це видалить ваше ім'я та всі налаштування
            </p>
          </div>
        </div>
      </dialog>

      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
        nickname={nickname}
      />
    </div>
  );
};

const styles = {
  overlay: [
    'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
    'flex items-center justify-center p-4',
  ],
  modal: [
    'w-full max-w-md bg-coal-relic/95 backdrop-blur-l rounded-2xl border border-moss/20',
    'flex flex-col max-h-[80vh]',
  ],
  header: ['flex items-center justify-between p-4'],
  title: ['text-lg font-display uppercase text-white/80'],

  content: [
    'flex flex-col gap-6 p-4 overflow-y-auto',
    'scrollbar-thin scrollbar-thumb-moss/30 scrollbar-track-transparent',
  ],
  section: ['flex flex-col gap-3'],
  sectionTitle: ['text-base font-display uppercase text-white/60'],
  soundSubsection: ['flex flex-col gap-2 ml-4 mt-3'],
  subsectionTitle: ['text-sm font-display uppercase text-white/40'],
  profileInfo: ['flex items-center justify-between gap-2'],
  label: ['text-white/60 text-sm'],
  nicknameDisplay: ['font-display uppercase'],
  nicknameChangeForm: ['flex gap-2 items-start'],
  nicknameInput: [
    'flex-1 px-3 py-2 rounded-lg bg-neutral-900/40 border border-white/10',
    'text-white/90 text-sm focus:outline-none focus:border-moss/40',
    'transition-colors duration-200',
  ],
  inputError: ['border-red-500/50 bg-red-500/10'],

  error: [
    'text-red-400 text-sm px-3 py-1 bg-red-500/10 rounded-lg',
    'border border-red-500/20',
  ],
  toggleContainer: ['flex items-center justify-between gap-2'],

  warning: ['text-white/40 text-xs'],
  colorPreview: ['flex items-center justify-between gap-2'],
  colorPreviewText: ['flex flex-col gap-1'],
  colorMode: ['text-xs text-white/40'],
  nicknamePreview: ['font-display uppercase'],
} as const;
