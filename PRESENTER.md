# Presenter Checklist

> **Overview:** 30-minute Redux fundamentals workshop using Redux Toolkit. Students implement 3 reducer cases, see real-time state updates across all clients.

---

## Pre-Workshop (Day Before)

**Setup & Verification:**
- [ ] Clone/download redux-cli-workshop repo
- [ ] Run `npm install` in root directory
- [ ] Run `npm test` — verify all 15 tests pass
- [ ] Run `npm run server` — verify server starts on port 8765
- [ ] Test ngrok: `ngrok http 8765` (install from [ngrok.com](https://ngrok.com) if needed)

**Preparation:**
- [ ] Check [slides.md](slides.md) appendix for solutions (if needed)
- [ ] Skim [slides.md](slides.md) for speaking points (17 slides: 1, 2, 2.5, 3-16)
- [ ] **Choose your teaching mode:** exercise or demo mode

### Switching Between Exercise and Demo Modes

**Default:** `client/index.ts` is the **EXERCISE VERSION** (with TODO stubs for students).

Two versions exist:
- **`client/index.ts`** — Exercise version (students implement TODOs)
- **`client/index.complete.ts`** — Reference implementation (for your demos/checking answers)

**To show the working version to students:**
```bash
# Demo mode - students can see what it should look like
cp client/index.complete.ts client/index.ts
npm run client -- <URL> <name>
```

**To return to exercise mode:**
```bash
# Back to stubs
git checkout client/index.ts
```

---

## Running the Server

Your students will connect via ngrok. You need 3 terminals:

### Terminal 1: Start Redux Server

```bash
npm run server
```

You should see:
```
Listening on ws://localhost:8765
```

### Terminal 2: Expose via ngrok [create a public URL for your local server]

```bash
ngrok http 8765
```

You'll see:
```
Session Status                 online
Forwarding                     https://abc123.ngrok-free.app -> http://localhost:8765
```

**COPY THIS URL:** `https://abc123.ngrok-free.app`

> **Note:** ngrok URLs change each restart [when you stop and start it again]. Use a free account first, then upgrade to custom domain later.

### Terminal 3: Test Client (Optional)

Before students join, test one client:
```bash
npm run client -- https://abc123.ngrok-free.app presenter
```

Verify:
- "Connection: [Connected]" appears
- Type `a`, `done`, `help` all work
- Type `Ctrl+C` to disconnect

---

## Server State & Logging

The server maintains [tracks] the Redux state:
```
{
  locked: false,
  selectedOption: null,     // 'A', 'B', or null
  doneBy: [],               // array of names
  lastAction: null,         // e.g., 'select A'
  lastBy: null              // who triggered it
}
```

Server logs show every client action:
```
[Connected] Client connected (alice)
[send] hello (alice)
[send] select (alice) A
[send] done (alice)
[Connected] Client disconnected (alice)
```

### Troubleshooting Server

**"Address already in use"**
```bash
lsof -ti:8765 | xargs kill -9
npm run server
```

**ngrok connection issues**
- Restart ngrok: kill it, run `ngrok http 8765` again
- Share the new URL with students

---

---

## 30 Minutes Before Workshop

**Terminal Setup:**
- [ ] Open 3 terminals:
  - **Terminal 1:** `npm run server` (keep running)
  - **Terminal 2:** `ngrok http 8765` (keep running, note the https URL)
  - **Terminal 3:** Your test client (close before workshop starts)

**Pre-Flight Test:**
- [ ] Copy ngrok URL (e.g., `https://abc123.ngrok-free.app`)
- [ ] Run: `npm run client -- <ngrok-url> presenter`
- [ ] Verify CLI shows "Connection: [Connected]"
- [ ] Type `help` → see command list
- [ ] Type `a` → see "Selected: A"
- [ ] Type `done` → see "Done: presenter"
- [ ] Disconnect (`Ctrl+C`)
- [ ] Run `reset` in another client OR restart server for clean state

**Share Connection Details:**
- [ ] Write ngrok URL on whiteboard/shared doc/chat
- [ ] Post connection command:
  ```bash
  npm install && npm run client -- <YOUR_NGROK_URL> <your-name>
  ```

---

## During Workshop

### Phase 1: Connect (0–2 min)

- [ ] **Share ngrok URL** with students (chat, screenshare, whiteboard)
- [ ] Have them run: `npm install && npm run client -- <URL> <their-name>`
- [ ] Watch server logs for "Client connected" messages
- [ ] **Wait** until everyone shows "Connection: [Connected]"
- [ ] Quick test: "Everyone type `help` — you should see a command list"

### Phase 2: Slides (2–10 min)

- [ ] **Present slides 1–9** (Redux fundamentals + **data flow explanation**)
  - Slides 1–3: What is Redux? The flow? What's a reducer? Simple counter example (teach first!)
  - Slides 4–5: What problems does it solve? (contrast with traditional)
  - Slides 6–8: Applying Redux to our experiment
  - **Slide 9: Complete data flow** (this is the key - explain before coding!)
- [ ] **Present Slides 10–11** (implementation)
  - Slide 10: The 3 reducer cases they'll implement
  - Slide 11: Dispatch/Actions/Subscribe concepts
- [ ] After Slide 11, pause: "Now it's your turn to code!"
- [ ] Tell students: "Open `client/index.ts` in your editor"
- [ ] Point out: "Find the `reducer()` function — you'll implement 3 cases"

### Phase 3: Coding (12–25 min)

- [ ] **Start 12-minute timer** (adjust based on student pace)
- [ ] Remind them: "Run `npm test` after each case — tests guide you"
- [ ] Circulate/monitor:
  - Ask: "Do you see the reducer function?" "Which case are you on?"
  - Check: "Are your tests passing?"
- [ ] **Offer hints** if stuck:
  - **CONNECTION_CHANGED:** "Use spread operator: `{ ...state, connected: action.payload }`"
  - **SNAPSHOT_RECEIVED:** "Merge server snapshot with spread: `{ ...state, ...action.payload }`"
  - **PARTICIPANT_DONE:** "Append to array immutably: `[...state.doneBy, action.payload]`"
- [ ] When most are done (~12 min), move to demo

### Phase 4: Live Demo (25–30 min)

- [ ] "Let's test your Redux implementation together!"
- [ ] **Everyone types `a`** → point out: "See? Everyone's screen updated!"
- [ ] **Explain:** "You typed `a` → dispatch → reducer → server broadcast → everyone sees it"
- [ ] **Lock demo:**
  - You type: `lock`
  - Everyone sees: "Locked: YES"
  - Tell someone: "Try typing `b`"
  - They see: "Cannot select: experiment is locked"
  - Type `reset` to unlock
- [ ] **Done tracking:**
  - Everyone types: `done`
  - Watch "Done: alice, bob, charlie..." grow in real-time
  - Explain: "This is SNAPSHOT_RECEIVED — server sends full state"
- [ ] **Connect to real-world applications:**
  - "Complex state management often has scattered properties and logic"
  - "Redux = one object, one reducer, automatic updates"
  - "Makes testing easier, debugging easier, adding features easier"

### Phase 5: Q&A (if time)

- [ ] Open floor for questions
- [ ] Common questions:
  - "Do I need Redux for everything?" → No, but good for complex state
  - "What about React-Redux?" → Same concepts, React bindings added
  - "Can I use Redux with our current code?" → Yes, incrementally
  - "Why Redux Toolkit?" → Official recommended way, better DX, same core concepts

---

## Troubleshooting

### Student sees "Connection: ✗ Disconnected"

**Causes & Fixes:**
1. **Server not running** → Check Terminal 1 shows "Listening on ws://localhost:8765"
2. **ngrok not running** → Check Terminal 2 shows "Forwarding https://..."
3. **Wrong URL** → Student used old/incorrect ngrok URL
4. **Firewall** → Rarely, corporate firewall blocks ngrok (have them try phone hotspot)

### "npm test" shows 15 passed but commands don't work

**Cause:** Reducer implemented but not connected to actions  
**Fix:** This shouldn't happen — `client/index.ts` already wires dispatch. If student modified that section, have them review lines 70–80.

### Server shows "Client connected" but no other logs

**Normal!** Server only logs when clients send actions (select, done, lock, reset). If client connected but silent, they're just reading or writing code.

### "Tests failing but I think my code is right"

**Causes:**
- **Mutation:** Tests fail if you modify `state` directly. Must use spread operator.
- **Missing field:** SNAPSHOT_RECEIVED must preserve `connected` (client-only field).
- **Wrong return:** Reducer must return state object, not undefined.

**Fix:** Have them run `npm test` and read the error message carefully.

### ngrok URL keeps changing

**Cause:** Free ngrok restarts each time  
**Fix:** Paid ngrok ($5/mo) gets permanent URL. For free tier, just share new URL when you restart.

### "npm: command not found"

**Cause:** Node.js not installed  
**Fix:** Install from [nodejs.org](https://nodejs.org), then retry `npm install`

---

## Post-Workshop

- [ ] **Shut down processes:**
  - Server: `Ctrl+C` in Terminal 1
  - ngrok: `Ctrl+C` in Terminal 2
- [ ] **Share resources:**
  - Link to slides appendix for solutions
  - Optional: Redux docs ([redux.js.org](https://redux.js.org))
- [ ] **Collect feedback:**
  - "Did you understand reducers?"
  - "What was confusing?"
  - "Would you use Redux in your project?"

---

## Timing Adjustments

**If running short (need to finish in 20 min):**
- Skip Slides 12–13 (Why pure reducers, common mistakes)
- Reduce coding time to 8 min (focus on 1–2 cases)
- Skip lock demo (just do select + done)

**If running long (have extra time):**
- Add 5 min for Q&A
- Extended demo: "What if we add a `timer` field? Where would you track it?"
- Code review: Show server.ts briefly ("This is where state lives")

---

## Success Criteria

Workshop is successful if:
- [PASS] Most students' tests pass (15/15 or close)
- [PASS] Students see their names in shared "Done" list in real-time
- [PASS] At least one student says: "Oh! So Redux = single source of truth?"
- [PASS] Students understand how Redux applies to their own projects

---

Good luck! The workshop is designed to be hands-on and fun. Students learn by doing.
