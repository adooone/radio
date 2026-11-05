import { Field, Pill, SelectInput, TextInput } from '@/features/admin/ui';
import { useCreateUser } from '@/services/api/hooks/use-user-management';
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
        <Field label="Імʼя користувача" htmlFor="person-username">
          <TextInput
            id="person-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            required
          />
        </Field>
        <Field label="Пошта" htmlFor="person-email">
          <TextInput
            id="person-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />
        </Field>
        <Field label="Пароль" htmlFor="person-password">
          <TextInput
            id="person-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </Field>
        <Field label="Роль" htmlFor="person-role">
          <SelectInput
            id="person-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Редактор</option>
            <option value="admin">Адмін</option>
          </SelectInput>
        </Field>
      </div>
      {error && <p className="font-sans text-xs text-accent">{error}</p>}
      <div className="flex gap-2.5">
        <Pill
          type="submit"
          tone="lit"
          size="sm"
          disabled={!valid || createUser.isPending}
        >
          {createUser.isPending ? 'Створення…' : 'Створити'}
        </Pill>
        <Pill
          tone="ghost"
          size="sm"
          disabled={createUser.isPending}
          onClick={onDone}
        >
          Скасувати
        </Pill>
      </div>
    </form>
  );
};
