import { useState, useEffect } from 'react';
import { useUpdateAlbum } from '@/services/api';
import {
  Input,
  Textarea,
  Checkbox,
  Select,
  Button,
} from '@dendelion/mojo-ui';
import { TagEditor } from '@/features/collection/components/shared';
import type { Album } from '@radio/types';

const RPM_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: '33', label: '33 RPM' },
  { value: '45', label: '45 RPM' },
  { value: '78', label: '78 RPM' },
];

const CONDITION_OPTIONS = [
  { value: '', label: 'Not specified' },
  { value: 'mint', label: 'Mint (M)' },
  { value: 'near-mint', label: 'Near Mint (NM)' },
  { value: 'very-good-plus', label: 'Very Good Plus (VG+)' },
  { value: 'very-good', label: 'Very Good (VG)' },
  { value: 'good', label: 'Good (G)' },
  { value: 'fair', label: 'Fair (F)' },
  { value: 'poor', label: 'Poor (P)' },
];

type AlbumEditFormProps = {
  album: Album;
  onCancel: () => void;
  onSuccess?: () => void;
};

export const AlbumEditForm = ({
  album,
  onCancel,
  onSuccess,
}: AlbumEditFormProps) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  // Vinyl metadata
  const [releaseYear, setReleaseYear] = useState('');
  const [rpmSpeed, setRpmSpeed] = useState('');
  const [vinylCondition, setVinylCondition] = useState('');
  const [digitizationDate, setDigitizationDate] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');

  const updateAlbum = useUpdateAlbum();

  useEffect(() => {
    if (album) {
      setTitle(album.title);
      setArtist(album.artist);
      setYear(album.year ? album.year.toString() : '');
      setDescription(album.description || '');
      setTags(album.tags ? JSON.parse(album.tags) : []);
      setIsPublic(!!album.isPublic);

      // Vinyl metadata
      setReleaseYear(album.releaseYear ? album.releaseYear.toString() : '');
      setRpmSpeed(album.rpmSpeed || '');
      setVinylCondition(album.vinylCondition || '');
      setDigitizationDate(
        album.digitizationDate ? album.digitizationDate.substring(0, 10) : '',
      );
      setEquipmentUsed(album.equipmentUsed || '');
    }
  }, [album]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    try {
      await updateAlbum.mutateAsync({
        id: album.id,
        data: {
          title: title.trim(),
          artist: artist.trim(),
          year: year ? Number.parseInt(year) : undefined,
          description: description.trim() || undefined,
          tags: tags.length > 0 ? JSON.stringify(tags) : undefined,
          isPublic,
          releaseYear: releaseYear ? Number.parseInt(releaseYear) : undefined,
          rpmSpeed: rpmSpeed || undefined,
          vinylCondition: vinylCondition || undefined,
          digitizationDate: digitizationDate || undefined,
          equipmentUsed: equipmentUsed.trim() || undefined,
        },
      });

      onSuccess?.();
    } catch (error) {
      console.error('Failed to update album:', error);
      alert('Failed to update album');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Album Title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
          placeholder="Enter album title"
        />

        <Input
          label="Artist"
          value={artist}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setArtist(e.target.value)}
          required
          placeholder="Enter artist name"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Year"
          type="number"
          value={year}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
          placeholder="1900-2100"
          min="1900"
          max="2100"
        />

        <Input
          label="Release Year"
          type="number"
          value={releaseYear}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReleaseYear(e.target.value)}
          placeholder="e.g. 1975"
          min="1900"
          max="2100"
        />
      </div>

      <Textarea
        label="Description"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        placeholder="Enter album description"
        rows={3}
      />

      <TagEditor tags={tags} onTagsChange={setTags} />

      <Checkbox
        label="Make this album public"
        checked={isPublic}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublic(e.target.checked)}
      />

      {/* Vinyl Metadata Section */}
      <div className="border-t border-gray-700/50 pt-4 mt-4">
        <h4 className="text-sm font-display font-semibold text-stone-400 uppercase tracking-wide mb-3">
          Vinyl Metadata
        </h4>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="RPM Speed"
              value={rpmSpeed}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRpmSpeed(e.target.value)}
              options={RPM_OPTIONS}
            />

            <Select
              label="Vinyl Condition"
              value={vinylCondition}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVinylCondition(e.target.value)}
              options={CONDITION_OPTIONS}
            />
          </div>

          <Input
            label="Digitization Date"
            type="date"
            value={digitizationDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDigitizationDate(e.target.value)}
          />

          <Textarea
            label="Equipment Used"
            value={equipmentUsed}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEquipmentUsed(e.target.value)}
            placeholder="e.g. Technics SL-1200, Audient iD4, Audacity"
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="gray"
          size="medium"
          title="Cancel"
          onClick={onCancel}
          className="flex-1"
        />
        <button
          type="submit"
          disabled={!title.trim() || !artist.trim() || updateAlbum.isPending}
          className="flex-1 px-4 py-2 rounded-lg bg-sun text-gray-900 hover:bg-sun/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {updateAlbum.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
