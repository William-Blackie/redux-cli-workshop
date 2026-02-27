/**
 * Redux CLI Workshop: Client Application (EXERCISE VERSION)
 *
 * Your job: Fill in the 3 TODO cases in the reducer below.
 * Reference: See client/index.complete.ts for the complete version.
 * 
 * To switch to complete version: cp client/index.complete.ts client/index.ts
 * See PRESENTER.md for more.
 */

import { configureStore } from '@reduxjs/toolkit';
import { connect, SharedState } from './realtime.js';
import * as readline from 'readline';

// ============================================================================
// REDUX STATE & TYPES (Provided)
// ============================================================================

type State = {
  locked: boolean;
  selectedOption: 'A' | 'B' | null;
  doneBy: string[];
  connected: boolean;
  lastAction: string | null;
  lastBy: string | null;
};

type Action =
  | { type: 'CONNECTION_CHANGED'; payload: { connected: boolean } }
  | { type: 'SNAPSHOT_RECEIVED'; payload: SharedState }
  | { type: 'PARTICIPANT_DONE'; payload: { name: string } };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: State = {
  locked: false,
  selectedOption: null,
  doneBy: [],
  connected: false,
  lastAction: null,
  lastBy: null,
};

// ============================================================================
// REDUX REDUCER (Your first TODO!)
// ============================================================================

/**
 * SLIDE #6: THE THREE CASES YOU'LL IMPLEMENT
 *
 * A reducer is a pure function: (state, action) → new state
 *
 * It describes HOW state changes in response to actions.
 * No side effects. No mutations. Use spread operator: { ...state, ... }
 *
 * TODO (workshop) #1, #2, #3: Implement the cases below
 */
function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'CONNECTION_CHANGED':
      // TODO (workshop) #1: Handle connection status change
      // When the network status changes, update state.connected
      // HINT: Use spread operator to return new state
      return { ...state, connected: action.payload.connected };

    case 'SNAPSHOT_RECEIVED':
      // TODO (workshop) #2: Handle server state snapshot
      // When server sends us state, merge it into our Redux state
      // HINT: the payload has locked, selectedOption, doneBy, etc.
      // Return a new state with those values merged in
      return { ...state, ...action.payload };

    case 'PARTICIPANT_DONE':
      // TODO (workshop) #3: Add name to doneBy array (optional - for learning only)
      // Use spread to add name to the array without mutating
      // HINT: return { ...state, doneBy: [...state.doneBy, action.payload.name] };
      return { ...state, doneBy: [...state.doneBy, action.payload.name] };

    default:
      return state;
  }
}

// ============================================================================
// REDUX STORE (Using Redux Toolkit)
// ============================================================================

/**
 * Create the Redux store using configureStore from Redux Toolkit
 * This gives us:
 * - store.dispatch(action) to send actions
 * - store.subscribe(callback) to listen for changes
 * - store.getState() to read current state
 */
const store = configureStore({
  reducer,
  preloadedState: initialState,
});

// Helper to get current state
const getState = () => store.getState();

// ============================================================================
// RENDER (Provided)
// ============================================================================

/**
 * Called whenever state changes.
 * Prints the current state to the CLI.
 */
function render(): void {
  const state = getState();
  
  console.clear();

  // ASCII header
  console.log('');
  console.log('  +==========================================+');
  console.log('  |    Redux Video Experiment Session       |');
  console.log('  +==========================================+');
  console.log('');

  // Status
  const connectionStatus = state.connected ? '[Connected]' : '[Disconnected]';
  console.log(`  Connection: ${connectionStatus}`);
  console.log(`  Locked:     ${state.locked ? 'YES' : 'NO'}`);
  console.log(`  Selected:   ${state.selectedOption || '(none)'}`);
  console.log(`  Done:       ${state.doneBy.length > 0 ? state.doneBy.join(', ') : '(none)'}`);
  console.log(
    `  Last:       ${state.lastAction ? `${state.lastAction}${state.lastBy ? ` (${state.lastBy})` : ''}` : '(none)'}`
  );

  console.log('');
  console.log('  Commands: a | b | done | lock | reset | help');
  console.log('');
  process.stdout.write('  > ');
}

// Subscribe to Redux store changes - render on every state update
store.subscribe(() => {
  render();
});

// ============================================================================
// CLI HANDLER (Provided)
// ============================================================================

async function main(): Promise<void> {
  // Parse command line args
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('\nUsage: npm run client -- <URL> <username>');
    console.error('\nExample: npm run client -- wss://abc123.ngrok.io alice\n');
    process.exit(1);
  }

  const websocketUrl = args[0];
  const username = args[1];

  // ========================================================================
  // SLIDES #6: WIRING EXTERNAL EVENTS TO REDUX
  // ========================================================================

  // Connect to the server (realtime module hides WebSocket details)
  const realtime = connect(websocketUrl, username);

  // SLIDES #6a: Wire connection events
  // When network status changes, dispatch an action to Redux
  realtime.onConnection((connected) => {
    store.dispatch({ type: 'CONNECTION_CHANGED', payload: { connected } });
  });

  // SLIDES #6b: Wire state updates from server
  // When server sends us new state, dispatch an action to Redux
  realtime.onState((snapshot: SharedState) => {
    store.dispatch({ type: 'SNAPSHOT_RECEIVED', payload: snapshot });
  });

  // Initial render
  render();

  // ========================================================================
  // CLI INPUT LOOP (Provided)
  // ========================================================================

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('line', (input: string) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0];

    if (command === 'a' || command === 'b') {
      if (getState().locked) {
        console.error('\n✗ Cannot select: experiment is locked (host only)\n');
      } else {
        realtime.select(command.toUpperCase() as 'A' | 'B');
      }
    } else if (command === 'select') {
      const option = parts[1]?.toUpperCase();
      if (option === 'A' || option === 'B') {
        realtime.select(option);
      } else {
        console.error('\n✗ Invalid selection. Use: a or b\n');
        render();
      }
    } else if (command === 'done') {
      realtime.done();
    } else if (command === 'lock') {
      realtime.lock();
    } else if (command === 'reset') {
      realtime.reset();
    } else if (command === 'help') {
      console.log('\n  Available Commands:');
      console.log('  ─────────────────────');
      console.log('  a               Select option A');
      console.log('  b               Select option B');
      console.log('  done            Mark yourself done');
      console.log('  lock            Lock selection (host only)');
      console.log('  reset           Reset state to initial (host only)');
      console.log('  help            Show this menu');
      console.log('');
    } else if (command === 'state') {
      console.log('\n  Current Redux State:');
      console.log(JSON.stringify(getState(), null, 2));
      console.log('');
    } else if (command === '' || !command) {
      render();
    } else {
      console.error(`\n✗ Unknown command: ${command}\n`);
      render();
    }

    process.stdout.write('  > ');
  });

  rl.on('close', () => {
    realtime.close();
    process.exit(0);
  });
}

// ============================================================================
// START THE APP
// ============================================================================

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
