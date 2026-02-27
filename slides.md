# Redux workshop: 30-minute fundamentals (FAST VERSION)

---

## PART 1: REDUX IN 3 MINUTES

---

## Slide 1: What is Redux?

Redux = **one place to store all your app's data [state]**.

**Three principles:**
1. Single source of truth — one state object
2. State is read-only — don't mutate [change] it
3. Pure functions [same input = same output] handle updates (reducers)

**Core pattern:**
```
Action → Reducer → State → Auto-render
```

That's it.

---

## Slide 2: Why Redux?

**Without Redux:**
- State scattered everywhere
- Hard to debug [understand what went wrong]
- Hard to test [verify code works]
- Updates cause race conditions [conflicting changes]

**With Redux:**
- Everything predictable
- Easy to test (reducers are just functions)
- No race conditions
- Time-travel debugging [replay what happened]

---

## Slide 3: Our 30-minute project

**Build:** A shared video selection experiment where multiple people vote A or B in real-time.

**Perfect for Redux because:**
- State must sync across clients
- Clear actions (select, lock, done, reset)
- Server is single source of truth

---

## Slide 4: The data flow (KEY DIAGRAM)

```
YOU TYPE "a"
  ↓
dispatch({ type: 'SELECT', payload: 'A' })
  ↓
reducer(state, action) → newState
  ↓
store updates
  ↓
store.subscribe() → re-render
  ↓
Network: send to server
  ↓
Server broadcasts to ALL clients
  ↓
Everyone gets new state → everyone re-renders
```

**Result:** Everyone sees the same state at the same time. ✓

---

## Slide 5: Your Redux state shape

```javascript
{
  locked: false,           // can people still vote?
  selectedOption: 'A' | 'B' | null,   // what did YOU pick?
  doneBy: [],             // who's marked themselves done?
  connected: true,        // are you online?
  lastAction: 'SELECT A', // what just happened?
  lastBy: 'alice'         // who did it?
}
```

You'll write ONE reducer function that returns new state for each action.

---

## Slide 6: Your 3 cases to implement

**TODO 1: CONNECTION_CHANGED**
Fires when: Network connects/disconnects.
```typescript
return { ...state, connected: action.payload.connected };
```

**TODO 2: SNAPSHOT_RECEIVED**
Fires when: Server sends you state (on join + every update).
```typescript
return { ...state, ...action.payload };
```

**TODO 3: PARTICIPANT_DONE** (learning only)
Fires when: Someone marks done (practice array immutability).
```typescript
return { ...state, doneBy: [...state.doneBy, action.payload.name] };
```

---

## Slide 7: The ONE mistake that breaks everything

```javascript
// ❌ WRONG (mutating):
case 'SELECT':
  state.selectedOption = payload;
  return state;

// ✅ RIGHT (immutable):
case 'SELECT':
  return { ...state, selectedOption: payload };
```

**Why?** Redux checks if state is a NEW object. If you mutate, it won't see the change.

**Rule:** Always return a new object with spread `{ ...state }`.

---

## Slide 8: Ready? Here's the flow

- **NOW (0-2 min):** I show you Slides 1-7 (Redux overview)
- **MIN 2-3:** Find the TODOs in `client/index.ts`
- **MIN 3-15:** Implement your 3 cases
- **MIN 15-20:** Test with `npm run client -- <URL> <name>`
- **MIN 20-30:** Live demo (everyone syncs in real time)

Go!

---

## Slide 3: Redux example — a simple counter

**State in one place:**
```javascript
state = { count: 0 }
```

**One function handles all updates:**
```javascript
function reducer(state, action) {
  switch(action.type) {
    case 'INCREMENT': return { count: state.count + 1 };
    case 'DECREMENT': return { count: state.count - 1 };
    case 'RESET': return { count: 0 };
    default: return state;
  }
}
```

**How you use it:**
```javascript
dispatch({ type: 'INCREMENT' });  // count becomes 1
dispatch({ type: 'INCREMENT' });  // count becomes 2
dispatch({ type: 'RESET' });      // count becomes 0
```

**Benefits:** Predictable, testable, easy to debug.

---

## Slide 4: What problems does Redux solve?

**The challenge:** Without Redux, managing complex state leads to four major problems:

**Example:** Without Redux, state gets scattered:

