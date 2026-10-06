import { useDigitizationDraft } from '@/services/api';
import { Button, Modal } from '@dendelion/mojo-ui';
import clsx from 'clsx';
import { useState } from 'react';
import { CleanupSection } from './cleanup-section';
import { DraftCover } from './draft-cover';
import { DraftStageBadge } from './draft-stage-badge';
import { MetadataEditForm } from './metadata-edit-form';
import { MetadataModal } from './metadata-modal';
import { PublishSection } from './publish-section';
import { SplitReviewSection } from './split-review';
import { getErrorMessage } from './split-review/split-review-utils';
import { UploadSection } from './upload-section';

type DraftDetailModalProps = {
  slug: string | null;
  onClose: () => void;
};

export const DraftDetailModal = ({ slug, onClose }: DraftDetailModalProps) => {
  const [metadataModalForce, setMetadataModalForce] = useState<boolean | null>(
    null,
  );
  const {
    data: draft,
    isLoading,
    isError,
    error,
  } = useDigitizationDraft(slug ?? '');

  if (!slug) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={draft?.title ?? 'Драфт'}
        maxWidth="max-w-6xl"
      >
        {isError ? (
          <p className={clsx(styles.error)}>{getErrorMessage(error)}</p>
        ) : isLoading || !draft ? (
          <p className={clsx(styles.hint)}>Завантаження...</p>
        ) : (
          <div className={clsx(styles.layout)}>
            <div className={clsx(styles.sidebar)}>
              <DraftCover
                slug={draft.slug}
                hasCover={draft.hasCover}
                title={draft.title}
              />
              <DraftStageBadge stage={draft.stage} />
              <p className={clsx(styles.counts)}>
                {draft.sides.length} сторін · {draft.trackFiles.length} треків
              </p>
            </div>

            <div className={clsx(styles.content)}>
              {draft.stage !== 'on-air' && <UploadSection slug={draft.slug} />}
              {draft.metadata ? (
                <>
                  <MetadataEditForm
                    slug={draft.slug}
                    metadata={draft.metadata}
                  />
                  <Button
                    type="button"
                    variant="gray"
                    size="small"
                    title="Отримати метадані з Discogs повторно"
                    onClick={() => setMetadataModalForce(true)}
                  />
                  {draft.sides.length > 0 &&
                    (draft.stage === 'ready-to-encode' ||
                    draft.stage === 'on-air' ? (
                      <p className={clsx(styles.hint)}>Треки вже розкроєні.</p>
                    ) : (
                      <SplitReviewSection
                        slug={draft.slug}
                        hasTrackFiles={draft.trackFiles.length > 0}
                      />
                    ))}
                  {draft.trackFiles.length > 0 && (
                    <PublishSection slug={draft.slug} />
                  )}
                  {draft.stage === 'on-air' && (
                    <CleanupSection
                      slug={draft.slug}
                      onFolderDeleted={onClose}
                    />
                  )}
                </>
              ) : (
                <div className={clsx(styles.empty)}>
                  <p>У цього драфту ще немає data.json.</p>
                  <Button
                    type="button"
                    variant="dark"
                    size="medium"
                    title="Отримати метадані з Discogs"
                    onClick={() => setMetadataModalForce(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {metadataModalForce !== null && (
        <MetadataModal
          slug={draft?.slug ?? slug}
          force={metadataModalForce}
          onClose={() => setMetadataModalForce(null)}
        />
      )}
    </>
  );
};

const styles = {
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
  layout: ['flex flex-col md:flex-row gap-6'],
  sidebar: ['flex flex-col gap-3 w-full md:w-48 flex-shrink-0'],
  counts: ['text-xs text-gray-500'],
  content: ['flex-1 flex flex-col gap-4'],
  empty: ['flex flex-col items-start gap-3 text-gray-400'],
} as const;
