import { Modal } from '@dendelion/mojo-ui';

type AddSongModalProps = {
  isOpen: boolean;
  onClose: () => void;
  albumId: number;
  nextTrackNumber: number;
};

// Songs can only be added via media folder sync, not through the UI
export const AddSongModal = ({
  isOpen,
  onClose,
}: AddSongModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Song to Album"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-gray-300">
          Songs can only be added to albums through the media folder sync
          process. Please use the sync functionality to add songs from your
          media directory.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
