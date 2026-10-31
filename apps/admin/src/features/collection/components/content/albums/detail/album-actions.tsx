import { useOnAir, useSetOnAir } from '@/services/api';
import { LampButton, LampStatus } from '@dendelion/func-ui';

type AlbumActionsProps = {
  albumId: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
};

export const AlbumActions = ({
  albumId,
  onEdit,
  onDelete,
  isDeleting,
}: AlbumActionsProps) => {
  const { data: onAir } = useOnAir();
  const setOnAir = useSetOnAir();

  const isOnAir = onAir?.albumId === albumId && onAir.songId === undefined;

  return (
    <div className="flex items-center gap-2 mt-4">
      <LampButton tone="yellow" size="sm" rounded="half" onClick={onEdit}>
        Edit
      </LampButton>
      {isOnAir ? (
        <LampStatus status="running" label="В ефірі" />
      ) : (
        <LampButton
          tone="green"
          size="sm"
          rounded="half"
          onClick={() => setOnAir.mutate({ albumId })}
          disabled={setOnAir.isPending}
        >
          Поставити в ефір
        </LampButton>
      )}
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
