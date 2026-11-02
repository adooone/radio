import { useUpdateAlbum } from '@/services/api';
import type { Album } from '@radio/types';
import { useEffect, useState } from 'react';

export const RPM_OPTIONS = [
  { value: '', label: 'не вказано' },
  { value: '33', label: '33 об/хв' },
  { value: '45', label: '45 об/хв' },
  { value: '78', label: '78 об/хв' },
];

export const CONDITION_OPTIONS = [
  { value: '', label: 'не вказано' },
  { value: 'mint', label: 'Mint (M)' },
  { value: 'near-mint', label: 'Near Mint (NM)' },
  { value: 'very-good-plus', label: 'Very Good Plus (VG+)' },
  { value: 'very-good', label: 'Very Good (VG)' },
  { value: 'good', label: 'Good (G)' },
  { value: 'fair', label: 'Fair (F)' },
  { value: 'poor', label: 'Poor (P)' },
];

export type AlbumFormFields = {
  title: string;
  artist: string;
  year: string;
  releaseYear: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  rpmSpeed: string;
  vinylCondition: string;
  digitizationDate: string;
  equipmentUsed: string;
};

const fieldsOf = (album: Album): AlbumFormFields => ({
  title: album.title,
  artist: album.artist,
  year: album.year ? String(album.year) : '',
  releaseYear: album.releaseYear ? String(album.releaseYear) : '',
  description: album.description ?? '',
  tags: album.tags ? JSON.parse(album.tags) : [],
  isPublic: Boolean(album.isPublic),
  rpmSpeed: album.rpmSpeed ?? '',
  vinylCondition: album.vinylCondition ?? '',
  digitizationDate: album.digitizationDate
    ? album.digitizationDate.substring(0, 10)
    : '',
  equipmentUsed: album.equipmentUsed ?? '',
});

/**
 * The album's editable fields as strings, filled from the album and sent
 * back as the API's shape: numbers parsed, blanks dropped, tags stored as
 * a JSON string the way wave keeps them.
 */
export const useAlbumForm = (album: Album, onSaved?: () => void) => {
  const [fields, setFields] = useState<AlbumFormFields>(() =>
    fieldsOf(album),
  );
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateAlbum();

  useEffect(() => {
    setFields(fieldsOf(album));
  }, [album]);

  const set = <K extends keyof AlbumFormFields>(
    key: K,
    value: AlbumFormFields[K],
  ) => setFields((prev) => ({ ...prev, [key]: value }));

  const valid = fields.title.trim() !== '' && fields.artist.trim() !== '';

  const submit = async () => {
    if (!valid) return;
    setError(null);
    try {
      await update.mutateAsync({
        id: album.id,
        data: {
          title: fields.title.trim(),
          artist: fields.artist.trim(),
          year: fields.year ? Number.parseInt(fields.year, 10) : undefined,
          description: fields.description.trim() || undefined,
          tags: fields.tags.length > 0 ? JSON.stringify(fields.tags) : undefined,
          isPublic: fields.isPublic,
          releaseYear: fields.releaseYear
            ? Number.parseInt(fields.releaseYear, 10)
            : undefined,
          rpmSpeed: fields.rpmSpeed || undefined,
          vinylCondition: fields.vinylCondition || undefined,
          digitizationDate: fields.digitizationDate || undefined,
          equipmentUsed: fields.equipmentUsed.trim() || undefined,
        },
      });
      onSaved?.();
    } catch (err) {
      console.error('Failed to update album:', err);
      setError('Не вдалося зберегти альбом.');
    }
  };

  return { fields, set, valid, submit, saving: update.isPending, error };
};
