import { useDigitizationDraft } from '@/services/api';
import { Button } from '@dendelion/mojo-ui';
import type { DigitizationDraft } from '@radio/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';
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

type DraftDetailProps = {
  slug: string;
  onDeleted: () => void;
  onPublished: () => void;
};

export const DraftDetail = ({
  slug,
  onDeleted,
  onPublished,
}: DraftDetailProps) => {
  const [metadataModalForce, setMetadataModalForce] = useState<boolean | null>(
    null,
  );
  const { data: draft, isLoading, isError, error } = useDigitizationDraft(slug);

  return (
    <>
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
              layoutId={`draft-cover-${draft.slug}`}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={clsx(styles.sidebarInfo)}
            >
              <div>
                <h2 className={clsx(styles.title)}>{draft.title}</h2>
                <p className={clsx(styles.artist)}>{draft.artist}</p>
              </div>
              <DraftStageBadge stage={draft.stage} />
              {draft.sides.length > 0 || draft.trackFiles.length > 0 ? (
                <ul className={clsx(styles.fileList)}>
                  {[...draft.sides, ...draft.trackFiles].map((file) => (
                    <li key={file} className={clsx(styles.fileRow)}>
                      <span className={clsx(styles.fileName)}>{file}</span>
                      <span className={clsx(styles.fileSize)}>
                        {formatFileSize(draft.fileSizes[file])}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={clsx(styles.counts)}>Файлів ще немає</p>
              )}
              <p className={clsx(styles.nextStep)}>{nextStepHint(draft)}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
            className={clsx(styles.content)}
          >
            {draft.stage !== 'on-air' && <UploadSection slug={draft.slug} />}
            {draft.metadata ? (
              <>
                <MetadataEditForm slug={draft.slug} metadata={draft.metadata} />
                <Button
                  type="button"
                  variant="gray"
                  size="small"
                  title="Отримати метадані з Discogs повторно"
                  onClick={() => setMetadataModalForce(true)}
                  className="self-start"
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
                  <PublishSection slug={draft.slug} onPublished={onPublished} />
                )}
                {draft.stage === 'on-air' && (
                  <CleanupSection
                    slug={draft.slug}
                    onFolderDeleted={onDeleted}
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
          </motion.div>
        </div>
      )}

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

const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '';
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} ГБ`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} МБ`;
  return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
};

const nextStepHint = (draft: DigitizationDraft): string => {
  if (draft.stage === 'awaiting-sides')
    return 'Наступний крок: завантажте side-*.wav';
  if (draft.stage === 'ready-to-split' && !draft.hasMetadata)
    return 'Наступний крок: отримайте метадані з Discogs';
  if (draft.stage === 'ready-to-split')
    return 'Наступний крок: розкроїть сторони на треки';
  if (draft.stage === 'ready-to-encode')
    return 'Наступний крок: опублікуйте запис';
  return 'Запис в ефірі';
};

const styles = {
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
  layout: ['flex flex-col md:flex-row gap-6'],
  sidebar: ['flex flex-col gap-3 w-full md:w-48 flex-shrink-0'],
  sidebarInfo: ['flex flex-col gap-3'],
  title: ['font-medium text-gray-200 truncate'],
  artist: ['text-sm text-gray-400 truncate'],
  counts: ['text-xs text-gray-500'],
  fileList: ['flex flex-col gap-1'],
  fileRow: ['flex items-baseline justify-between gap-2 text-xs'],
  fileName: ['text-gray-300 font-mono truncate'],
  fileSize: ['text-gray-500 flex-shrink-0'],
  nextStep: ['text-xs text-amber-400/80'],
  content: ['flex-1 flex flex-col gap-4'],
  empty: ['flex flex-col items-start gap-3 text-gray-400'],
} as const;
