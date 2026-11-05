import { Slab } from '@radio/stage';
import type { ReactNode } from 'react';
import { WorkRoom } from './components/work-room';

type SplitProps = {
  /** The work, two thirds wide, under the corner sign. */
  left: ReactNode;
  /** The feed or the detail, on the slab behind the rim. */
  right: ReactNode;
  /** A page's own controls in the top-right corner, level with the sign. */
  corner?: ReactNode;
};

/**
 * The player's split, for a page: the work column in the room with the
 * gutters, and the slab column flush to the screen's edge — the record's
 * rim swinging over the seam between them, drawn by `Slab`. Pages put a
 * `work-scroll` / `slab-scroll` around whatever should scroll; it is
 * stacked over the room photograph and its shade.
 */
export const Split = ({ left, right, corner }: SplitProps) => (
  <>
    <section className="work-view">
      <WorkRoom />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{left}</div>
    </section>
    <aside className="slab-view">
      <Slab />
      <div className="slab-panel">{right}</div>
    </aside>
    {corner && <div className="corner-actions">{corner}</div>}
  </>
);
