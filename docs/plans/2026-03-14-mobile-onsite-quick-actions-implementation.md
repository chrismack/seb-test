# Mobile On-Site Quick Actions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add mobile-first quick actions (navigate, call, copy ID, toggle help) and recent locations to reduce on-site task time while preserving existing predictive search.

**Architecture:** Keep the current single-page app and introduce a small state container with a single render pipeline. Extract deterministic helper functions for filtering, recents, and action URL/clipboard behavior so they can be tested independently. Add minimal test tooling (Vitest) and implement incrementally with TDD.

**Tech Stack:** TypeScript, Vite, Material Web, Vitest

---

### Task 1: Add test tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Step 1: Write the failing test command expectation**
Run: `npm run test`
Expected: script missing / command fails

**Step 2: Add minimal tooling configuration**
- Add dev dependency: `vitest`
- Add scripts:
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`
- Add `vitest.config.ts` with a minimal TS-friendly config

**Step 3: Run test command to verify setup**
Run: `npm run test`
Expected: Vitest starts and exits successfully with 0 tests found (or reports no test files)

**Step 4: Commit**
```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest test tooling"
```

### Task 2: Extract pure location helpers with tests

**Files:**
- Create: `src/location-helpers.ts`
- Create: `src/location-helpers.test.ts`
- Modify: `src/index.ts`

**Step 1: Write the failing tests**
Add tests for:
- `filterLocations` matches key/name/location and ignores blank query
- `pushRecentLocation` dedupes and limits to 5
- `buildNavigateUrl` encodes user-visible address safely
- `canCallLocation` returns false when phone missing

**Step 2: Run targeted tests to confirm failure**
Run: `npm run test -- src/location-helpers.test.ts`
Expected: FAIL for missing functions/module

**Step 3: Write minimal helper implementations**
Create `src/location-helpers.ts` with exported pure functions:
- `filterLocations(data, query)`
- `pushRecentLocation(current, id, max = 5)`
- `buildNavigateUrl(location, mapLabel?)`
- `canCallLocation(phone?)`

**Step 4: Refactor app to use helpers**
Modify `src/index.ts` to import and use helper functions while preserving UI behavior.

**Step 5: Re-run targeted tests**
Run: `npm run test -- src/location-helpers.test.ts`
Expected: PASS

**Step 6: Commit**
```bash
git add src/location-helpers.ts src/location-helpers.test.ts src/index.ts
git commit -m "refactor: extract and test location helper logic"
```

### Task 3: Add app state model and recents persistence

**Files:**
- Modify: `src/index.ts`

**Step 1: Write failing tests for state transforms**
Add/extend tests in `src/location-helpers.test.ts` for recent list updates and safe fallback when local storage is unavailable (mock storage adapter behavior at helper level).

**Step 2: Run targeted tests to confirm failure**
Run: `npm run test -- src/location-helpers.test.ts`
Expected: FAIL for missing storage-safe helper(s)

**Step 3: Implement minimal storage-safe helpers**
Add helper(s):
- `readRecentIds(storageLike, key)`
- `writeRecentIds(storageLike, key, ids)`

**Step 4: Integrate into `src/index.ts`**
- Add state object:
  - `query`
  - `filteredResults`
  - `selectedLocationId`
  - `recentLocationIds`
- On selection, update recents via helper and persist best-effort.

**Step 5: Re-run tests**
Run: `npm run test -- src/location-helpers.test.ts`
Expected: PASS

**Step 6: Commit**
```bash
git add src/location-helpers.ts src/location-helpers.test.ts src/index.ts
git commit -m "feat: add state model and recent locations persistence"
```

### Task 4: Render mobile quick-action UI shell

**Files:**
- Modify: `index.html`
- Modify: `src/index.ts`

**Step 1: Write failing UI behavior test (or fallback checklist)**
If DOM test setup is not introduced yet, create an explicit manual acceptance checklist in plan execution notes and proceed with minimal implementation.

**Step 2: Implement quick-action container markup/CSS**
- Add selected-location quick actions region in `index.html`
- Add mobile-first styles:
  - 44px+ touch targets
  - vertical stacking on narrow viewports
  - clear primary vs secondary actions

**Step 3: Wire render logic**
In `src/index.ts`, when a location is selected, render action buttons:
- Navigate
- Call (conditionally enabled)
- Copy ID
- Toggle Help

**Step 4: Verify build**
Run: `npm run build`
Expected: PASS

**Step 5: Commit**
```bash
git add index.html src/index.ts
git commit -m "feat: add mobile quick-action UI shell"
```

### Task 5: Implement action handlers with graceful failure states

**Files:**
- Modify: `src/index.ts`
- Modify: `src/location-helpers.ts`
- Modify: `src/location-helpers.test.ts`

**Step 1: Write failing tests for handler helpers**
Add tests for:
- Navigation URL generation
- Disabled call behavior without phone
- Clipboard helper success/failure return contract

**Step 2: Run targeted tests**
Run: `npm run test -- src/location-helpers.test.ts`
Expected: FAIL for missing/incorrect helper behavior

**Step 3: Implement minimal handler helpers**
- `copyTextToClipboard(navigatorLike, text)` returning `{ ok: boolean }`
- Existing URL/phone helpers reused for UI enablement logic

**Step 4: Integrate handlers into event listeners**
In `src/index.ts`:
- Connect action button click handlers
- Show success/error feedback for each action
- Keep failures non-blocking

**Step 5: Re-run tests + build**
Run:
- `npm run test -- src/location-helpers.test.ts`
- `npm run build`
Expected: PASS for both

**Step 6: Commit**
```bash
git add src/index.ts src/location-helpers.ts src/location-helpers.test.ts
git commit -m "feat: implement quick-action handlers with graceful fallbacks"
```

### Task 6: Add status toggle confirmation and update flow

**Files:**
- Modify: `src/index.ts`
- Modify: `index.html`

**Step 1: Write failing test or acceptance criteria**
Define behavior:
- Status toggle requests confirmation
- On confirm, updates selected item status in memory
- UI chip and detail state update immediately

**Step 2: Implement minimal confirmation flow**
- Add inline confirm UI near toggle action
- Prevent accidental toggles from single accidental taps

**Step 3: Verify behavior and regressions**
Run: `npm run build`
Expected: PASS
Manual check:
- Toggle cancel leaves state unchanged
- Toggle confirm updates state and chip text/style

**Step 4: Commit**
```bash
git add src/index.ts index.html
git commit -m "feat: add confirmed help-status toggle flow"
```

### Task 7: Add recent locations presentation and empty-query behavior

**Files:**
- Modify: `src/index.ts`
- Modify: `index.html`

**Step 1: Write failing test for recents ordering helper**
Add test to assert most-recent-first ordering and dedupe in helper tests.

**Step 2: Run targeted tests**
Run: `npm run test -- src/location-helpers.test.ts`
Expected: FAIL if ordering helper behavior not yet implemented

**Step 3: Implement recent section rendering**
- Show recents when query is empty
- Clicking a recent item opens selected view and actions directly

**Step 4: Verify tests/build**
Run:
- `npm run test -- src/location-helpers.test.ts`
- `npm run build`
Expected: PASS

**Step 5: Commit**
```bash
git add src/index.ts index.html src/location-helpers.test.ts src/location-helpers.ts
git commit -m "feat: show and use recent locations in mobile flow"
```

### Task 8: Final validation and docs update

**Files:**
- Modify: `README.md`

**Step 1: Run full verification**
Run:
- `npm run test`
- `npm run build`
Expected: PASS

**Step 2: Update docs**
Document:
- New quick actions
- Optional data fields (`phone`, `mapLabel`)
- Recents behavior and storage fallback

**Step 3: Manual QA checklist**
- iPhone and Android viewport sizes
- Keyboard open/close interaction
- One-handed reachability for primary action
- Error messages appear without blocking flow

**Step 4: Commit**
```bash
git add README.md
git commit -m "docs: describe mobile quick actions and recents"
```

---

## Notes for Executor
- Keep changes minimal and scoped to this plan.
- Do not introduce backend or sync logic.
- Preserve existing Material 3 tokens and visual language.
- Prefer pure helper functions for all behavior that can be tested.
