import { Modal } from '@dendelion/func-ui';
import type { ReactNode } from 'react';

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
    <Modal open={isOpen} onClose={onClose} title={title} size="lg">
      {children}
    </Modal>
  );
};
