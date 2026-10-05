import { AddSongModal } from '@/features/collection/components/modals/albums';
import { useAlbum, useDeleteAlbum } from '@/services/api';
import type { Album } from '@radio/types';
import { useState } from 'react';
import { AlbumSongsSection } from '../songs';
import { AlbumActions } from './album-actions';
import { AlbumCover } from './album-cover';
import { AlbumCoverUpload } from './album-cover-upload';
import { AlbumDetailLoading } from './album-detail-loading';
import { AlbumEditForm } from './album-edit-form';
import { AlbumMetadata } from './album-metadata';
import { AlbumPhotosSection } from './album-photos-section';

type AlbumDetailProps = {
  album: Album;
};

export const AlbumDetail = ({ album }: AlbumDetailProps) => {
  const { data: albumWithSongs, isLoading } = useAlbum(album.id);
  const deleteAlbum = useDeleteAlbum();
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Delete album "${album.title}"? This will also delete all songs.`,
      )
    ) {
      return;
    }

    try {
      await deleteAlbum.mutateAsync(album.id);
    } catch (error) {
      console.error('Failed to delete album:', error);
      alert('Failed to delete album');
    }
  };

  if (isLoading) {
    return <AlbumDetailLoading />;
  }

  if (!albumWithSongs) {
    return <div className="text-gray-500">Album not found</div>;
  }

  const tags = albumWithSongs.tags ? JSON.parse(albumWithSongs.tags) : [];

  return (
    <div className="space-y-6">
      {isEditing ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-200 mb-4">
            Edit Album
          </h3>
          <AlbumEditForm
            album={albumWithSongs}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <>
          <div className="flex gap-6">
            <AlbumCover
              coverUrl={albumWithSongs.coverImageUrl || null}
              albumTitle={albumWithSongs.title}
              onUploadClick={() => setShowCoverUpload(!showCoverUpload)}
            />

            <div>
              <AlbumMetadata
                title={albumWithSongs.title}
                artist={albumWithSongs.artist}
                year={albumWithSongs.year}
                releaseYear={albumWithSongs.releaseYear}
                description={albumWithSongs.description}
                tags={tags}
                songCount={albumWithSongs.songs?.length || 0}
                createdAt={albumWithSongs.createdAt}
                recordingDetails={albumWithSongs.recordingDetails}
                releaseInfo={albumWithSongs.releaseInfo}
                personnel={albumWithSongs.personnel}
                production={albumWithSongs.production}
                visuals={albumWithSongs.visuals}
                additionalInfo={albumWithSongs.additionalInfo}
              />

              <AlbumActions
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
                isDeleting={deleteAlbum.isPending}
              />
            </div>
          </div>

          {showCoverUpload && (
            <AlbumCoverUpload
              albumId={albumWithSongs.id}
              onSuccess={() => setShowCoverUpload(false)}
            />
          )}
        </>
      )}

      {!isEditing && (
        <>
          <AlbumPhotosSection
            albumId={albumWithSongs.id}
            folderSlug={albumWithSongs.folderSlug}
          />
          <AlbumSongsSection
            albumId={albumWithSongs.id}
            songs={albumWithSongs.songs}
            onAddSong={() => setShowAddSong(true)}
          />
        </>
      )}

      <AddSongModal
        isOpen={showAddSong}
        onClose={() => setShowAddSong(false)}
        albumId={albumWithSongs.id}
        nextTrackNumber={(albumWithSongs.songs?.length || 0) + 1}
      />
    </div>
  );
};
