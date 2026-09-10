import type { ReactNode } from 'react';
import { Modal } from '@dendelion/mojo-ui';

type DetailModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  isOpen: boolean;
};

export const DetailModal = ({
  title,
  onClose,
  children,
  isOpen,
}: DetailModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-4xl">
      {children}
    </Modal>
  );
};
