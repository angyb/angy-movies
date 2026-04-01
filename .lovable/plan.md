

## Plan: Add Genre Multi-Select Filter to Budget Treemap

### What
A multi-select dropdown above the treemap that filters movies by genre. Only affects the treemap, not the histogram. OR logic: a movie shows if it matches any selected genre.

### Changes

**`src/components/BudgetTreemap.tsx`**

1. Extract unique genres from all movies (split comma-separated genre strings, deduplicate, sort alphabetically).
2. Add state: `selectedGenres: string[]` (empty = show all).
3. Add a Popover+Command-based multi-select dropdown above the treemap (using existing shadcn Popover, Command, Badge, and Checkbox components) showing all genres with checkboxes.
4. Filter `moviesWithBudget` before passing to d3 treemap: if `selectedGenres` is non-empty, include only movies where at least one of their genres is in the selection.
5. Show selected genre count in the trigger button; show badge chips for selected genres with an "x" to remove.

### UI Layout
```text
[Filter by Genre ▼] [Drama ×] [Action ×]     <- filter bar
┌─────────────────────────────────────────┐
│           Treemap visualization         │
└─────────────────────────────────────────┘
```

No new files needed. Single file edit to `BudgetTreemap.tsx`.

