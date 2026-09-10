import { useState } from 'react';
import { Modal, Input, Textarea, Checkbox } from '@dendelion/mojo-ui';
import { useCreateAlbum } from '@/services/api';
import { albumApi } from '@/services/api/album-api';
import { TagEditor } from '../../shared';

type CreateAlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (albumId: number) => void;
};

export const CreateAlbumModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateAlbumModalProps) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const createAlbum = useCreateAlbum();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    try {
      const result = await createAlbum.mutateAsync({
        title: title.trim(),
        artist: artist.trim(),
        year: year ? Number.parseInt(year) : undefined,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? JSON.stringify(tags) : undefined,
        isPublic,
      });

      if (coverFile) {
        await albumApi.uploadCoverArt(result.id, coverFile);
      }

      setTitle('');
      setArtist('');
      setYear('');
      setDescription('');
      setTags([]);
      setIsPublic(false);
      setCoverImage(null);
      setCoverFile(null);

      onSuccess?.(result.id);
      onClose();
    } catch (error) {
      console.error('Failed to create album:', error);
      alert('Failed to create album');
    }
  };

  const handleClose = () => {
    setTitle('');
    setArtist('');
    setYear('');
    setDescription('');
    setTags([]);
    setIsPublic(false);
    setCoverImage(null);
    setCoverFile(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Album"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <label
              htmlFor="cover-image-upload"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Cover Image
            </label>
            <div className="w-48 h-48 rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 transition-colors overflow-hidden bg-gray-800/50">
              {coverImage ? (
                <div className="relative w-full h-full group">
                  <img
                    src={coverImage}
                    alt="Album cover"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    aria-label="Remove cover image"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <title>Remove image</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="cover-image-upload"
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-gray-300"
                >
                  <svg
                    className="w-12 h-12 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Upload image icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Upload Image</span>
                  <input
                    id="cover-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
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

            <Input
              label="Year"
              type="number"
              value={year}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
              placeholder="1900-2100"
              min="1900"
              max="2100"
            />
          </div>
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

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !artist.trim() || createAlbum.isPending}
            className="flex-1 px-4 py-2 rounded-lg bg-sun text-gray-900 hover:bg-sun/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {createAlbum.isPending ? 'Creating...' : 'Create Album'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
