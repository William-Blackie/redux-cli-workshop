/**
 * Redux Reducer Tests
 *
 * WHY TEST REDUCERS?
 * Reducers are pure functions: same input always gives same output.
 * This makes them trivial to test—no mocks, no async, no side effects.
 *
 * This is one of Redux's superpowers!
 * 
 * Note: We test the reducer directly (as a pure function), even though
 * it's used with Redux Toolkit's configureStore() in the actual app.
 */

import * as assert from 'assert';

// ============================================================================
// REDUCER (copied from client/index.ts for testing)
// ============================================================================

type State = {
  locked: boolean;
  selectedOption: 'A' | 'B' | null;
  doneBy: string[];
  connected: boolean;
  lastAction: string | null;
  lastBy: string | null;
};

type SharedState = {
  locked: boolean;
  selectedOption: 'A' | 'B' | null;
  doneBy: string[];
  lastAction: string | null;
  lastBy: string | null;
};

type Action =
  | { type: 'CONNECTION_CHANGED'; payload: { connected: boolean } }
  | { type: 'SNAPSHOT_RECEIVED'; payload: SharedState }
  | { type: 'PARTICIPANT_DONE'; payload: { name: string } };

/**
 * SOLUTION VERSION: Complete reducer (students will write this)
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CONNECTION_CHANGED':
      return { ...state, connected: action.payload.connected };

    case 'SNAPSHOT_RECEIVED':
      const { payload } = action;
      return {
        ...state,
        locked: payload.locked,
        selectedOption: payload.selectedOption,
        doneBy: payload.doneBy,
        lastAction: payload.lastAction,
        lastBy: payload.lastBy,
      };

    case 'PARTICIPANT_DONE':
      return { ...state, doneBy: [...state.doneBy, action.payload.name] };

    default:
      return state;
  }
}

// ============================================================================
// TESTS
// ============================================================================

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${(err as Error).message}`);
    testsFailed++;
  }
}

// ============================================================================
// Test Suite 1: Initial State
// ============================================================================

const initialState: State = {
  locked: false,
  selectedOption: null,
  doneBy: [],
  connected: false,
  lastAction: null,
  lastBy: null,
};

test('reducer returns state unchanged for unknown action type', () => {
  const action = { type: 'UNKNOWN_ACTION' } as any;
  const result = reducer(initialState, action);
  assert.deepStrictEqual(result, initialState);
});

// ============================================================================
// Test Suite 2: CONNECTION_CHANGED
// ============================================================================

test('CONNECTION_CHANGED sets connected to true', () => {
  const action: Action = { type: 'CONNECTION_CHANGED', payload: { connected: true } };
  const result = reducer(initialState, action);
  assert.strictEqual(result.connected, true);
});

test('CONNECTION_CHANGED sets connected to false', () => {
  const action: Action = { type: 'CONNECTION_CHANGED', payload: { connected: false } };
  const result = reducer(initialState, action);
  assert.strictEqual(result.connected, false);
});

test('CONNECTION_CHANGED preserves other state', () => {
  const state: State = {
    locked: true,
    selectedOption: 'A',
    doneBy: ['alice', 'bob'],
    connected: false,
    lastAction: 'select A',
    lastBy: 'alice',
  };
  const action: Action = { type: 'CONNECTION_CHANGED', payload: { connected: true } };
  const result = reducer(state, action);
  assert.strictEqual(result.locked, true);
  assert.strictEqual(result.selectedOption, 'A');
  assert.deepStrictEqual(result.doneBy, ['alice', 'bob']);
});

// ============================================================================
// Test Suite 3: SNAPSHOT_RECEIVED
// ============================================================================

test('SNAPSHOT_RECEIVED replaces locked', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: [],
    connected: true,
    lastAction: null,
    lastBy: null,
  };
  const action: Action = {
    type: 'SNAPSHOT_RECEIVED',
    payload: {
      locked: true,
      selectedOption: 'B',
      doneBy: ['charlie'],
      lastAction: 'select B',
      lastBy: 'charlie',
    },
  };
  const result = reducer(state, action);
  assert.strictEqual(result.locked, true);
});

test('SNAPSHOT_RECEIVED replaces selectedOption', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: [],
    connected: true,
    lastAction: null,
    lastBy: null,
  };
  const action: Action = {
    type: 'SNAPSHOT_RECEIVED',
    payload: {
      locked: false,
      selectedOption: 'A',
      doneBy: [],
      lastAction: 'select A',
      lastBy: 'alice',
    },
  };
  const result = reducer(state, action);
  assert.strictEqual(result.selectedOption, 'A');
});

test('SNAPSHOT_RECEIVED replaces doneBy', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: ['alice'],
    connected: true,
    lastAction: 'done',
    lastBy: 'alice',
  };
  const action: Action = {
    type: 'SNAPSHOT_RECEIVED',
    payload: {
      locked: false,
      selectedOption: null,
      doneBy: ['alice', 'bob', 'charlie'],
      lastAction: 'done',
      lastBy: 'charlie',
    },
  };
  const result = reducer(state, action);
  assert.deepStrictEqual(result.doneBy, ['alice', 'bob', 'charlie']);
});

test('SNAPSHOT_RECEIVED preserves connected status', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: [],
    connected: true,
    lastAction: null,
    lastBy: null,
  };
  const action: Action = {
    type: 'SNAPSHOT_RECEIVED',
    payload: {
      locked: true,
      selectedOption: 'A',
      doneBy: ['alice'],
      lastAction: 'select A',
      lastBy: 'alice',
    },
  };
  const result = reducer(state, action);
  assert.strictEqual(result.connected, true);
});

// ============================================================================
// Test Suite 4: PARTICIPANT_DONE
// ============================================================================

test('PARTICIPANT_DONE adds name to doneBy', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: [],
    connected: true,
    lastAction: null,
    lastBy: null,
  };
  const action: Action = {
    type: 'PARTICIPANT_DONE',
    payload: { name: 'alice' },
  };
  const result = reducer(state, action);
  assert.deepStrictEqual(result.doneBy, ['alice']);
});

test('PARTICIPANT_DONE appends to existing doneBy', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: ['alice'],
    connected: true,
    lastAction: 'done',
    lastBy: 'alice',
  };
  const action: Action = {
    type: 'PARTICIPANT_DONE',
    payload: { name: 'bob' },
  };
  const result = reducer(state, action);
  assert.deepStrictEqual(result.doneBy, ['alice', 'bob']);
});

test('PARTICIPANT_DONE preserves other state', () => {
  const state: State = {
    locked: true,
    selectedOption: 'B',
    doneBy: ['alice'],
    connected: true,
    lastAction: 'select B',
    lastBy: 'alice',
  };
  const action: Action = {
    type: 'PARTICIPANT_DONE',
    payload: { name: 'bob' },
  };
  const result = reducer(state, action);
  assert.strictEqual(result.locked, true);
  assert.strictEqual(result.selectedOption, 'B');
  assert.strictEqual(result.connected, true);
});

// ============================================================================
// Test Suite 5: Immutability (Core Redux Principle!)
// ============================================================================

test('reducer does not mutate input state', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: [],
    connected: false,
    lastAction: null,
    lastBy: null,
  };
  const action: Action = {
    type: 'PARTICIPANT_DONE',
    payload: { name: 'alice' },
  };
  const originalDoneBy = state.doneBy;
  reducer(state, action);
  // Input state should not have changed
  assert.deepStrictEqual(state.doneBy, []);
  // And it should be the same reference (we didn't create a new array)
  assert.strictEqual(state.doneBy, originalDoneBy);
});

test('reducer returns new state object', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: [],
    connected: false,
    lastAction: null,
    lastBy: null,
  };
  const action: Action = {
    type: 'CONNECTION_CHANGED',
    payload: { connected: true },
  };
  const result = reducer(state, action);
  // Result should be a different object
  assert.notStrictEqual(result, state);
  // But unchanged properties should still reference same objects where possible
  // (This is just for documentation; spread creates new object)
});

test('reducer returns new doneBy array when modified', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: ['alice'],
    connected: true,
    lastAction: 'done',
    lastBy: 'alice',
  };
  const action: Action = {
    type: 'PARTICIPANT_DONE',
    payload: { name: 'bob' },
  };
  const result = reducer(state, action);
  // Result array should be new
  assert.notStrictEqual(result.doneBy, state.doneBy);
  // Original should be unchanged
  assert.deepStrictEqual(state.doneBy, ['alice']);
});

// ============================================================================
// Test Suite 6: Pure Functions (Same Input = Same Output)
// ============================================================================

test('reducer is deterministic: same input always gives same output', () => {
  const state: State = {
    locked: false,
    selectedOption: null,
    doneBy: [],
    connected: false,
    lastAction: null,
    lastBy: null,
  };
  const action: Action = {
    type: 'PARTICIPANT_DONE',
    payload: { name: 'alice' },
  };

  // Call reducer multiple times with same input
  const result1 = reducer(state, action);
  const result2 = reducer(state, action);
  const result3 = reducer(state, action);

  // All results should be equal (same values)
  assert.deepStrictEqual(result1, result2);
  assert.deepStrictEqual(result2, result3);
});

// ============================================================================
// Test Results
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n  Tests Passed: ${testsPassed}`);
console.log(`  Tests Failed: ${testsFailed}\n`);

if (testsFailed > 0) {
  process.exit(1);
}
