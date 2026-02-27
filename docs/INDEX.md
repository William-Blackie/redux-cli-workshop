# Redux CLI Workshop — Complete Project Index

## Quick Navigation

**For Students:**
- [README.md](../README.md) — Start here! Student quick-start guide
- [slides.md](../slides.md) — Teaching slides (Slides 1–8 before coding)
- [TESTING.md](TESTING.md) — How to run tests while coding
- [SOLUTIONS.md](SOLUTIONS.md) — Answers (reference after workshop)

**For Instructors:**
- [INSTRUCTOR.md](INSTRUCTOR.md) — Pre-workshop checklist & troubleshooting
- [HOST_INSTRUCTIONS.md](HOST_INSTRUCTIONS.md) — How to run server + expose with ngrok
- [REVIEW.md](REVIEW.md) — Code quality & design decisions

---

## Project Structure

```
redux-cli-workshop/
├── 📄 README.md              ← Student quick-start
├── 📄 slides.md              ← Teaching presentation
├── 📦 package.json          ← Dependencies + scripts
├── 📝 tsconfig.json         ← TypeScript config
├── 📂 client/
│   ├── index.ts           ← YOUR FILE (reducer cases here)
│   ├── index.complete.ts  ← Complete version (for instructors)
│   ├── index.exercise.ts  ← Exercise version with TODOs (for students)
│   ├── realtime.ts        ← WebSocket abstraction (read-only)
│   └── reducer.test.ts    ← 15 tests (run: npm test)
├── 📂 server/
│   └── server.ts          ← WebSocket server (instructor runs)
└── 📂 docs/
    ├── INDEX.md           ← You are here!
    ├── INSTRUCTOR.md      ← Workshop checklist
    ├── HOST_INSTRUCTIONS.md ← Server setup guide
    ├── SOLUTIONS.md       ← Complete answers
    ├── TESTING.md         ← Test documentation
    └── REVIEW.md          ← Design decisions
```

> **Note for Instructors:** The `client/` folder contains three versions:
> - `index.ts` — Default (currently complete version)
> - `index.complete.ts` — Fully implemented (for demos)
> - `index.exercise.ts` — TODO stubs only (for student exercises)
> 
> Use `mv` commands to switch between modes. See [INSTRUCTOR.md](INSTRUCTOR.md) for details.

---

## What To Do Now

### If You're a Student

1. **Read** [README.md](../README.md) (2 min)
   - Understand the workshop goal
   - See what commands you'll run

2. **Wait** for instructor to share ngrok URL + run:
   ```bash
   npm install
   npm run client -- <URL> <your-name>
   ```

3. **Follow slides** [slides.md](../slides.md) (10 min)
   - Understand Redux concepts (Slides 1–8)
   - Stop at "Slide 9: Your 3 reducer cases"

4. **Code** the 3 reducer cases in `client/index.ts` (12 min)
   - Implement CONNECTION_CHANGED, SNAPSHOT_RECEIVED, PARTICIPANT_DONE
   - Use `npm test` to verify each one

5. **Demo** with instructor (5 min)
   - Type `a`, `done`, watch everyone's screen update
   - See Redux in action 🎉

6. **After workshop**, review [SOLUTIONS.md](SOLUTIONS.md) to compare your code

---

### If You're an Instructor

1. **Prep** your machine (day before)
   ```bash
   npm install
   npm test                     # verify all 15 tests pass
   npm run server              # test server starts (port 8765)
   ngrok http 8765             # test ngrok works
   ```

2. **Review** [INSTRUCTOR.md](INSTRUCTOR.md) checklist

3. **On workshop day** (30 min before)
   - Start 3 terminals: server, ngrok, your client
   - Test one student connection
   - Write ngrok URL somewhere visible

4. **During workshop**
   - Get students to connect
   - Present slides 1–4
   - Monitor students while they code (hint: `npm test`)
   - Run live demo

5. **After workshop**
   - Share [SOLUTIONS.md](SOLUTIONS.md)
   - Collect feedback

---

## Architecture At a Glance

```
┌──────────────────────────────────────────────────────┐
│     Redux Workshop System Architecture               │
└──────────────────────────────────────────────────────┘

CLIENT (Your Browser/Terminal)
┌──────────────────────────────────────────────────────┐
│ client/index.ts                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │ Redux Store:                                   │   │
│ │   { locked, selectedOption, doneBy, ... }      │   │
│ │                                                │   │
│ │ reducer(state, action) → // 3 cases            │   │
│ │   • CONNECTION_CHANGED                         │   │
│ │   • SNAPSHOT_RECEIVED                          │   │ 
│ │   • PARTICIPANT_DONE                           │   │ 
│ │                                                │   │
│ │ dispatch → reducer → state → render()          │   │
│ └────────────────────────────────────────────────┘   │
│                         ↓                            │
│               [ No WebSocket visible ]               │
│ client/realtime.ts (abstraction layer)               │
│  • Hides WebSocket details                           │
│  • Normalizes URLs (ws:// ↔ wss://)                  │
│  • Calls dispatch() on network updates               │
└──────────────────────────────────────────────────────┘
                         ↓
                   [ ngrok tunnel ]
                         ↓
SERVER (Instructor's Machine)
┌──────────────────────────────────────────────────────┐
│ server.ts (port 8765)                                │
│ ┌────────────────────────────────────────────────┐   │
│ │ WebSocket Server                               │   │
│ │ Shared state: { locked, selectedOption, doneBy}│   │
│ │                                                │   │
│ │ On client action:                              │   │
│ │   • Update state                               │   │
│ │   • Broadcast snapshot to ALL clients          │   │
│ │                                                │   │
│ │ Clients receive → dispatch() → update screen ✓ │   │
│ └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Why This Matters

Complex applications often have:
```typescript
locked: boolean  ┐
selectedOption: 'A' | 'B' | null ├─ Scattered across class
hasViewed: boolean[] ┘

