import { useState } from 'react';
import clsx from 'clsx';
import { Modal, Input, Textarea, Checkbox } from '@dendelion/mojo-ui';
import { useCreateCollection } from '@/services/api';
import { sharedStyles } from '@/styles/shared-styles';

type CreateCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateCollectionModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateCollectionModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const createCollection = useCreateCollection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createCollection.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });

      setName('');
      setDescription('');
      setIsPublic(false);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Collection"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Collection Name *"
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Enter collection name"
          required
        />

        <Textarea
          id="description"
          label="Description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional description"
        />

        <Checkbox
          id="isPublic"
          label="Make this collection public"
          checked={isPublic}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublic(e.target.checked)}
        />

        <div className="flex gap-3 pt-4 justify-center">
          <button
            type="button"
            onClick={handleClose}
            className={clsx(sharedStyles.buttonSecondary)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || createCollection.isPending}
            className={clsx(sharedStyles.buttonPrimary)}
          >
            {createCollection.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
