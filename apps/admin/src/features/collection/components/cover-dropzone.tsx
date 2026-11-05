import { Pill } from '@/features/admin/ui';
import { useUploadCoverArt } from '@/services/api';
import clsx from 'clsx';
import { useRef, useState } from 'react';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/** A new cover for the album: dropped or picked, a photo under 5 MB. */
export const CoverDropzone = ({
  albumId,
  onDone,
}: {
  albumId: number;
  onDone: () => void;
}) => {
  const upload = useUploadCoverArt();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setMessage('Потрібне зображення: JPEG, PNG або WebP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage('Файл має бути меншим за 5 МБ.');
      return;
    }
    setMessage(null);
    try {
      await upload.mutateAsync({ id: albumId, file });
      setDone(true);
      setTimeout(onDone, 800);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Не вдалося завантажити обкладинку.');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <span className="type-label text-cream/60">Нова обкладинка</span>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the zone delegates to the hidden input, which the keyboard reaches through the pill below */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          'flex aspect-square w-full max-w-[300px] cursor-pointer flex-col items-center justify-center gap-2 border border-dashed p-6 text-center transition-colors',
          dragging
            ? 'border-glow bg-glow/10 text-glow'
            : 'border-cream/25 text-cream/60 hover:border-cream/40',
        )}
      >
        {upload.isPending ? (
          <span className="type-body">Завантаження…</span>
        ) : done ? (
          <span className="type-body text-glow">Обкладинку оновлено</span>
        ) : (
          <>
            <span className="font-sans text-3xl leading-none">+</span>
            <span className="type-body">
              Перетягніть фото сюди або натисніть
            </span>
            <span className="font-sans text-[11px] text-cream/45">
              JPEG, PNG, WebP · до 5 МБ
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {message && <p className="font-sans text-xs text-accent">{message}</p>}
      <div className="flex gap-2.5">
        <Pill tone="ghost" size="sm" onClick={() => inputRef.current?.click()}>
          Вибрати файл
        </Pill>
        <Pill tone="quiet" size="sm" onClick={onDone}>
          Скасувати
        </Pill>
      </div>
    </div>
  );
};
