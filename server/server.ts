import { WebSocketServer, WebSocket } from 'ws';

// ============ Shared State ============
type SharedState = {
  locked: boolean;
  selectedOption: 'A' | 'B' | null;
  doneBy: string[];
  lastAction: string | null;
  lastBy: string | null;
};

let state: SharedState = {
  locked: false,
  selectedOption: null,
  doneBy: [],
  lastAction: null,
  lastBy: null,
};

// ============ WebSocket Server ============
const wss = new WebSocketServer({ port: 8765 });
const clients = new Set<WebSocket>();  // all connected clients
const clientNames = new Map<WebSocket, string>();  // track each client's name

function broadcast() {  // send state to all clients [notify everyone listening]
  const message = JSON.stringify(state);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

wss.on('connection', (ws) => {
  clients.add(ws);
  clientNames.set(ws, 'unknown');
  console.log(`[Connected] Client connected (${clients.size} total)`);

  // Send snapshot to new client
  ws.send(JSON.stringify(state));

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data);
      const { action, payload } = msg;
      const clientName = clientNames.get(ws) ?? 'unknown';

      if (action === 'hello' && payload?.name) {
        clientNames.set(ws, String(payload.name));
        console.log(`  ← hello (${payload.name})`);
        return;
      }

      console.log(`  ← ${action} (${clientName})`, payload);

      // Process action
      if (action === 'select') {
        state.selectedOption = payload; // 'A' or 'B'
        state.lastAction = `select ${payload}`;
        state.lastBy = clientName;
      } else if (action === 'done') {
        if (!state.doneBy.includes(payload)) {
          state.doneBy.push(payload);
        }
        state.lastAction = 'done';
        state.lastBy = clientName;
      } else if (action === 'lock') {
        state.locked = true;
        state.lastAction = 'locked';
        state.lastBy = clientName;
      } else if (action === 'reset') {
        state = {
          locked: false,
          selectedOption: null,
          doneBy: [],
          lastAction: 'reset',
          lastBy: clientName,
        };
      }

      // Broadcast new state to all clients
      broadcast();
    } catch (err) {
      console.error('Error parsing message:', (err as Error).message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    const clientName = clientNames.get(ws) ?? 'unknown';
    clientNames.delete(ws);
    console.log(`[Disconnected] Client disconnected (${clients.size} remaining) (${clientName})`);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Redux Workshop Server');
console.log('  Listening on ws://localhost:8765');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n  Run this in another terminal:');
console.log('  $ ngrok http 8765\n');
