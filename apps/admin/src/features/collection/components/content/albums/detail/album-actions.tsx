import { LampButton } from '@dendelion/func-ui';

type AlbumActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

export const AlbumActions = ({
  onEdit,
  onDelete,
  isDeleting,
}: AlbumActionsProps) => {
  return (
    <div className="flex gap-2 mt-4">
      <LampButton tone="yellow" size="sm" rounded="half" onClick={onEdit}>
        Edit
      </LampButton>
      <LampButton
        tone="red"
        size="sm"
        rounded="half"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </LampButton>
    </div>
  );
};
