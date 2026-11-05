import { RoomBackdrop } from '@radio/stage';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const PHOTO = 'https://media.example.com/a/img/session/one.webp';
const NEXT = 'https://media.example.com/a/img/session/two.webp';

/** jsdom never loads images: decide here whether a photo "loads". */
const decodes = (ok: boolean) =>
  vi
    .spyOn(HTMLImageElement.prototype, 'decode')
    .mockImplementation(() =>
      ok ? Promise.resolve() : Promise.reject(new Error('broken')),
    );

const photoLayers = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLImageElement>('img.room-photo'));

describe('RoomBackdrop', () => {
  // jsdom has no decode at all; give the prototype one to spy on.
  HTMLImageElement.prototype.decode ??= () => Promise.resolve();

  afterEach(() => vi.restoreAllMocks());

  it('shows only the room when the song brings no photo', () => {
    const { container } = render(<RoomBackdrop />);
    expect(container.querySelector('img[src="/brand/room.jpg"]')).toBeTruthy();
    expect(photoLayers(container)).toHaveLength(0);
  });

  it('shows a photo only once it has loaded, then fades it in', async () => {
    decodes(true);
    const { container } = render(<RoomBackdrop photo={PHOTO} />);
    await waitFor(() => {
      const [layer] = photoLayers(container);
      expect(layer?.getAttribute('src')).toBe(PHOTO);
      expect(layer?.dataset.shown).toBe('true');
    });
  });

  it('keeps the room when the photo will not load', async () => {
    const decode = decodes(false);
    const { container } = render(<RoomBackdrop photo={PHOTO} />);
    await waitFor(() => expect(decode).toHaveBeenCalled());
    await Promise.resolve();
    expect(photoLayers(container)).toHaveLength(0);
  });

  it('fades the next photo in over the last and lets the last go', async () => {
    decodes(true);
    const { container, rerender } = render(<RoomBackdrop photo={PHOTO} />);
    await waitFor(() =>
      expect(photoLayers(container)[0]?.dataset.shown).toBe('true'),
    );
    rerender(<RoomBackdrop photo={NEXT} />);
    await waitFor(() => {
      const layers = photoLayers(container);
      expect(layers.map((l) => l.getAttribute('src'))).toEqual([PHOTO, NEXT]);
      expect(layers[1].dataset.shown).toBe('true');
    });
    fireEvent.transitionEnd(photoLayers(container)[1]);
    expect(photoLayers(container).map((l) => l.getAttribute('src'))).toEqual([
      NEXT,
    ]);
  });

  it('fades back to the room when the next song has no photo', async () => {
    decodes(true);
    const { container, rerender } = render(<RoomBackdrop photo={PHOTO} />);
    await waitFor(() =>
      expect(photoLayers(container)[0]?.dataset.shown).toBe('true'),
    );
    rerender(<RoomBackdrop />);
    const [layer] = photoLayers(container);
    expect(layer.dataset.shown).toBe('false');
    fireEvent.transitionEnd(layer);
    expect(photoLayers(container)).toHaveLength(0);
  });
});
