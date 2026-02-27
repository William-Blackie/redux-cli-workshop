# Redux Workshop: 30-Minute Proof of Concept

Learn Redux fundamentals by building a shared experiment state manager [a library that keeps track of app data in one place]. When you run the client, your changes appear on everyone's screen in real-time.

**Using Redux Toolkit:** We use `@reduxjs/toolkit` - the official, recommended way to use Redux in production. You'll learn real-world Redux patterns.

## Quick Start (Students)

The presenter will give you a URL like: `https://abc123.ngrok-free.app`

```bash
# Install dependencies
npm install

# Connect to shared experiment
npm run client -- https://abc123.ngrok-free.app alice
```

You'll see:
```
  +==========================================+
  |    Redux Video Experiment Session       |
  +==========================================+

  Connection: [Connected]
  Locked:     NO
  Selected:   (none)
  Done:       (none)
  Last:       (none)

  Commands: a | b | done | lock | reset | help

  >  
```

Then follow **[slides.md](slides.md)** (takes ~30 minutes):

1. Read slides 1–9 to understand Redux and data flow (the presenter presents these)
2. At slide 11, open `client/index.ts`
3. Find the 3 TODOs in the `reducer()` function
4. Implement them (~5 minutes)
5. Run `npm test` to verify (all 15 tests should pass)
6. Return to the workshop for the live demo

## Know the Answers?

Check the **[slides.md appendix](slides.md#appendix-complete-solutions)** for complete solutions.

## Commands

Type these in your client:

| Command | What it does |
|---------|-------------|
| `a` | Select option A |
| `b` | Select option B |
| `done` | Mark yourself done (name appears to everyone) |
| `lock` | Lock selections (host only, prevents a/b) |
| `reset` | Reset state (host only, clears everything) |
| `help` | Show available commands |
| `state` | Print current Redux state object |

## Architecture

```
You (Redux Client)
  | (you type "a")
realtime.ts (WebSocket abstraction)
  | (sends to presenter's server)
Presenter's Machine (port 8765)
  | (broadcasts state to everyone)
Everyone (receives state, dispatch, render)
```

## What You're Learning

**Production Redux with Redux Toolkit**

You'll use `@reduxjs/toolkit` - the same tools used in real projects.

Key concepts:
- **Store**: One object holds all state [data]: `{ selectedOption, locked, doneBy, ... }`
- **Reducer**: Pure function [same input = same output] computes new state: `(state, action) → new state`
- **Dispatch**: Send actions to trigger updates: `store.dispatch({ type: 'SELECT', payload: 'A' })`
- **Subscribe**: Auto-update UI when state changes: `store.subscribe(() => render())`

**Why it matters:** As state grows (10+ properties, dependencies [relationships between data]), Redux keeps it predictable and testable.

**After this workshop:** You'll know how to use Redux in React apps, Node.js apps, or any JavaScript project.

## Presenter Setup

See [PRESENTER.md](PRESENTER.md) for:
- Server setup (3 terminals: server, ngrok, test client)
- How to switch between exercise mode (students code) and demo mode (show working code)
- Workshop timing and troubleshooting
- All the solutions

```
a               - Select video A
b               - Select video B
done            - Mark yourself done
lock            - Lock selection (host only)
reset           - Reset state (host only)
help            - Show this menu
```

## What You'll Learn

- **Actions** = events that happen [like "button clicked" or "server sent update"] ("CONNECTION_CHANGED", "SNAPSHOT_RECEIVED")
- **Reducers** = pure functions [same input = same output] that compute new state
- **Dispatch** = send an action to the reducer
- **Subscribe** = automatically re-render when state changes
- **Pure functions** = same input always produces same output (testable [easy to verify correctness]!)

## File Structure

```
redux-cli-workshop/
├── README.md (you are here)
├── slides.md (presentation)
├── package.json
├── client/
│   ├── index.ts (YOUR FILE: reducer cases live here)
│   └── realtime.ts (magic module: hides WebSocket details)
├── server/
│   └── server.ts (instructor runs this; students don't touch)
└── docs/
    ├── HOST_INSTRUCTIONS.md (server setup)
    ├── INSTRUCTOR.md (workshop checklist)
    ├── SOLUTIONS.md (answers)
    └── TESTING.md (test guide)
```

## Architecture

```
You type "a"
  |
realtime.select('A') sends to server
  |
server broadcasts snapshot to all clients
  |
realtime.ts receives snapshot
  |
dispatch({ type: 'SNAPSHOT_RECEIVED', payload: snapshot })
  |
reducer computes new state
  |
subscribe() prints state to CLI
```

## Class-Based vs Redux Approach

**Traditional class-based (imperative):**
```typescript
select(choice) {
  if (this.locked) return;           // Scattered conditionals
  this.selectedOption = choice;      // Direct mutation
  this.interface.select(choice);     // Manual UI update
  if (this.hasViewed[0]) this.enableSubmit();  // Dependent logic
}
```

As features grow, tracking which properties affect others becomes challenging.

**With Redux (declarative):**
```typescript
// User action
dispatch({ type: 'SELECT', payload: 'A' });

// Reducer (pure function)
case 'SELECT':
  return { ...state, selectedOption: payload };

// That's it! Every place state is used subscribes to updates.
```

Add a new constraint (max selections)? Add one reducer case. Update the UI? Render subscribes automatically.

---

**Questions?** See [PRESENTER.md](PRESENTER.md) or ask the presenter.
