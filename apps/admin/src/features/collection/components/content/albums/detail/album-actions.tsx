import { Button } from '@dendelion/mojo-ui';

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
      <Button
        variant="yellow"
        size="small"
        title="Edit"
        rounded="half"
        onClick={onEdit}
      />
      <Button
        variant="red"
        size="small"
        title={isDeleting ? 'Deleting...' : 'Delete'}
        rounded="half"
        onClick={onDelete}
        disabled={isDeleting}
      />
    </div>
  );
};
