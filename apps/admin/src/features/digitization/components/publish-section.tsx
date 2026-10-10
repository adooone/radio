import {
  digitizationKeys,
  useDigitizationJob,
  usePublishDraft,
} from '@/services/api';
import { LampButton } from '@dendelion/func-ui';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { getErrorMessage } from './split-review/split-review-utils';

type PublishSectionProps = {
  slug: string;
  onPublished?: () => void;
};

export const PublishSection = ({ slug, onPublished }: PublishSectionProps) => {
  const queryClient = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);
  const publishDraft = usePublishDraft();
  const { data: job } = useDigitizationJob(jobId);

  useEffect(() => {
    if (job?.status !== 'success') return;
    queryClient.invalidateQueries({
      queryKey: digitizationKeys.detail(slug),
    });
    queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
    // Let «Альбом опубліковано.» and the final job log be seen before leaving.
    const timer = setTimeout(() => onPublished?.(), 2500);
    return () => clearTimeout(timer);
  }, [job?.status, queryClient, slug, onPublished]);

  const handlePublish = async () => {
    try {
      const started = await publishDraft.mutateAsync(slug);
      setJobId(started.id);
    } catch (err) {
      console.error('Failed to start publish job:', err);
    }
  };

  const isRunning = job?.status === 'running' || job?.status === 'pending';

  return (
    <div className={clsx(styles.section)}>
      <LampButton
        type="button"
        tone={job?.status === 'error' ? 'red' : 'dark'}
        size="md"
        disabled={isRunning || publishDraft.isPending}
        onClick={handlePublish}
      >
        {isRunning ? 'Публікація...' : 'Опублікувати в ефір'}
      </LampButton>

      {publishDraft.isError && (
        <p className={clsx(styles.error)}>
          {getErrorMessage(publishDraft.error)}
        </p>
      )}

      {job && job.progress.length > 0 && (
        <pre className={clsx(styles.log)}>{job.progress.join('\n')}</pre>
      )}

      {job?.status === 'error' && (
        <p className={clsx(styles.error)}>{job.error}</p>
      )}

      {job?.status === 'success' && (
        <p className={clsx(styles.success)}>Альбом опубліковано.</p>
      )}
    </div>
  );
};

const styles = {
  section: ['flex flex-col items-end gap-2 pt-2'],
  log: [
    'w-full max-h-40 overflow-y-auto rounded bg-black/40 p-2 text-xs text-gray-300',
  ],
  error: ['text-sm text-red-400'],
  success: ['text-sm text-moss-400'],
} as const;
