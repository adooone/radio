import { socketUrl } from './env';

type Listener = (ws: WebSocket) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let attempts = 0;
const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 1_000;
const subscribers = new Set<Listener>();

const scheduleReconnect = () => {
  if (reconnectTimer || attempts >= MAX_ATTEMPTS) return;
  const delay = BASE_DELAY_MS * 2 ** attempts;
  attempts += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
};

const connect = () => {
  if (socket && socket.readyState !== WebSocket.CLOSED) return;
  try {
    socket = new WebSocket(socketUrl);
  } catch {
    scheduleReconnect();
    return;
  }
  socket.addEventListener('open', () => {
    attempts = 0;
    if (!socket) return;
    // Rejoin under the saved name, so reconnects keep the seat.
    const nickname = localStorage.getItem('nickname');
    if (nickname) socket.send(JSON.stringify({ type: 'join', nickname }));
    for (const cb of subscribers) cb(socket);
  });
  socket.addEventListener('close', scheduleReconnect);
  socket.addEventListener('error', scheduleReconnect);
};

/** Attach to the shared socket; the callback fires again on every reconnect. */
export const subscribe = (cb: Listener) => {
  subscribers.add(cb);
  if (socket && socket.readyState === WebSocket.OPEN) cb(socket);
  connect();
  return () => {
    subscribers.delete(cb);
  };
};

/** The socket for sending; throws where none could be created. */
export const getSocket = () => {
  connect();
  if (!socket) throw new Error('WebSocket unavailable');
  return socket;
};
