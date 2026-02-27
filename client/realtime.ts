/**
 * Realtime Module: Magic WebSocket Client
 *
 * This module hides all networking details from students [you just call functions, we handle the network].
 * They only call: connect(), onConnection(), onState(), and action methods.
 * No WebSocket knowledge required!
 */

import { WebSocket } from 'ws';

// ============ Types (students use these) ============

export type SharedState = {
  locked: boolean;
  selectedOption: 'A' | 'B' | null;
  doneBy: string[];
  lastAction: string | null;
  lastBy: string | null;
};

export type RealtimeClient = {
  onConnection(cb: (connected: boolean) => void): () => void;
  onState(cb: (state: SharedState) => void): () => void;
  select(option: 'A' | 'B'): void;
  done(): void;
  reset(): void;
  lock(): void;
  close(): void;
};

// ============ Connection (students don't touch) ============

export function connect(url: string, user: string): RealtimeClient {
  // Auto-normalize URLs: ws:// ↔ wss://, http:// ↔ https://
  const wsUrl = url
    .replace(/^https/, 'wss')
    .replace(/^http/, 'ws')
    .replace(/wss:\/\//, 'wss://');

  const ws = new WebSocket(wsUrl);

  let connectionCallbacks: Array<(connected: boolean) => void> = [];
  let stateCallbacks: Array<(state: SharedState) => void> = [];

  // ============ WebSocket Events ============

  ws.onopen = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: 'hello', payload: { name: user } }));
    }
    // Notify all listeners: we're connected
    connectionCallbacks.forEach((cb) => cb(true));
  };

  ws.onmessage = (event) => {
    try {
      const data = typeof event.data === 'string' ? event.data : event.data.toString();
      const state = JSON.parse(data) as SharedState;
      // Notify all listeners: new state arrived
      stateCallbacks.forEach((cb) => cb(state));
    } catch (err) {
      console.error('[realtime] Failed to parse state:', err);
    }
  };

  ws.onerror = () => {
    connectionCallbacks.forEach((cb) => cb(false));
    console.error('[realtime] WebSocket error');
  };

  ws.onclose = () => {
    connectionCallbacks.forEach((cb) => cb(false));
  };

  // ============ Public API (students call these) ============

  return {
    onConnection: (cb) => {
      connectionCallbacks.push(cb);
      // Return unsubscribe function
      return () => {
        connectionCallbacks = connectionCallbacks.filter((x) => x !== cb);
      };
    },

    onState: (cb) => {
      stateCallbacks.push(cb);
      // Return unsubscribe function
      return () => {
        stateCallbacks = stateCallbacks.filter((x) => x !== cb);
      };
    },

    select: (option) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'select', payload: option }));
      }
    },

    done: () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'done', payload: user }));
      }
    },

    reset: () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'reset', payload: null }));
      }
    },

    lock: () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'lock', payload: null }));
      }
    },

    close: () => {
      ws.close();
    },
  };
}