```javascript
class VideoController {
  locked: boolean;           ← here
  selectedOption: string;    ← here  
  hasViewed: boolean[];      ← here
  timer: number;             ← here
  
  // Logic spread across methods
  select(option) {
    if (this.locked) return;
    this.selectedOption = option;
    this.updateUI();
    if (this.hasViewed[0] && this.hasViewed[1]) {
      this.enableSubmit();  // coordination logic scattered
    }
  }
  
  checkIfDone() { ... }
  updateUI() { ... }
  // Often gets worse with more inheritance.
}
```

**Problems with real examples:**

1. **Properties get out of sync** → Hard to coordinate:
```javascript
// Bug: locked changed, but UI wasn't updated
this.locked = true;
// UI still shows "unlocked" until someone remembers to call updateUI()
// Easy to forget when state changes in multiple places
```

2. **Logic scattered** → Hard to test:
```javascript
// To test select(), you need:
// - Mock the UI (updateUI method)
// - Mock submit button (enableSubmit method)
// - Setup hasViewed array correctly
// Can't test state logic in isolation - everything is coupled
```

3. **Can't replay bugs** → Hard to debug:
```javascript
// Bug report: "Submit button enabled at wrong time"
// Questions you can't answer:
// - Which methods were called?
// - In what order?
// - What was hasViewed when select() ran?
// No way to reproduce - no record of what happened
```

4. **Adding features touches many places** → Fragile:
```javascript
// New feature: "Add undo button"
// Now you need to modify:
// - select(), checkIfDone(), lock(), every method that changes state
// - Add history tracking to VideoController
// - Update all UI code to show/hide undo button
// - Remember to do this for EVERY future feature
// Easy to miss one method → bugs
```

---

## Slide 5: Redux vs typical event-driven patterns

**Problem:** Traditional event systems make these issues worse.

**Traditional event emitters / pub-sub:**

```javascript
// Multiple listeners, each handles state differently
events.on('videoSelected', (video) => {
  this.selectedOption = video;        // State mutated here
  this.updateUI();                     // Side effect here
});

events.on('videoSelected', (video) => {
  this.validateChoice(video);         // More logic scattered
  this.log(video);                     // Another side effect
});
```

**Problems:** State changes scattered, hard to debug, race conditions possible.

**Redux approach:**

```javascript
// One action → one reducer → one state update
dispatch({ type: 'SELECT', payload: 'A' });

// All logic centralized in reducer (pure function)
case 'SELECT':
  return { ...state, selectedOption: payload };

// All subscribers get notified automatically
subscribe(() => render(state));
```

**Benefits:** Predictable, testable, single source of truth, time-travel debugging.

---

## PART 2: APPLYING REDUX TO OUR CASE (5 minutes)

---

## Slide 6: Our experiment: a perfect Redux use case

You'll now apply everything you just learned to a real problem. We're building a **shared video selection experiment** — multiple people, one decision, real-time sync.

**The scenario:**
- Multiple participants
- Each selects video A or B
- Host can lock selections
- Everyone sees updates in real-time

**Perfect for Redux because:**
- State needs to stay in sync across clients
- Clear actions: select, done, lock, reset
- Easy to test: just test the reducer

**Why Redux?** Because we need:
- Single source of truth [server is boss]
- Predictable updates [everyone sees the same thing]
- Easy to test [pure reducers are testable]
- Clear action flow [easy to debug what happened]

---

## Slide 7: The traditional approach (without Redux)

What does managing this **without Redux** look like?

```
class VideoExperimentController {
  locked: boolean;
  selectedOption: 'A' | 'B' | null;
  hasViewed: boolean[];
  
  select(choice) {
    if (this.locked) return;      ← conditional checks
    this.selectedOption = choice;  ← direct mutation
    this.interface.update();       ← manual updates
  }
}
```

Without Redux, we'd have scattered properties, manual sync issues, and hard-to-test logic. ✗

---

## Slide 8: The Redux solution (for our experiment)

**With Redux, everything is centralized, predictable, and testable.** 

One object holds all experiment state:

```javascript
{
  locked: false,
  selectedOption: null,  // 'A', 'B', or null
  doneBy: [],
  connected: true,       // client-only
  lastAction: 'select A',
  lastBy: 'alice'
}
```

All changes go through pure functions (reducers).
All UI updates are automatic (subscribe).

