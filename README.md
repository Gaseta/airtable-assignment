# Airtable Timeline — README

## What I like about this implementation

- **Clean separation of concerns**  
  - `lib/assignLanes` is pure and testable.  
  - `utils/date` isolates date math.  
  - `hooks/` for UI behaviors (tooltip on truncation, floating editor, domain calc).  
  - `components/Timeline/*` keeps rendering logic small and composable.

- **Editing UX that respects layout constraints**  
  - **Inline edit** when the label fits.  
  - **Floating editor via Portal** when the label is truncated, so it never gets clipped by item overflow or scroll containers.

- **Zoom that only affects the timeline**  
  `pxPerDay` scales left/width and canvas width, leaving the toolbar/gutter stable.

- **No heavy timeline lib**  
  Intentional choice to demonstrate reasoning about layout, events and a11y, not just a wrapper over a 3rd-party renderer.


## What I would change if doing it again

1. **Axis scale & ticks**  
   Add monthly/weekly ticks with sticky headers and smart labeling at different zoom levels.

2. **Keyboard accessibility**  
   - Keyboard drag/resize (arrow keys to nudge by day/week).  
   - Focus states, ARIA live updates (e.g., “Start moved to 2021-02-05”).

3. **Constraint engine / snapping**  
   Optional snap to weeks/months/business days. Rules like “cannot end before dependent begins”.

4. **TypeScript**  
   Add strict types for Items, Lanes, hooks, and events; improves refactors and catching edge cases early.

5. **Auto-scroll on drag**  
   When dragging near container edges, scroll the scroller automatically.


## How I made the design decisions

- **Lane packing**  
  Chose a greedy strategy that’s easy to reason about and meets “compact, space-efficient lanes” without overengineering. It’s a classic interval scheduling flavor and aligns with typical Gantt/timeline behaviors.

- **Zoom & layout math**  
  Used a single scalar (`pxPerDay`) to derive `left` and `width` and a fixed CSS gutter. This keeps the mental model simple and reduces surprises.

- **Inline vs floating editor**  
  Observed common frustrations with native `title` tooltips and clipped popovers. The portal-based floating editor ensures the field is always visible and focused, while inline editing preserves the quick “rename on spot” feel for non-truncated labels.

- **Inspiration**  
  Took cues from:
  - Roadmap/Gantt UIs (Linear/Asana/Jira) for direct manipulation and pill styling.
  - Figma/Design tools for resize handles and lightweight “selection” feedback.
  - Airtable’s clarity and spacing for a light, readable look.


## How I would test this with more time

### Unit tests
- **`assignLanes`**  
  - Non-overlapping items collapse to one lane.  
  - Overlapping items distribute across lanes.  
  - Boundary conditions: same-day start/end, touching intervals (end == next start).  
  - Stability: sorting tie-breakers (start equal → end order).
- **`utils/date`**  
  `parseDay` and `toISO` are inverses across a range; leap years; month boundaries.

### Integration tests (component-level)
- **TimelineItem**  
  - Inline edit flow: double-click, type, enter/escape/blur behaviors.  
  - Truncated-name flow: detect truncation, open floating editor, commit/cancel.  
- **Drag/resize**  
  - Drag body moves both start and end.  
  - Resize handles clamp correctly (start ≤ end).  
  - Zoom scaling respected (1px → fractional day rounding).  
  - Emits correct date strings and reassigns lanes correctly after changes.

### E2E (Playwright/Cypress)
- **Zoom in/out**  
  Items widen/narrow proportionally; canvas width updates; scroll remains usable.
- **Tooltip/editor portals**  
  Ensure they render above scroll containers and aren’t clipped; verify auto-close on scroll/resize.
- **Keyboard a11y**  
  Tabbing through items, focus styles visible; arrow-key nudge (once implemented).
- **Persistence**  
  If wired to storage or API: optimistic updates, failure states, retry/backoff.

### Performance
- Profile drag and zoom at 1k–10k items with the DevTools Performance panel.  
- Verify no unnecessary re-renders (React DevTools “highlight updates”).

---

## Other Notes
- The drag-and-drop feature implementation is not fully complete yet (due to time constraints), so its behavior may be inconsistent.
- There is a known issue with tooltips and edit tooltips for items located on the right edge of the screen. Due to time constraints, it was not addressed.

## Running locally

```bash
npm instal
npm start
