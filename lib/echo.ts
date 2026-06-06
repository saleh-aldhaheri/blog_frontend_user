
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT),   // ← missing!
    wssPort: Number(import.meta.env.VITE_REVERB_PORT),
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL_V1}/broadcasting/auth`, // ← should NOT have /v1
    auth: {
        headers: {
            Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
        },
    },
});

echo.connector.pusher.connection.bind('state_change', (states: { previous: string; current: string }) => {
  console.log(`[Echo] Connection state: ${states.previous} → ${states.current}`);
});

echo.connector.pusher.connection.bind('connected', () => {
  console.log('[Echo] ✅ Connected to Reverb');
  console.log('[Echo] Socket ID:', echo.socketId());
});

echo.connector.pusher.connection.bind('disconnected', () => {
  console.log('[Echo] ❌ Disconnected from Reverb');
});

echo.connector.pusher.connection.bind('error', (err: unknown) => {
  console.error('[Echo] 🔴 Connection error:', err);
});

export default echo;