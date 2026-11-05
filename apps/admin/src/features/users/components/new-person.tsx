import { useCreateUser } from '@/services/api/hooks/use-user-management';
import { Button } from '@dendelion/func-ui';
import { Input, Select } from '@dendelion/func-ui';
import { useState } from 'react';

/** A new account, made on the sheet in place of the list. */
export const NewPerson = ({ onDone }: { onDone: () => void }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState<string | null>(null);
  const createUser = useCreateUser();

  const valid = username.trim() && email.trim() && password.trim();

  const submit = async () => {
    if (!valid) return;
    setError(null);
    try {
      await createUser.mutateAsync({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
      onDone();
    } catch (err) {
      console.error('Failed to create user:', err);
      setError('Не вдалося створити обліковку.');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-4"
    >
      <span className="type-label text-cream/60">Нова обліковка</span>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Імʼя користувача"
          id="person-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          required
        />
        <Input
          label="Пошта"
          id="person-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          required
        />
        <Input
          label="Пароль"
          id="person-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Select
          label="Роль"
          id="person-role"
          value={role}
          onChange={setRole}
          options={[
            { value: 'user', label: 'Редактор' },
            { value: 'admin', label: 'Адмін' },
          ]}
        />
      </div>
      {error && <p className="font-sans text-xs text-accent">{error}</p>}
      <div className="flex gap-2.5">
        <Button
          type="submit"
          variant="lit"
          size="sm"
          disabled={!valid || createUser.isPending}
        >
          {createUser.isPending ? 'Створення…' : 'Створити'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={createUser.isPending}
          onClick={onDone}
        >
          Скасувати
        </Button>
      </div>
    </form>
  );
};
