import { useUsers } from '@/services/api/hooks/use-user-management';
import { Button } from '@dendelion/func-ui';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NewPerson, PeopleRows, type Person } from './components';

const plural = (n: number, [one, few, many]: [string, string, string]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} ${one}`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `${n} ${few}`;
  return `${n} ${many}`;
};

const exportPeople = (people: Person[]) => {
  const blob = new Blob([JSON.stringify(people, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'users.json';
  link.click();
  URL.revokeObjectURL(url);
};

type PeopleSheetProps = {
  selfId?: number;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

/**
 * The station's people, on a sheet over the dimmed page — the one overlay
 * in the admin, as the board draws it: the count line, the rows, and the
 * three things to do: make an account (in place of the list), export,
 * sign out. Escape or the dim closes it.
 */
export const PeopleSheet = ({
  selfId,
  onClose,
  onLogout,
  isLoggingOut,
}: PeopleSheetProps) => {
  const { data, isLoading, isError } = useUsers();
  const people: Person[] = data ?? [];
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const active = people.filter((p) => p.isActive).length;
  const admins = people.filter((p) => p.role === 'admin').length;

  return createPortal(
    <div className="fixed inset-0 z-[45]">
      <button
        type="button"
        aria-label="Закрити панель людей"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[rgba(5,3,2,0.55)]"
      />
      <section
        aria-label="Люди"
        className="control-island absolute top-24 left-1/2 flex max-h-[calc(100vh-9rem)] w-[640px] max-w-[calc(100vw-3rem)] -translate-x-1/2 flex-col gap-6 overflow-y-auto rounded-[28px] border border-cream/[0.12] p-9 [scrollbar-width:thin]"
      >
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[28px] font-extrabold text-cream">
            Люди
          </h1>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-cream/[0.16] text-cream/70 transition-colors hover:text-cream"
          >
            ✕
          </button>
        </div>

        {data && (
          <p className="type-label tabular-nums text-cream/60">
            {plural(people.length, ['обліковий', 'облікові', 'облікових'])} ·{' '}
            {plural(active, ['активний', 'активні', 'активних'])} ·{' '}
            {plural(admins, ['адмін', 'адміни', 'адмінів'])}
          </p>
        )}

        {creating ? (
          <NewPerson onDone={() => setCreating(false)} />
        ) : isLoading ? (
          <p className="type-body text-cream/45">Завантаження…</p>
        ) : isError ? (
          <p className="type-body text-accent">
            Не вдалося завантажити список облікових.
          </p>
        ) : (
          <PeopleRows people={people} selfId={selfId} />
        )}

        {!creating && (
          <div className="flex items-center gap-2.5">
            <Button variant="lit" size="sm" onClick={() => setCreating(true)}>
              + Створити обліковку
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={people.length === 0}
              onClick={() => exportPeople(people)}
            >
              Експорт
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="ml-auto"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              {isLoggingOut ? 'Вихід…' : 'Вийти'}
            </Button>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
};
