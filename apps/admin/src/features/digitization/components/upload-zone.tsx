import { GhostNav } from '@/features/admin/ui';
import { LampMeter } from '@dendelion/func-ui';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { useBeforeUnloadWhileUploading } from '../hooks/use-before-unload-while-uploading';
import { type UploadTask, useUploadManager } from '../hooks/use-upload-manager';
import { collectDroppedFiles } from '../lib/collect-dropped-files';

/** The sides being sent, each with its meter and the one thing to do to it. */
export const UploadTasks = ({
  tasks,
  onPause,
  onResume,
  onRetry,
}: {
  tasks: UploadTask[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onRetry: (id: string) => void;
}) => (
  <ul className="flex flex-col gap-2.5">
    {tasks.map((task) => (
      <li key={task.id} className="flex items-center gap-3">
        <span className="w-28 shrink-0 truncate font-mono text-xs text-cream/70">
          {task.filename}
        </span>
        <LampMeter
          value={task.uploadedBytes}
          max={task.size}
          tone={task.status === 'error' ? 'red' : 'yellow'}
          size="sm"
          showValue={false}
          className="min-w-0 flex-1"
        />
        {task.status === 'uploading' && (
          <GhostNav onClick={() => onPause(task.id)}>пауза</GhostNav>
        )}
        {task.status === 'paused' && (
          <GhostNav onClick={() => onResume(task.id)}>далі</GhostNav>
        )}
        {task.status === 'error' && (
          <GhostNav onClick={() => onRetry(task.id)} title={task.error}>
            ще раз
          </GhostNav>
        )}
        {task.status === 'done' && (
          <span className="type-label text-glow">готово</span>
        )}
      </li>
    ))}
  </ul>
);

/** Where the record's sides arrive: a drop zone for side-*.wav, then the meters. */
export const UploadZone = ({ slug }: { slug: string }) => {
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tasks, addFiles, pause, resume, retry, isUploading } =
    useUploadManager(slug);

  useBeforeUnloadWhileUploading(isUploading);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    setRejected(addFiles(files).rejected);
  };

  return (
    <section className="flex flex-col gap-3">
      <span className="type-label text-cream/60">Сторони</span>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the zone delegates to the hidden input */}
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
        onDrop={async (e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(await collectDroppedFiles(e.dataTransfer));
        }}
        className={clsx(
          'cursor-pointer rounded-[18px] border border-dashed px-6 py-5 text-center transition-colors',
          dragging
            ? 'border-glow bg-glow/10 text-glow'
            : 'border-cream/25 text-cream/60 hover:border-cream/40',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".wav"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        <p className="type-body">
          Перетягніть теку запису або файли side-*.wav, або натисніть, щоб вибрати
        </p>
      </div>
      {rejected.length > 0 && (
        <p className="font-sans text-xs text-accent">
          Пропущено (не side-*.wav або понад 2 ГБ): {rejected.join(', ')}
        </p>
      )}
      {tasks.length > 0 && (
        <UploadTasks tasks={tasks} onPause={pause} onResume={resume} onRetry={retry} />
      )}
    </section>
  );
};
