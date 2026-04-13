# Circuit Builder Session 3 — Polish & New Features

## What's Already Working (Sessions 1-2)
- Tap-to-place and drag-and-drop gate placement
- Multi-qubit gate rendering (CNOT/CZ/SWAP/Toffoli)
- 1-4 qubit state vector simulator with step-through
- Math panel with matrix × vector equations
- 1000-shot measurement histogram
- Parameterized rotation gates (Rx/Ry/Rz) with angle popup
- 8 preset circuits with dropdown loader
- Clear with inline confirmation
- Auto-save last circuit to localStorage
- Gate unlock progression (Ch 11-14)

---

## Session 3 Features

### 3a. Keyboard Shortcuts (desktop)

**File:** `circuit-ui.js`

Add a `keydown` listener on `document` inside `mountSandbox`, cleaned up on unmount.

| Key | Action | Guard |
|-----|--------|-------|
| `ArrowLeft` | `stepBack()` | Not at step 0 |
| `ArrowRight` | `stepForward()` | Not past last gate |
| `Home` | `goToStart()` | — |
| `End` | `goToEnd()` | — |
| `Space` | `showHistogram()` (Run 1000x) | `preventDefault` to avoid page scroll |
| `Backspace` / `Delete` | Remove last placed gate | Circuit not empty |
| `Escape` | Cancel CNOT pending mode or close angle popup | Only when active |

**Key detail:** Only handle keys when no angle popup input is focused (check `document.activeElement`). Clean up listener in `cleanupFns`.

---

### 3b. Grid Horizontal Scroll with Fade Indicator

**Files:** `circuit-ui.js`, `style.css`

The grid already scrolls (`overflow-x: auto` on `.circuit-grid-wrap`), but there's no visual cue that more content exists off-screen.

**CSS approach — pseudo-element fade gradients:**
```css
.circuit-grid-wrap {
  position: relative;
}
.circuit-grid-wrap::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; width: 32px;
  background: linear-gradient(to right, transparent, var(--bg));
  pointer-events: none;
  opacity: 0;
  transition: opacity 200ms;
}
.circuit-grid-wrap.has-scroll-right::after {
  opacity: 1;
}
```

**JS:** On `scroll` event and after render, check if `scrollLeft + clientWidth < scrollWidth - 4`. Toggle `.has-scroll-right` class. Also add `.has-scroll-left` with a left fade if scrolled past 0.

**Auto-scroll on gate placement:** When a gate is placed near the right edge (last 2 visible slots), auto-scroll the grid right by one slot width to keep the working area visible.

---

### 3c. Named Circuit Saves

**Files:** `circuit-ui.js`, `style.css`

Current state: auto-saves `lastCircuit` to localStorage. The spec calls for explicit named saves.

**Save button in toolbar:**
Change toolbar from `[Presets ▼] [Clear]` to `[💾 Save] [Presets ▼] [🗑 Clear]`.

**Save flow:**
1. Tap Save → prompt with small inline input: "Circuit name:" + text field + OK/Cancel
2. Serializes circuit via `circuit.serialize()` 
3. Stores to `state.sandbox.savedCircuits` array: `{ name, json, date }`
4. Shows toast "Saved: {name}"
5. Max 20 saved circuits (oldest dropped on overflow)

**Load flow:**
- Saved circuits appear in the Presets dropdown below the built-in presets, separated by a `<optgroup>` divider: "── Your Circuits ──"
- Each saved circuit shows name + date
- Selecting loads it like a preset

**Delete saved circuit:**
- Long-press or right-click on a saved circuit in dropdown? Too complex for a `<select>`.
- Instead: add a "Manage Saves" option at bottom of dropdown. Opens a simple list overlay with delete (×) buttons next to each saved circuit.

**Data shape in localStorage:**
```js
state.sandbox = {
  lastCircuit: "...",          // existing — auto-saved JSON string
  savedCircuits: [             // new — array of named saves
    { name: "My Bell State", json: "...", date: "2026-04-13" },
    ...
  ]
}
```

**State merge:** Add `savedCircuits: []` to `DEFAULT_STATE.sandbox` and merge in `loadState()`.

---

### 3d. Toast Notifications

**Files:** `circuit-ui.js`, `style.css`

Import `showToast` from `experiment-ui.js` and use it for feedback throughout the sandbox.

