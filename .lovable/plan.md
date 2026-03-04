

## Plan: Refine My Work Section

### Current State
- **Work tab**: Uses plain `ItemEditor` (HTML input) for task creation. Shows tasks assigned to user across team artists. Already auto-assigns to user and supports no-artist tasks.
- **Notes tab**: Desktop shows split panel (240px sidebar + detail). Mobile already uses two-step (list → detail). TipTap is already used for note editing. Sharing is already implemented.

### Changes Needed

**1. Notes: Convert to two-step flow on all screen sizes**
- `src/components/notes/NotesPanel.tsx`
- Remove the desktop split-panel layout. Always show either the full-width list view OR the full-width note detail (same pattern currently used on mobile).
- List view: full-width cards with auto-generated preview (strip HTML, show first ~80 chars), timestamp, pinned indicator, share icon.
- Clicking a note navigates to the detail view with back button, title, TipTap editor, toolbar, pin/share/delete actions.
- New note button creates a note and immediately opens the detail view.

**2. Work tab: Add TipTap to task items for rich descriptions**
- Keep the existing `ItemEditor` for the task title input (it handles @, $, date triggers well as a single-line input).
- Add an expandable TipTap-powered description/body area when a task row is clicked or expanded, following the pattern from the artist Work tab (`TasksTab.tsx`).
- This allows tasks to have rich-text notes/descriptions while keeping the quick-add flow intact.

**3. Files to modify**
- `src/components/notes/NotesPanel.tsx` — Remove split-panel, unify to two-step list→detail flow for all screen sizes.
- `src/pages/MyWork.tsx` — Add expandable task detail with TipTap description editor. Minor layout adjustments for the new notes flow (remove conditional max-width since notes are now full-step).

