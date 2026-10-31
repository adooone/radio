import { describe, expect, it } from 'bun:test';
import { formatNowPlayingMessage } from '@/services/stream/onAirService';
import type { ServerWebSocket } from 'bun';
import type { WebSocketData } from '../types';
import { ClientStore } from './clientStore';

function makeFakeSocket() {
  const sent: string[] = [];
  const socket = {
    readyState: 1,
    sent,
    send(message: string) {
      sent.push(message);
    },
  };
  return socket as unknown as ServerWebSocket<WebSocketData> & {
    sent: string[];
  };
}

describe('clientStore', () => {
  it('broadcasts the now-playing message to every connected client', () => {
    const store = new ClientStore();
    const a = makeFakeSocket();
    const b = makeFakeSocket();
    store.addClient(a);
    store.addClient(b);

    store.broadcast(
      formatNowPlayingMessage({
        albumId: 1,
        artist: 'Album Artist',
        title: 'Album Title',
        setAt: new Date().toISOString(),
      }),
    );

    const expected = JSON.stringify({
      type: 'now_playing',
      artist: 'Album Artist',
      title: 'Album Title',
    });
    expect(a.sent).toEqual([expected]);
    expect(b.sent).toEqual([expected]);
  });

  it('broadcasts a bare now-playing message on clear', () => {
    const store = new ClientStore();
    const a = makeFakeSocket();
    store.addClient(a);

    store.broadcast(formatNowPlayingMessage(null));

    expect(a.sent).toEqual([JSON.stringify({ type: 'now_playing' })]);
  });

  it('sends the current state only to the joining client, not existing ones', () => {
    const store = new ClientStore();
    const existing = makeFakeSocket();
    store.addClient(existing);

    const joining = makeFakeSocket();
    store.addClient(joining);
    joining.send(
      formatNowPlayingMessage({
        albumId: 1,
        artist: 'Album Artist',
        title: 'Album Title',
        setAt: new Date().toISOString(),
      }),
    );

    expect(joining.sent).toEqual([
      JSON.stringify({
        type: 'now_playing',
        artist: 'Album Artist',
        title: 'Album Title',
      }),
    ]);
    expect(existing.sent).toEqual([]);
  });
});
