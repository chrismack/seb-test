# Mobile On-Site Quick Actions Design

Date: 2026-03-14
Project: Location Finder App
Status: Approved for planning

## Objective
Improve mobile and on-site usability by reducing taps and time-to-action for field users while preserving the existing Material Design 3 search flow.

## Scope
- Build on current single-page TypeScript app
- Keep predictive search behavior
- Add touch-first quick actions for selected locations
- Add recent locations for faster repeat tasks
- Avoid backend dependencies in initial phase

## Chosen Approach
Approach 1: Quick-Action Mobile Card (recommended), with Approach 2 elements (recents/offline-friendly behaviors) as immediate follow-up.

Why:
- Fastest path to operational value
- Lowest architectural risk
- Minimal disruption to existing code and UX patterns

## Architecture
- Maintain SPA structure in `src/index.ts`
- Use explicit presentation states:
  - `search`
  - `results`
  - `selected-location-quick-actions`
- Introduce lightweight client state:
  - `query`
  - `filteredResults`
  - `selectedLocationId`
  - `recentLocationIds`
- Persist recents in `localStorage` only

## UX and Components
1. Search Header
   - Existing `md-filled-text-field`
   - Show a recent-location row when query is empty

2. Result List
   - Compact mobile cards for each result
   - Includes title, location, status chip, and one primary CTA

3. Quick Actions Bar (selected location)
   - Large touch targets (44px+):
     - Navigate
     - Call (if available)
     - Copy ID
     - Toggle Help Status

4. Confirmation and Feedback
   - Inline confirm for status change action
   - Snackbar/toast feedback for copy/update/failure events

## Data Model Changes
Current location shape:
- `name`
- `location`
- `help`

Optional additions (non-breaking):
- `phone?: string`
- `mapLabel?: string`

## Data Flow
1. Input updates `query`
2. Filter pipeline computes results
3. Selecting result updates `selectedLocationId`
4. Selection updates recents (dedupe + max 5)
5. UI re-renders from state through a single render entrypoint

Action handlers:
- Navigate: open encoded map URL from `location`/`mapLabel`
- Call: open `tel:` URI if `phone` exists
- Copy ID: clipboard API + fallback
- Toggle Help: guarded action with confirm step, then state update

## Error Handling
- No matches: existing no-results empty state
- Missing phone/location: disable related action with clear text
- Action failures (clipboard/map/tel): non-blocking error toast
- `localStorage` unavailable: continue with no recents

## Testing Strategy
Unit-level:
- Filtering logic
- Recent IDs dedupe/limit logic
- URL builder helpers

Interaction-level:
- Selecting a result reveals actions
- Disabled actions for missing data
- Help toggle confirmation and update feedback

Manual mobile QA:
- iOS and Android viewport checks
- Keyboard open/close flow
- One-handed reachability for primary actions

## Non-Goals (Initial Iteration)
- Backend persistence
- Multi-user sync
- Incident-mode split UX
- Full PWA offline caching

## Risks and Mitigations
- Risk: Action overload on small screens
  - Mitigation: one primary action in card; secondary actions in selected state
- Risk: Accidental status changes
  - Mitigation: confirmation step before state-changing action
- Risk: Incomplete contact data
  - Mitigation: optional fields with graceful disabled actions

## Rollout Plan (High Level)
1. Add state and render structure for selected/recent flows
2. Implement quick action handlers with fallbacks
3. Adjust mobile-first layout and touch targets
4. Add focused tests and manual mobile validation

## Approval Log
- Architecture and interaction model approved
- Components and UX rules approved
- Data flow, error handling, and testing approach approved
