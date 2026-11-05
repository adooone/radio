import { useEffect, useState } from 'react';

/**
 * Both bleed past the column's boundary, under the slab, so the rim's swing
 * never uncovers the bare page between them.
 */
const BLEED = { width: 'calc(100% + 32px)', height: 'calc(100% + 32px)' };

type Layer = { url: string; shown: boolean };

type RoomBackdropProps = {
  /** A photo from the album's sessions, faded in over the room. */
  photo?: string;
  /** The room itself: each app ships its own under this path. */
  room?: string;
  /** Where the room's crop settles when the column is narrower than it. */
  roomPosition?: string;
};

/**
 * Fetches and decodes a photo off screen, so it can appear whole at once;
 * rejects when it cannot be shown.
 */
export const loadPhoto = async (url: string): Promise<void> => {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
};

/**
 * The room behind the work — the player's radio, the admin's desk. The
 * room photograph is always there; when the song on air brings a photo
 * from its album's sessions, that photo is loaded out of sight and only
 * then faded in over the room. The next photo fades in over the last one,
 * which is let go once it is covered; with no photo, or one that will not
 * load, the photos fade back off the room. The app lays its `.room-shade`
 * over this.
 */
export const RoomBackdrop = ({
  photo,
  room = '/brand/room.jpg',
  roomPosition = '62% 50%',
}: RoomBackdropProps) => {
  const [layers, setLayers] = useState<Layer[]>([]);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const fadeAll = () =>
      setLayers((current) =>
        current.map((layer) => ({ ...layer, shown: false })),
      );

    if (!photo) {
      fadeAll();
      return;
    }
    loadPhoto(photo).then(
      () => {
        if (cancelled) return;
        // Mounted clear first, then shown on a later frame, so the opacity
        // has a change to transition through.
        setLayers((current) => [
          ...current.filter((layer) => layer.url !== photo),
          { url: photo, shown: false },
        ]);
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() =>
            setLayers((current) =>
              current.map((layer) =>
                layer.url === photo ? { ...layer, shown: true } : layer,
              ),
            ),
          );
        });
      },
      () => {
        if (!cancelled) fadeAll();
      },
    );
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [photo]);

  // A photo that finished fading in covers everything under it; one that
  // finished fading out is gone.
  const settle = (url: string) =>
    setLayers((current) => {
      const index = current.findIndex((layer) => layer.url === url);
      if (index < 0) return current;
      return current[index].shown
        ? current.slice(index)
        : current.filter((layer) => layer.url !== url);
    });

  return (
    <>
      <img
        alt=""
        src={room}
        className="absolute top-0 left-0 max-w-none object-cover"
        style={{ objectPosition: roomPosition, ...BLEED }}
      />
      {layers.map((layer) => (
        <img
          key={layer.url}
          alt=""
          src={layer.url}
          data-shown={layer.shown}
          onTransitionEnd={() => settle(layer.url)}
          className="room-photo absolute top-0 left-0 max-w-none object-cover"
          style={BLEED}
        />
      ))}
    </>
  );
};
