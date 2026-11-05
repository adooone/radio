import { Split } from '@/features/admin/split';
import { useDigitizationDrafts } from '@/services/api';
import { Button } from '@dendelion/func-ui';
import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useMemo, useState } from 'react';
import { DraftRows, NewDraft, RadioFolder, StageChips } from './components';
import { STAGES, type StageKey, stageKeyOf } from './lib/stages';

type StudioShellProps = {
  children: ReactNode;
  activeSlug?: string;
};

/**
 * «Студія»: the stage chips and the open draft's work on the left, the
 * drafts and the radio folder on the slab; a new record is made on the slab
 * too, in place of the list.
 */
export const StudioShell = ({ children, activeSlug }: StudioShellProps) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const {
    data: drafts,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useDigitizationDrafts();

  const list = drafts ?? [];
  const active = list.find((draft) => draft.slug === activeSlug);
  const counts = useMemo(() => {
    const result = Object.fromEntries(
      STAGES.map((stage) => [stage.key, 0]),
    ) as Record<StageKey, number>;
    for (const draft of list) result[stageKeyOf(draft)] += 1;
    return result;
  }, [list]);

  return (
    <Split
      corner={
        <>
          <Button variant="lit" size="sm" onClick={() => setCreating(true)}>
            + Новий запис
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? 'Оновлення…' : 'Оновити'}
          </Button>
        </>
      }
      left={
        <>
          <div className="pb-5">
            <StageChips
              active={active ? stageKeyOf(active) : null}
              counts={active ? undefined : counts}
            />
          </div>
          <div className="work-scroll flex flex-col gap-6">{children}</div>
        </>
      }
      right={
        <div
          data-scroll-restoration-id="studio-drafts"
          className="slab-scroll flex flex-col gap-4"
        >
          {creating ? (
            <NewDraft
              onDone={(slug) => {
                setCreating(false);
                if (slug) navigate({ to: '/studio/$slug', params: { slug } });
              }}
            />
          ) : (
            <>
              <span className="type-label text-cream/60">Чернетки</span>
              {isError ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="type-body text-accent">
                    Не вдалося завантажити драфти.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isFetching}
                    onClick={() => refetch()}
                  >
                    Спробувати ще раз
                  </Button>
                </div>
              ) : (
                <DraftRows
                  drafts={list}
                  isLoading={isLoading}
                  activeSlug={activeSlug}
                  onSelect={(slug) =>
                    navigate({ to: '/studio/$slug', params: { slug } })
                  }
                />
              )}
            </>
          )}
          <div className="mt-auto pt-6">
            <RadioFolder drafts={list} />
          </div>
        </div>
      }
    />
  );
};
