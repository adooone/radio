import { useCleanupDraft } from '@/services/api';
import { LampButton } from '@dendelion/func-ui';
import clsx from 'clsx';
import { getErrorMessage } from './split-review/split-review-utils';

type CleanupSectionProps = {
  slug: string;
  onFolderDeleted: () => void;
};

export const CleanupSection = ({
  slug,
  onFolderDeleted,
}: CleanupSectionProps) => {
  const cleanupDraft = useCleanupDraft();

  const handleDeleteSides = () => {
    if (
      !confirm(
        'Видалити вихідні side-*.wav цього драфту? Їх уже опубліковано — відновити можна буде лише повторним записом з вінілу.',
      )
    ) {
      return;
    }
    cleanupDraft.mutate({ slug, target: 'sides' });
  };

  const handleDeleteFolder = () => {
    if (
      !confirm(
        'Видалити всю папку інбоксу цього драфту (включно з усіма файлами)? Її вже опубліковано — відновити можна буде лише повторним записом з вінілу.',
      )
    ) {
      return;
    }
    cleanupDraft.mutate(
      { slug, target: 'folder' },
      { onSuccess: onFolderDeleted },
    );
  };

  return (
    <div className={clsx(styles.section)}>
      <LampButton
        type="button"
        tone="gray"
        size="sm"
        disabled={cleanupDraft.isPending}
        onClick={handleDeleteSides}
      >
        Видалити side-*.wav
      </LampButton>
      <LampButton
        type="button"
        tone="red"
        size="sm"
        disabled={cleanupDraft.isPending}
        onClick={handleDeleteFolder}
      >
        Видалити папку інбоксу
      </LampButton>
      {cleanupDraft.isError && (
        <p className={clsx(styles.error)}>
          {getErrorMessage(cleanupDraft.error)}
        </p>
      )}
    </div>
  );
};

const styles = {
  section: ['flex items-center justify-end gap-2 pt-2'],
  error: ['text-sm text-red-400'],
} as const;
