import {
  LampButton,
  LampIconButton,
  LampMeter,
  Tooltip,
} from '@dendelion/func-ui';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { collectDroppedFiles } from './collect-dropped-files';
import { PauseIcon, PlayIcon, RefreshIcon } from './radio-folder/icons';
import { useBeforeUnloadWhileUploading } from './use-before-unload-while-uploading';
import { type UploadTask, useUploadManager } from './use-upload-manager';

type UploadSectionProps = {
  slug: string;
};

export const UploadSection = ({ slug }: UploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { tasks, addFiles, pause, resume, retry, isUploading } =
    useUploadManager(slug);

  useBeforeUnloadWhileUploading(isUploading);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const { rejected: rejectedNames } = addFiles(files);
    setRejected(rejectedNames);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(await collectDroppedFiles(event.dataTransfer));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={clsx(styles.section)}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: drop zone delegates click to the hidden file input */}
      <div
        className={clsx(styles.dropzone, isDragging && styles.dropzoneActive)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(Array.from(event.target.files ?? []));
            event.target.value = '';
          }}
        />
        <p className={clsx(styles.hint)}>
          Перетягніть теку запису або файли side-*.wav, або натисніть, щоб
          вибрати
        </p>
      </div>

      {rejected.length > 0 && (
        <p className={clsx(styles.error)}>
          Пропущено (не side-*.wav або &gt;2ГБ): {rejected.join(', ')}
        </p>
      )}

      {tasks.length > 0 && (
        <UploadTaskList
          tasks={tasks}
          onPause={pause}
          onResume={resume}
          onRetry={retry}
        />
      )}
    </div>
  );
};

type UploadTaskListProps = {
  tasks: UploadTask[];
  onPause: (taskId: string) => void;
  onResume: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  compact?: boolean;
};

export const UploadTaskList = ({
  tasks,
  onPause,
  onResume,
  onRetry,
  compact,
}: UploadTaskListProps) => (
  <ul className={clsx(styles.taskList)}>
    {tasks.map((task) => (
      <UploadTaskRow
        key={task.id}
        task={task}
        compact={compact}
        onPause={() => onPause(task.id)}
        onResume={() => onResume(task.id)}
        onRetry={() => onRetry(task.id)}
      />
    ))}
  </ul>
);

type UploadTaskRowProps = {
  task: UploadTask;
  onPause: () => void;
  onResume: () => void;
  onRetry: () => void;
  compact?: boolean;
};

const UploadTaskRow = ({
  task,
  onPause,
  onResume,
  onRetry,
  compact,
}: UploadTaskRowProps) => {
  const variant =
    task.status === 'error'
      ? 'red'
      : task.status === 'done'
        ? 'green'
        : 'yellow';

  if (compact) {
    return (
      <li className={clsx(styles.taskRowCompact)}>
        <p className={clsx(styles.taskFilenameCompact)}>{task.filename}</p>
        <LampMeter
          value={task.uploadedBytes}
          max={task.size}
          tone={variant}
          size="sm"
          showValue={false}
          className={clsx(styles.progressCompact)}
        />
        {task.status === 'uploading' && (
          <Tooltip content="Пауза">
            <LampIconButton
              type="button"
              tone="gray"
              size="sm"
              label="Пауза"
              icon={<PauseIcon />}
              onClick={onPause}
            />
          </Tooltip>
        )}
        {task.status === 'paused' && (
          <Tooltip content="Продовжити">
            <LampIconButton
              type="button"
              tone="gray"
              size="sm"
              label="Продовжити"
              icon={<PlayIcon />}
              onClick={onResume}
            />
          </Tooltip>
        )}
        {task.status === 'error' && (
          <Tooltip content={task.error ?? 'Повторити'}>
            <LampIconButton
              type="button"
              tone="gray"
              size="sm"
              label="Повторити"
              icon={<RefreshIcon />}
              onClick={onRetry}
            />
          </Tooltip>
        )}
      </li>
    );
  }

  return (
    <li className={clsx(styles.taskRow)}>
      <LampMeter
        value={task.uploadedBytes}
        max={task.size}
        tone={variant}
        size="sm"
        label={task.filename}
      />
      {task.status === 'error' && (
        <p className={clsx(styles.error)}>{task.error}</p>
      )}
      <div className={clsx(styles.taskActions)}>
        {task.status === 'uploading' && (
          <LampButton type="button" tone="gray" size="sm" onClick={onPause}>
            Пауза
          </LampButton>
        )}
        {task.status === 'paused' && (
          <LampButton type="button" tone="gray" size="sm" onClick={onResume}>
            Продовжити
          </LampButton>
        )}
        {task.status === 'error' && (
          <LampButton type="button" tone="gray" size="sm" onClick={onRetry}>
            Повторити
          </LampButton>
        )}
      </div>
    </li>
  );
};

const styles = {
  section: ['flex flex-col gap-3'],
  dropzone: [
    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
    'border-gray-600 hover:border-gray-500',
  ],
  dropzoneActive: ['border-sun bg-sun/10'],
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
  taskList: ['flex flex-col gap-3'],
  taskRow: ['flex flex-col gap-1'],
  taskActions: ['flex justify-end gap-2'],
  taskRowCompact: ['flex items-center gap-2'],
  taskFilenameCompact: ['text-xs text-gray-400 truncate max-w-[6rem]'],
  progressCompact: ['flex-1'],
} as const;
