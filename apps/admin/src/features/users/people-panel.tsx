import { useUsers } from '@/services/api/hooks/use-user-management';
import { LampButton } from '@dendelion/func-ui';
import { useState } from 'react';
import { CreateUserModal, UserList } from './components';

type PeoplePanelProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
};

const exportUsers = (users: unknown[]) => {
  const blob = new Blob([JSON.stringify(users, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'users.json';
  link.click();
  URL.revokeObjectURL(url);
};

export const PeoplePanel = ({ onLogout, isLoggingOut }: PeoplePanelProps) => {
  const { data: users } = useUsers();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="flex max-h-[70vh] w-[26rem] max-w-[90vw] flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="flex-1 font-serif text-xl text-cream">Люди</h2>
        <LampButton
          tone="dark"
          size="sm"
          onClick={() => setShowCreateModal(true)}
        >
          Створити
        </LampButton>
        <LampButton
          tone="gray"
          size="sm"
          disabled={!users?.length}
          onClick={() => exportUsers(users ?? [])}
        >
          Експорт
        </LampButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]">
        <UserList users={users ?? []} />
      </div>

      <LampButton
        tone="red"
        size="sm"
        disabled={isLoggingOut}
        onClick={onLogout}
        className="text-ink"
      >
        {isLoggingOut ? 'Вихід...' : 'Вийти'}
      </LampButton>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
