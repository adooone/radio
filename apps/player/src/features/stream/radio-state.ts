/** Where the air stands: still tuning, talking, or quiet. */
export type RadioStatus = 'loading' | 'live' | 'offline';

export type RadioEvent =
  /** The playlist parsed: somebody is publishing. */
  | 'manifest'
  /** The stream broke or the manifest 404ed: nobody is. */
  | 'fatal'
  /** A timer asks the engine to try the manifest again. */
  | 'retry';

export const nextStatus = (
  status: RadioStatus,
  event: RadioEvent,
): RadioStatus => {
  switch (event) {
    case 'manifest':
      return 'live';
    case 'fatal':
      return 'offline';
    case 'retry':
      return status === 'offline' ? 'loading' : status;
  }
};

/** The line under the sign, in the air's own words. */
export const statusLine = (status: RadioStatus, playing: boolean): string => {
  if (status === 'loading') return 'ловимо хвилю…';
  if (status === 'offline') return 'ефір тихий — платівка відпочиває';
  return playing ? 'в ефірі' : 'в ефірі — натисни платівку';
};