**Toast triggers:**
| Event | Message | Type |
|-------|---------|------|
| Gate collision on placement | "Slot occupied" | error |
| Qubit out of range | "Qubit out of range" | error |
| Circuit saved | "Saved: {name}" | success |
| Circuit cleared | "Circuit cleared" | info |
| Preset loaded | "Loaded: {preset name}" | info |
| CNOT target = control | "Target must be a different wire" | error |
| Toffoli needs 3+ qubits | "Toffoli needs at least 3 qubits" | error |

**Implementation:** Wrap existing `try { circuit.addGate(...) } catch (err) {}` blocks to catch specific errors and show toasts instead of silently swallowing.

---

### 3e. Gate Placement & Removal Animations

**Files:** `circuit-ui.js`, `style.css`

**Gate placement animation:**
```css
@keyframes gatePlace {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.circuit-gate.just-placed {
  animation: gatePlace 200ms ease-out;
}
```
After `addGate()`, mark the new gate element with `.just-placed` class. Remove class after animation ends.

**Gate removal animation:**
```css
@keyframes gateRemove {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0); opacity: 0; }
}
.circuit-gate.removing {
  animation: gateRemove 150ms ease-in forwards;
}
```
Before actually removing from `circuit.gates`, add `.removing` class, wait 150ms, then remove. This requires a slight refactor of `handleGateTap` to be async.

**Drag cancel snap-back:**
When a drag is dropped on an invalid area, animate the floating gate back to its origin position over 200ms, then remove it. Currently it just vanishes.

---

### 3f. Landscape Split Layout

**Files:** `style.css`

The spec defines a split layout for landscape on wider screens: circuit grid on the left (2/3), state+math+histogram stacked on the right (1/3) with a border divider.

**Current:** Everything stacks vertically — grid on top, state/math/controls below. This works but wastes horizontal space on landscape iPad.

**CSS media query:**
```css
@media (min-width: 900px) and (orientation: landscape) {
  .circuit-main {
    flex-direction: row;
  }
  .circuit-grid-wrap {
    flex: 2;
    border-right: 1px solid var(--border);
  }
  .circuit-info-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
}
```

**DOM change:** Wrap `.state-display`, `.math-panel`, `.step-controls` in a new `.circuit-info-panel` div so they can be flexed as a group.

**Portrait stays the same** — vertical stack.

---

## Files to Modify

| File | Changes |
|------|---------|
| `circuit-ui.js` | Keyboard shortcuts, scroll indicator logic, save flow, toast integration, placement animations, info panel wrapper div |
| `style.css` | Scroll fade gradients, save name input, manage saves overlay, gate animations, landscape split layout |
| `app.js` | Add `savedCircuits` to DEFAULT_STATE merge, bump import versions |
| `index.html` | Cache bump |

## Implementation Order

1. **Toast system** — import `showToast`, add to all error catch blocks (quick win, improves all other features)
2. **Keyboard shortcuts** — `keydown` listener with guards
3. **Grid scroll indicator** — CSS fade + JS scroll listener
4. **Gate animations** — CSS keyframes + `.just-placed` / `.removing` class logic
5. **Named saves** — save button, name input, localStorage, dropdown integration, manage overlay
6. **Landscape split layout** — wrap info panel div, add media query
7. **Cache bump + verify**

## Verification Checklist

- [ ] Press Right Arrow → steps forward, Left Arrow → steps back
- [ ] Home/End → jump to start/end
- [ ] Space → triggers Run 1000x histogram
- [ ] Escape → cancels CNOT pending mode
- [ ] Delete → removes last gate
- [ ] Build circuit past 6 slots → right fade gradient appears
- [ ] Scroll left → left fade appears, right fade disappears at end
- [ ] Place gate near right edge → grid auto-scrolls
- [ ] Place gate → brief scale-up animation
- [ ] Tap gate to remove → shrinks and fades before disappearing
- [ ] Place gate on occupied slot → "Slot occupied" toast
- [ ] CNOT target = same as control → toast error
- [ ] Tap Save → name input appears → type name → OK → toast "Saved: name"
- [ ] Saved circuit appears in Presets dropdown under "Your Circuits"
- [ ] Select saved circuit → loads correctly
- [ ] "Manage Saves" → overlay with delete buttons → delete works
- [ ] iPad landscape (wider than 900px) → grid left, info panel right
- [ ] iPad portrait → vertical stack (unchanged)
- [ ] Navigate away and back → saved circuits persist