**Note:** `connected` is client-only. `lastAction`/`lastBy` show what just happened and who triggered it.

---

## Slide 9: Complete data flow (understand this, then code)

This is the **KEY slide** that explains why we're building what we're building.

You're building a **distributed [shared across computers] Redux client**. Here's every step that happens:

```
(1) CONNECT: You start client
      |
    WebSocket connects to server
      |
    dispatch(CONNECTION_CHANGED) -> state.connected = true -> UI shows "[Connected]"

(2) SYNC: Server sends current state
      |
    Server sends: { locked, selectedOption, doneBy, ... }
      |
    dispatch(SNAPSHOT_RECEIVED) -> reducer merges -> UI shows current state
    (if someone picked "A" before you joined, you see it now)

(3) ACTION: You type "a"
      |
    realtime.select('A') sends to server
      |
    Server updates: { selectedOption: 'A', lastBy: 'you' }
      |
    Server BROADCASTS to ALL clients (including you)
      |
    Everyone gets dispatch(SNAPSHOT_RECEIVED) -> everyone's UI updates
      |
    Result: Everyone sees "Selected: A"

(4) OTHERS' ACTIONS: Same flow — server broadcasts, everyone updates
```

**Key insight:** Server is the single source of truth [decides what's real]. Everyone stays in sync because everyone gets the same state snapshots. No race conditions [conflicting updates]!

**Why CONNECTION_CHANGED?** So you know if network is up/down.
**Why SNAPSHOT_RECEIVED?** To sync with server state (initial + every update).
**Why PARTICIPANT_DONE exists?** It's for learning array immutability [creating new arrays]. The server actually handles "done" internally, but we include this case to practice spread operator on arrays.

---

## PART 3: IMPLEMENTATION (8 minutes)

---

## Slide 10: Your 3 reducer cases (now you understand why!)

Now that you've seen the complete data flow (Slide 9), you know exactly when each reducer case fires. Here's what to implement:

**Reducer rules reminder:** pure function [same input = same output] that returns new state. Use spread operator `{ ...state }`, don't mutate!

Open `client/index.ts`. Find the `reducer()` function.

Now that you understand the data flow, here are the 3 cases you'll implement:

**TODO #1: CONNECTION_CHANGED**
```
When network connects/disconnects,
return { ...state, connected: payload.connected }
```

**TODO #2: SNAPSHOT_RECEIVED**
```
When server sends state snapshot,
merge the values:
return { ...state, locked: payload.locked, ... }
```

**TODO #3: PARTICIPANT_DONE** (Optional - for learning only)
```
Add name to doneBy array (use spread)
return { ...state, doneBy: [...state.doneBy, payload.name] }

Note: In this workshop, the server handles 'done' directly,
so this action is never dispatched. It's here to practice
array immutability with the spread operator.
```

---

## Slide 11: Key Redux concepts you'll use

As you code, you'll dispatch actions, and subscribers will re-render. Here's how it works:

**Dispatch** [send action to reducer]:
```
dispatch({ type: 'SNAPSHOT_RECEIVED', payload: { locked: true } })
  → reducer runs → state updates → UI re-renders
```

**Actions** [describe what happened] have structure:
```
{ type: 'ACTION_NAME', payload: data }
  type = category ("SELECT", "LOCK")
  payload = the data
```

**Subscribe** [auto-update UI]:
```
subscribe(() => render());  // called whenever state changes
```

**The cycle:**
```
You type "a" → dispatch(action) → reducer → state → subscribe → render
```

---

## Slide 12: Why pure reducers matter (and why we care)

**Pure functions = testable, debuggable, predictable**

**Same input, same output:**

```
reducer({ locked: false }, { type: 'LOCK' })
  → always returns { locked: true }
```

**Testability [easy to verify the code works correctly]:**
```
// You can test in isolation [just the reducer by itself]
const newState = reducer(oldState, action);
assert(newState.locked === true);  // assert [check/verify] the result is correct
```

**Debuggability [easy to find and fix problems]:**
```
// You can replay actions to reproduce bugs [see what went wrong]
dispatch(action1);
dispatch(action2);
dispatch(action3);  // if something breaks, replay from action1
```

---

## Slide 13: Three mistakes to avoid while coding

**Mistake 1: Mutating [changing directly] state**
```
WRONG:
case 'SELECT':
  state.selectedOption = payload;  // mutation!
  return state;

RIGHT:
case 'SELECT':
  return { ...state, selectedOption: payload };  // spread!
```

**Mistake 2: Forgetting to dispatch [send the action to the reducer]**
```
WRONG:
realtime.onState((snapshot) => {
  state = snapshot;  // forgot to dispatch!
});

RIGHT:
realtime.onState((snapshot) => {
  dispatch({ type: 'SNAPSHOT_RECEIVED', payload: snapshot });
});
```

**Mistake 3: Side effects [operations that affect things outside this function] in reducer**
```
WRONG:
case 'DONE':
  realtime.done();  // side effect - don't do this!
  return { ...state, doneBy: [...state.doneBy, payload.name] };

RIGHT:
// Dispatch the action
dispatch({ type: 'PARTICIPANT_DONE', payload: { name } });
// Handle side effects outside reducer (in CLI handler)
realtime.done();
```

---

## Slide 14: Your roadmap for the next 20 minutes

You now have all the knowledge. Here's what happens next:

**Timeline:**
- **Now (7-15 min):** Implement the 3 reducer cases in `client/index.ts`
  - Look for `// TODO (workshop)` comments
  - Each case takes 1-2 minutes
  - Your reducer is pure — you're just moving data around
  
- **Next (15-20 min):** Test your implementation
  - Run: `npm run client -- <URL> <yourname>`
  - Commands: type `a` or `b` to select, `lock` to lock, `reset` to clear
  - Watch your state appear on other clients in real time
  
- **Finally (20-30 min):** Live group demo
  - See how Redux keeps everyone's state synchronized
  - Ask questions about what's happening
  - Celebrate your first Redux app ✓

**Commands to test:**
```
a              → you select A
b              → you select B
done           → your name appears in "Done" list
lock           → lock the selection (prevents a/b, host only)
reset          → host clears state
help           → show menu
```

---

## Slide 15: Why Redux matters in the real world

What you're learning today isn't a workshop toy. It scales to **production apps** handling millions of users.

Complex state management often involves:

**Traditional approach:**
```
10+ class properties with interdependencies 
Imperative [step-by-step instructions] updates scattered across methods
Logic tightly coupled to implementation
Testing requires full environment setup
Coordination challenges as features grow
```

**With Redux:**
```
1 state object: { locked, selectedOption, hasViewed, ... }
All transitions in pure, testable reducers
UI updates automatically via subscribe
New features: add reducer cases
Easy to test: reducer(state, action) → newState
```

Scaling example:
- Traditional: adding "tieBreaker mode" = edit 10+ scattered methods → bugs everywhere
- Redux: adding "tieBreaker mode" = add 1 reducer case → tests pass ✓

**Real projects using Redux:** Netflix, Uber, Airbnb, Twitter. Same pattern you just learned.

---

## Slide 16: You've got this. Let's go.

**Everything you need is in place.** Your job now:

1. Remember Slide 9 (the data flow diagram)
2. Remember Slide 13 (the 3 mistakes to avoid)
3. Open `client/index.ts` and fill in the TODOs

When you're stuck:
- Look at the error message (tests tell you what's wrong)
- Reread Slide 9 (understand when your case runs)
- Check Slide 13 (are you mutating? did you dispatch?)

That's it. You now understand Redux as well as engineers at Netflix/Uber/Airbnb.

Go build something great.

---

# INSTRUCTIONS: HOW TO BUILD IT

---

## Step 1: Find the TODOs

Open `client/index.ts` and search for `// TODO (workshop)`.

You'll find 3 cases in the `reducer()` function that need implementation.

---

## Step 2: Implement the three reducer cases

Refer back to Slides 9 and 10 for **when** each case fires and **what data** it receives.

**Case 1: CONNECTION_CHANGED**
```typescript
case 'CONNECTION_CHANGED':
  return { ...state, connected: action.payload.connected };
```
Fires when: Network connects or disconnects.

**Case 2: SNAPSHOT_RECEIVED**
```typescript
case 'SNAPSHOT_RECEIVED':
  return { ...state, ...action.payload };
```
Fires when: Server sends you state (on connect + every update).

**Case 3: PARTICIPANT_DONE** (Optional - for learning only)
```typescript
case 'PARTICIPANT_DONE':
  return { ...state, doneBy: [...state.doneBy, action.payload.name] };
```
Fires when: Someone marks themselves done (in this workshop, never actually fired).

---

## Step 3: Test your code

Run the test suite:
```bash
npm test
```

You should see **15 tests pass**. If not, check the error message — it tells you exactly what's wrong.

---

## Step 4: Run the client

In a new terminal window:
```bash
npm run client -- <ngrok-url> <your-name>
```

Example:
```bash
npm run client -- https://abc123.ngrok-free.app william
```

You should see:
```
Connection: [Connected]
Selected:   (none)
Done:       (none)
```

---

## Step 5: Test interactively

Type commands and watch your state update:

```
a         → Select video A
b         → Select video B
done      → Mark yourself as done
lock      → Lock selections (host only)
reset     → Clear everything (host only)
state     → Show current Redux state
help      → Show this menu
```

When you select `a`, your Redux state should update AND broadcast to all other connected clients.

---

## Step 6: Launch full demo (optional)

Run the server and client in separate terminals:

**Terminal 1 (Server):**
```bash
npm run server
```

**Terminal 2 (ngrok tunnel):**
```bash
ngrok http 8765
```
Copy the URL.

**Terminal 3+ (Clients):**
```bash
npm run client -- <ngrok-url> <your-name>
```

Open multiple client windows and watch them sync in real time.

---

# APPENDICES: DEEPER UNDERSTANDING

---

## Appendix: Redux Toolkit vs plain Redux

**What we're using:** Redux Toolkit (@reduxjs/toolkit)

```typescript
// Redux Toolkit (what we use):
import { configureStore } from '@reduxjs/toolkit';
const store = configureStore({
  reducer: yourReducer,
  preloadedState: initialState
});

store.dispatch({ type: 'INCREMENT' });
store.subscribe(() => render());
```

**Redux Toolkit includes:**
- `configureStore()` - sets up store with good defaults
- Middleware for better DevTools
- Better TypeScript support
- createSlice (optional, more advanced)

**Why Redux Toolkit?** It's the official recommended way to use Redux. Simpler setup, better developer experience, same core concepts.

**For React apps:** You'd also use `react-redux` for bindings. Same concepts, just integrated with React components.

---

## Appendix: Slides vs real world

**Redux in a workshop:** reducer + dispatch + subscribe + pure functions

**Redux in production code (using Redux Toolkit):** same concepts, nicer syntax with `createSlice`

**Redux in real projects:** same patterns, scaled to handle all state transitions

---

## Appendix: Complete Solutions

Looking for answers? Here they are.

### Solution #1: CONNECTION_CHANGED

```typescript
case 'CONNECTION_CHANGED':
  return { ...state, connected: action.payload.connected };
```

When the network status changes, update the Redux state to reflect it. That's it!

### Solution #2: SNAPSHOT_RECEIVED

```typescript
case 'SNAPSHOT_RECEIVED':
  return {
    ...state,
    locked: action.payload.locked,
    selectedOption: action.payload.selectedOption,
    doneBy: action.payload.doneBy,
    lastAction: action.payload.lastAction,
    lastBy: action.payload.lastBy,
  };
```

Or more concisely:
```typescript
case 'SNAPSHOT_RECEIVED':
  return { ...state, ...action.payload };
```

When the server sends us state, merge it into our Redux store. The `connected` field is client-only, so it's preserved from the current state.

### Solution #3: PARTICIPANT_DONE (Learning Exercise)

```typescript
case 'PARTICIPANT_DONE':
  return { ...state, doneBy: [...state.doneBy, action.payload.name] };
```

Add a name to the `doneBy` array using spread (immutably [without changing the original array]). Never mutate: `state.doneBy.push(name)` is BAD

**Note:** In this workshop, the server handles the `done` command and broadcasts via SNAPSHOT_RECEIVED. This case is included to practice creating new arrays instead of changing old ones [immutable operations], but it's never actually dispatched.

### How to Verify Your Solutions

Run `npm test` after each implementation. You should see:
```
[PASS] Tests Passed: 15
[PASS] Tests Failed: 0
```

If tests fail, check:
- Are you using spread operator? `{ ...state, ... }`
- Are you returning a new object? Not mutating the old one?
- Does Connection work first? Then Snapshot?

---
