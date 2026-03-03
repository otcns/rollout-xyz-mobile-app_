

Restore the `trialWelcomeOpen` state in `src/pages/Roster.tsx` back to the localStorage-based show-once logic that was removed in the last diff.

**Change**: Revert line 75 from `useState(true)` back to the original localStorage check.

