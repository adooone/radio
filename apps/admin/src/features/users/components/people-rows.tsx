import {
  useDeleteUser,
  useUpdateUser,
} from '@/services/api/hooks/use-user-management';
import { Stamp, StatusDot } from '@dendelion/func-ui';
import clsx from 'clsx';
import { useState } from 'react';

export type Person = {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const lastSeen = (person: Person) => {
  if (!person.isActive) return 'деактивований';
  if (!person.lastLoginAt) return 'ще не входив';
  const date = new Date(person.lastLoginAt);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'сьогодні';
  if (days === 1) return 'вчора';
  if (days < 7) return `${days} дн. тому`;
  return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
};

/** The station's people as rows: who, when last, their role, their light. */
export const PeopleRows = ({
  people,
  selfId,
}: {
  people: Person[];
  selfId?: number;
}) => {
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (
    id: number,
    action: () => Promise<unknown>,
    failure: string,
  ) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
    } catch (err) {
      console.error(failure, err);
      setError(failure);
    } finally {
      setBusyId(null);
    }
  };

  const toggleRole = (person: Person) =>
    run(
      person.id,
      () =>
        updateUser.mutateAsync({
          id: person.id,
          data: { role: person.role === 'admin' ? 'user' : 'admin' },
        }),
      'Не вдалося змінити роль.',
    );
  const toggleActive = (person: Person) =>
    run(
      person.id,
      () =>
        updateUser.mutateAsync({
          id: person.id,
          data: { isActive: !person.isActive },
        }),
      'Не вдалося змінити стан.',
    );
  const remove = (person: Person) => {
    if (!confirm(`Видалити обліковку «${person.username}»?`)) return;
    run(
      person.id,
      () => deleteUser.mutateAsync(person.id),
      'Не вдалося видалити.',
    );
  };

  if (people.length === 0) {
    return <p className="type-body text-cream/45">Облікових записів немає.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {people.map((person) => {
        const admin = person.role === 'admin';
        const self = person.id === selfId;
        return (
          <div
            key={person.id}
            className={clsx(
              'flex items-center gap-3.5 rounded-2xl border border-cream/[0.08] px-4 py-3',
              !person.isActive && 'opacity-65',
              busyId === person.id && 'opacity-50',
            )}
          >
            <span
              className={clsx(
                'flex size-9 shrink-0 items-center justify-center rounded-full border font-sans text-sm font-semibold',
                admin
                  ? 'border-lamp/50 bg-lamp/[0.14] text-glow'
                  : 'border-cream/20 text-cream/80',
              )}
            >
              {person.username.charAt(0).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-serif text-base font-semibold text-cream">
                {person.username}
                {self && (
                  <span className="type-meta ml-2 text-cream/45">це ви</span>
                )}
              </span>
              <span className="truncate font-sans text-[11px] text-cream/60">
                {lastSeen(person)} · {person.email}
              </span>
            </span>
            <button
              type="button"
              onClick={() => toggleRole(person)}
              disabled={busyId === person.id || self}
              title={admin ? 'Зробити користувачем' : 'Зробити адміном'}
              className="cursor-pointer disabled:cursor-default"
            >
              <Stamp variant={admin ? 'warning' : 'neutral'}>
                {admin ? 'Адмін' : 'Редактор'}
              </Stamp>
            </button>
            <button
              type="button"
              onClick={() => toggleActive(person)}
              disabled={busyId === person.id || self}
              aria-label={person.isActive ? 'Деактивувати' : 'Активувати'}
              title={person.isActive ? 'Деактивувати' : 'Активувати'}
              className="cursor-pointer p-1 disabled:cursor-default"
            >
              <StatusDot variant={person.isActive ? 'warning' : 'neutral'} />
            </button>
            <button
              type="button"
              onClick={() => remove(person)}
              disabled={busyId === person.id || self}
              aria-label="Видалити обліковку"
              className="shrink-0 px-1 text-cream/45 transition-colors hover:text-accent disabled:opacity-30"
            >
              ✕
            </button>
          </div>
        );
      })}
      {error && <p className="font-sans text-xs text-accent">{error}</p>}
    </div>
  );
};
