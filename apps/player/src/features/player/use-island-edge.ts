import { type RefObject, useLayoutEffect } from 'react';

/**
 * Lines an absolutely placed element up with the control island's left
 * edge, the same edge the sleeve starts at (the vinyl box is centred on the
 * island and as wide as it). The island is sized by its content and centred
 * in its dock, so the edge is measured, not derived. Portrait puts the
 * element back in the flow, where the inline `left` has no effect.
 */
export const useIslandEdge = (ref: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.offsetParent;
    const island = el
      ?.closest('main')
      ?.querySelector<HTMLElement>('.island-dock .control-island');
    if (!el || !(parent instanceof HTMLElement) || !island) return;

    const place = () => {
      const edge =
        island.getBoundingClientRect().left -
        parent.getBoundingClientRect().left;
      el.style.left = `${Math.round(edge)}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(island);
    observer.observe(parent);
    return () => {
      observer.disconnect();
      el.style.left = '';
    };
  }, [ref]);
};
