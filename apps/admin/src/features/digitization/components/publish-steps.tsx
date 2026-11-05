import { FeedRow } from '@/features/admin/ui';
import {
  digitizationKeys,
  useCleanupDraft,
  useDigitizationJob,
  usePublishDraft,
} from '@/services/api';
import { Button } from '@dendelion/func-ui';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/split-review-utils';

/**
 * The last steps: publishing the split tracks into the collection, with
 * the job's lines as they come; and, once the record is on air, clearing
 * the inbox of the sides or the whole folder.
 */
export const PublishSteps = ({
  slug,
  onAir,
  canPublish,
  onPublished,
  onFolderDeleted,
}: {
  slug: string;
  onAir: boolean;
  canPublish: boolean;
  onPublished?: () => void;
  onFolderDeleted: () => void;
}) => {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);
  const publish = usePublishDraft();
  const cleanup = useCleanupDraft();
  const { data: job } = useDigitizationJob(jobId);

  useEffect(() => {
    if (job?.status !== 'success') return;
    queryClient.invalidateQueries({ queryKey: digitizationKeys.detail(slug) });
    queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
    // Let «Альбом опубліковано» and the job's last line be seen before leaving.
    const timer = setTimeout(() => onPublished?.(), 2500);
    return () => clearTimeout(timer);
  }, [job?.status, queryClient, slug, onPublished]);

  const start = async () => {
    try {
      const started = await publish.mutateAsync(slug);
      setJobId(started.id);
    } catch (err) {
      console.error('Failed to start publish job:', err);
    }
  };

  const running = job?.status === 'running' || job?.status === 'pending';

  const deleteSides = () => {
    if (
      !confirm(
        'Видалити вихідні side-*.wav цього драфту? Їх уже опубліковано — відновити можна буде лише повторним записом з вінілу.',
      )
    ) {
      return;
    }
    cleanup.mutate({ slug, target: 'sides' });
  };
  const deleteFolder = () => {
    if (
      !confirm(
        'Видалити всю теку інбоксу цього драфту з усіма файлами? Її вже опубліковано — відновити можна буде лише повторним записом з вінілу.',
      )
    ) {
      return;
    }
    cleanup.mutate({ slug, target: 'folder' }, { onSuccess: onFolderDeleted });
  };

  return (
    <section className="flex flex-col gap-4">
      <span className="type-label text-cream/60">
        {onAir ? 'В ефірі' : 'Публікація'}
      </span>

      {canPublish && !onAir && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={job?.status === 'error' ? 'danger' : 'lit'}
            size="sm"
            disabled={running || publish.isPending}
            onClick={start}
          >
            {running ? 'Публікація…' : 'Опублікувати в ефір'}
          </Button>
          {job?.status === 'success' && (
            <span className="font-sans text-xs text-glow">
              Альбом опубліковано.
            </span>
          )}
        </div>
      )}

      {publish.isError && (
        <p className="font-sans text-xs text-accent">
          {getErrorMessage(publish.error)}
        </p>
      )}
      {job && job.progress.length > 0 && (
        <div className="flex flex-col gap-2">
          {job.progress.map((line, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the job's lines are append-only
            <FeedRow key={index} time="" tone="muted">
              {line}
            </FeedRow>
          ))}
        </div>
      )}
      {job?.status === 'error' && (
        <p className="font-sans text-xs text-accent">{job.error}</p>
      )}

      {onAir && (
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            disabled={cleanup.isPending}
            onClick={deleteSides}
          >
            Видалити side-*.wav
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={cleanup.isPending}
            onClick={deleteFolder}
          >
            Видалити теку інбоксу
          </Button>
          {cleanup.isError && (
            <span className="font-sans text-xs text-accent">
              {getErrorMessage(cleanup.error)}
            </span>
          )}
        </div>
      )}
    </section>
  );
};