// All over the place:
if (this.locked) return;
this.selectedOption = choice;
this.enableSubmit();  // depends on locked
```

With Redux (what this workshop teaches):
```typescript
state = {
  locked: boolean,
  selectedOption: 'A' | 'B' | null,
  hasViewed: boolean[]
}

// All transitions in one place:
reducer(state, action) → new state
subscribe() → render()  // automatic
```

**Redux scales:** Add 10 more properties? Add 10 reducer cases. No scattered logic. Testable. Predictable.

---

## File Purposes

| File | Purpose | Audience | Status |
|------|---------|----------|--------|
| `README.md` | Student guide | Students | ✓ Read First |
| `slides.md` | Teaching presentation | Everyone | ✓ Follow Along |
| `SOLUTIONS.md` | Answer key | Instructors & later | ✓ After Workshop |
| `TESTING.md` | Test documentation | Students during coding | ✓ Reference |
| `INSTRUCTOR.md` | Pre-/during workshop checklist | Instructors | ✓ Day Before |
| `HOST_INSTRUCTIONS.md` | Server + ngrok setup | Instructors | ✓ Setup Phase |
| `REVIEW.md` | Code quality & decisions | Code reviewers | ✓ Reference |
| `client/index.ts` | Your coding exercise | Students | ✓ DO THIS |
| `client/realtime.ts` | Networking abstraction | Reference only | ✓ Read-Only |
| `client/reducer.test.ts` | Tests for reducer | Students (run `npm test`) | ✓ Validation |
| `server.ts` | WebSocket server | Instructors | ✓ Run It |
| `package.json` | Dependencies & scripts | Both | ✓ Configured |
| `tsconfig.json` | TypeScript settings | Both | ✓ Configured |

---

## How to Use Different Documents

### "I just landed and need to understand the project"
→ Read this file (INDEX.md), then [README.md](README.md)

### "I'm a student ready to code"
→ [README.md](README.md) → [slides.md](slides.md) (first 4 slides) → `client/index.ts` (review 3 reducer cases)

### "I'm an instructor getting ready tomorrow"
→ [INSTRUCTOR.md](INSTRUCTOR.md) checklist

### "Something broke during the workshop"
→ [INSTRUCTOR.md](INSTRUCTOR.md) troubleshooting section

### "I want to understand the code design"
→ [REVIEW.md](REVIEW.md)

### "I want to see what the answers should be"
→ [SOLUTIONS.md](SOLUTIONS.md)

### "I want to know how tests work"
→ [TESTING.md](TESTING.md)

---

## Key Concepts Hierarchy

```
Level 1: What is Redux?
  → slides.md (Slides 1–3)
  → "Single source of truth" for state management

Level 2: How does Redux work?
  → slides.md (Slides 4–7)
  → action → reducer → state → render

Level 3: Why is Redux good?
  → slides.md (Slides 9–11)
  → Pure functions = testable & predictable
  → Tests prove correctness (run: npm test)

Level 4: How do I use it?
   → client/index.ts reducer cases
   → Implement or review the 3 cases

Level 5: Why use Redux?
  → Redux solves real state management challenges
  → Cleaner than scattered properties in large applications
```

---

## Success Checklist

After workshop, you should be able to:

- [ ] Explain what an action is ("event that happened")
- [ ] Explain what a reducer is ("pure function: state + action → new state")
- [ ] Explain dispatch ("send action to reducer")
- [ ] Explain subscribe ("listen for state changes")
- [ ] Write a reducer case (did your code in the reducer cases)
- [ ] Run tests and understand failures (`npm test`)
- [ ] Tie Redux back to state management challenges ("instead of scattered properties")
- [ ] See why immutability matters ("Redux detects changes via object equality")
- [ ] Understand pure functions ("same input = same output, testable")

If you check all these, you've learned Redux fundamentals! 🎉

---

## Next Steps (Beyond This Workshop)

1. **Real-world Redux** uses Redux Toolkit (simplified syntax with `createSlice`)
2. **Side effects** happen in middleware (thunks, sagas) — separate from reducers
3. **Async actions** (fetching data) — beyond this intro
4. **Dev tools** — time-travel debugging, action replay
5. **Apply to your projects** — refactor class properties → Redux state machine

For now, you've got the foundation. Reducers are pure. Dispatch is simple. Subscribe is automatic. That's 80% of Redux!

---

## Questions or Feedback?

- **During workshop**: Ask instructor (they have context)
- **After workshop**: Review [SOLUTIONS.md](SOLUTIONS.md) + [TESTING.md](TESTING.md)
- **For bugs**: Check [REVIEW.md](REVIEW.md) "Known Issues" section
- **For setup help**: Check [INSTRUCTOR.md](INSTRUCTOR.md) troubleshooting

---

**Ready?** Go to [README.md](README.md) if you're a student, or [INSTRUCTOR.md](INSTRUCTOR.md) if you're teaching.

See you in 30 minutes! 🚀
