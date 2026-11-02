import { useUpdateDraftMetadata } from '@/services/api';
import type { AlbumDataJson, PersonnelItem, TracklistItem } from '@radio/types';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '../lib/split-review-utils';

export type MetadataFields = {
  albumTitle: string;
  artist: string;
  recordingYear: string;
  period: string;
  location: string;
  exceptions: string;
  label: string;
  catalogNumber: string;
  country: string;
  issueYear: string;
  released: string;
  format: string;
  phonographicCopyright: string;
  engineer: string;
  producers: string;
  mastering: string;
  photography: string;
  design: string;
  additionalInfo: string;
};

const list = (csv: string) =>
  csv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const fieldsOf = (metadata: AlbumDataJson): MetadataFields => ({
  albumTitle: metadata.album_title ?? '',
  artist: metadata.artist ?? '',
  recordingYear: metadata.recording_year?.toString() ?? '',
  period: metadata.recording_details?.period ?? '',
  location: metadata.recording_details?.location ?? '',
  exceptions: metadata.recording_details?.exceptions ?? '',
  label: metadata.release_info?.label ?? '',
  catalogNumber: metadata.release_info?.catalog_number ?? '',
  country: metadata.release_info?.country ?? '',
  issueYear: metadata.release_info?.issue_year?.toString() ?? '',
  released: metadata.release_info?.released ?? '',
  format: metadata.release_info?.format ?? '',
  phonographicCopyright: metadata.release_info?.phonographic_copyright ?? '',
  engineer: metadata.production?.engineer ?? '',
  producers: (metadata.production?.producers ?? []).join(', '),
  mastering: metadata.production?.mastering ?? '',
  photography: (metadata.visuals?.photography ?? []).join(', '),
  design: metadata.visuals?.design ?? '',
  additionalInfo: metadata.additional_info ?? '',
});

/**
 * The draft's data.json as a form: flat string fields plus the tracklist
 * and personnel lists, refilled from the draft only while nothing has been
 * touched, and written back in the file's own snake_case shape with the
 * Discogs block carried over untouched.
 */
export const useDraftMetadataForm = (
  slug: string,
  metadata: AlbumDataJson,
  onSaved?: () => void,
) => {
  const [fields, setFields] = useState<MetadataFields>(() =>
    fieldsOf(metadata),
  );
  const [tracklist, setTracklist] = useState<TracklistItem[]>(
    metadata.tracklist ?? [],
  );
  const [personnel, setPersonnel] = useState<PersonnelItem[]>(
    metadata.personnel ?? [],
  );
  const [dirty, setDirty] = useState(false);
  const update = useUpdateDraftMetadata();

  useEffect(() => {
    if (dirty) return;
    setFields(fieldsOf(metadata));
    setTracklist(metadata.tracklist ?? []);
    setPersonnel(metadata.personnel ?? []);
  }, [metadata, dirty]);

  const set = <K extends keyof MetadataFields>(
    key: K,
    value: MetadataFields[K],
  ) => {
    setDirty(true);
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const tracks = {
    update: (index: number, patch: Partial<TracklistItem>) => {
      setDirty(true);
      setTracklist((prev) =>
        prev.map((track, i) => (i === index ? { ...track, ...patch } : track)),
      );
    },
    remove: (index: number) => {
      setDirty(true);
      setTracklist((prev) => prev.filter((_, i) => i !== index));
    },
    add: () => {
      setDirty(true);
      setTracklist((prev) => [...prev, { position: '', title: '' }]);
    },
  };

  const people = {
    update: (index: number, patch: { name?: string; rolesText?: string }) => {
      setDirty(true);
      setPersonnel((prev) =>
        prev.map((person, i) =>
          i === index
            ? {
                name: patch.name ?? person.name,
                roles:
                  patch.rolesText !== undefined
                    ? list(patch.rolesText)
                    : person.roles,
              }
            : person,
        ),
      );
    },
    remove: (index: number) => {
      setDirty(true);
      setPersonnel((prev) => prev.filter((_, i) => i !== index));
    },
    add: () => {
      setDirty(true);
      setPersonnel((prev) => [...prev, { name: '', roles: [] }]);
    },
  };

  const submit = async () => {
    const data: AlbumDataJson = {
      album_title: fields.albumTitle.trim(),
      artist: fields.artist.trim(),
      recording_year: fields.recordingYear
        ? Number.parseInt(fields.recordingYear, 10)
        : undefined,
      recording_details: {
        period: fields.period,
        location: fields.location,
        exceptions: fields.exceptions,
      },
      release_info: {
        label: fields.label,
        catalog_number: fields.catalogNumber,
        country: fields.country,
        issue_year: fields.issueYear
          ? Number.parseInt(fields.issueYear, 10)
          : undefined,
        released: fields.released,
        format: fields.format,
        phonographic_copyright: fields.phonographicCopyright,
      },
      discogs: metadata.discogs,
      tracklist,
      personnel,
      production: {
        engineer: fields.engineer,
        producers: list(fields.producers),
        mastering: fields.mastering,
      },
      visuals: {
        photography: list(fields.photography),
        design: fields.design,
      },
      additional_info: fields.additionalInfo,
    };
    try {
      await update.mutateAsync({ slug, data });
      setDirty(false);
      onSaved?.();
    } catch (error) {
      console.error('Failed to save data.json:', error);
    }
  };

  return {
    fields,
    set,
    tracklist,
    tracks,
    personnel,
    people,
    dirty,
    submit,
    saving: update.isPending,
    error: update.isError ? getErrorMessage(update.error) : null,
  };
};
