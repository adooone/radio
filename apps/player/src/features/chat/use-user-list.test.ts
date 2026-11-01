import { describe, expect, it } from 'vitest';
import {
  applyColorUpdateMessage,
  applyListenersMessage,
} from './use-user-list';

describe('applyListenersMessage', () => {
  it('ignores messages that are not a listeners broadcast', () => {
    expect(applyListenersMessage({ type: 'chat' })).toBeNull();
    expect(applyListenersMessage(null)).toBeNull();
    expect(applyListenersMessage({ type: 'listeners' })).toBeNull();
  });

  it('carries each user, colour included', () => {
    const users = [
      {
        nickname: 'Ada',
        lastSeen: '2026-11-01T00:00:00.000Z',
        color: '#ff8a5c',
      },
      { nickname: 'Grace', lastSeen: '2026-11-01T00:00:00.000Z', color: null },
    ];
    expect(
      applyListenersMessage({ type: 'listeners', listeners: 2, users }),
    ).toEqual(users);
  });

  it('pads quiet seats as Anonymous when the count outruns the roster', () => {
    const result = applyListenersMessage({
      type: 'listeners',
      listeners: 2,
      users: [
        { nickname: 'Ada', lastSeen: '2026-11-01T00:00:00.000Z', color: null },
      ],
    });
    expect(result).toHaveLength(2);
    expect(result?.[1].nickname).toBe('Anonymous');
    expect(result?.[1].color).toBeNull();
  });
});

describe('applyColorUpdateMessage', () => {
  const roster = [
    { nickname: 'Ada', lastSeen: '2026-11-01T00:00:00.000Z', color: null },
    {
      nickname: 'Grace',
      lastSeen: '2026-11-01T00:00:00.000Z',
      color: '#ff8a5c',
    },
  ];

  it('ignores messages that are not a colour update', () => {
    expect(applyColorUpdateMessage(roster, { type: 'chat' })).toBeNull();
    expect(applyColorUpdateMessage(roster, null)).toBeNull();
  });

  it('folds the new colour into the matching listener only', () => {
    const result = applyColorUpdateMessage(roster, {
      type: 'user_color_updated',
      nickname: 'Ada',
      color: '#ffb84d',
    });
    expect(result).toEqual([{ ...roster[0], color: '#ffb84d' }, roster[1]]);
  });

  it('falls back to auto when the update clears the colour', () => {
    const result = applyColorUpdateMessage(roster, {
      type: 'user_color_updated',
      nickname: 'Grace',
      color: null,
    });
    expect(result?.[1].color).toBeNull();
  });
});
