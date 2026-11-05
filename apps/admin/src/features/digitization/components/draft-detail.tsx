import { Pill } from '@/features/admin/ui';
import { useDigitizationDraft } from '@/services/api';
import { useState } from 'react';
import { getErrorMessage } from '../lib/split-review-utils';
import { formatFileSize, nextStepHint } from '../lib/stages';
import { DiscogsLookup } from './discogs-lookup';
import { DraftCover } from './draft-cover';
import { MetadataForm } from './metadata-form';
import { PublishSteps } from './publish-steps';
import { SplitReview } from './split-review';
import { UploadZone } from './upload-zone';

type DraftDetailProps = {
  slug: string;
  onDeleted: () => void;
  onPublished: () => void;
};

/**
 * The open draft: its name and files under the stage chips, then the work
 * of each step in order — the sides to upload, the metadata (fetched from
 * Discogs or edited), the split, the publishing, and the cleanup once the
 * record is on air.
 */
export const DraftDetail = ({
  slug,
  onDeleted,
  onPublished,
}: DraftDetailProps) => {
  const { data: draft, isLoading, isError, error } = useDigitizationDraft(slug);
  // `null` keeps the lookup closed; otherwise whether it may replace data.json.
  const [lookupForce, setLookupForce] = useState<boolean | null>(null);

  if (isError) {
    return <p className="type-body text-accent">{getErrorMessage(error)}</p>;
  }
  if (isLoading || !draft) {
    return <p className="type-body text-cream/45">Завантаження…</p>;
  }

  const files = [...draft.sides, ...draft.trackFiles];

  return (
    <>
      <div className="flex items-start gap-6">
        <DraftCover
          slug={draft.slug}
          hasCover={draft.hasCover}
          title={draft.title}
        />
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-serif text-[34px] font-extrabold leading-[1.1] text-cream">
            {draft.artist} — {draft.title}
          </h1>
          <p className="font-sans text-[13px] text-cream/60">
            {files.length > 0
              ? files
                  .map((file) =>
                    [file, formatFileSize(draft.fileSizes[file])]
                      .filter(Boolean)
                      .join(' '),
                  )
                  .join(' · ')
              : 'файлів ще немає'}
          </p>
          <p className="type-label text-glow">{nextStepHint(draft)}</p>
        </div>
      </div>

      {draft.stage !== 'on-air' && <UploadZone slug={draft.slug} />}

      {draft.metadata ? (
        <>
          {lookupForce !== null ? (
            <DiscogsLookup
              slug={draft.slug}
              force={lookupForce}
              onClose={() => setLookupForce(null)}
            />
          ) : (
            <MetadataForm
              slug={draft.slug}
              metadata={draft.metadata}
              onRefetch={() => setLookupForce(true)}
            />
          )}
          {draft.sides.length > 0 &&
            (draft.stage === 'ready-to-encode' || draft.stage === 'on-air' ? (
              <p className="type-body text-cream/45">Треки вже розкроєні.</p>
            ) : (
              <SplitReview
                slug={draft.slug}
                hasTrackFiles={draft.trackFiles.length > 0}
              />
            ))}
          {(draft.trackFiles.length > 0 || draft.stage === 'on-air') && (
            <PublishSteps
              slug={draft.slug}
              onAir={draft.stage === 'on-air'}
              canPublish={draft.trackFiles.length > 0}
              onPublished={onPublished}
              onFolderDeleted={onDeleted}
            />
          )}
        </>
      ) : lookupForce !== null ? (
        <DiscogsLookup
          slug={draft.slug}
          force={lookupForce}
          onClose={() => setLookupForce(null)}
        />
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="type-body text-cream/70">
            У цього драфту ще немає data.json.
          </p>
          <Pill tone="lit" size="sm" onClick={() => setLookupForce(false)}>
            Отримати метадані з Discogs
          </Pill>
        </div>
      )}
    </>
  );
};
