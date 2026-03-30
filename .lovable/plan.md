

## Plan: Show Movie Titles in Stacked Bar Tooltips

Update the tooltip in `BudgetYearChart.tsx` to list all movie titles that belong to the hovered genre+decade segment.

### Changes (single file: `src/components/BudgetYearChart.tsx`)

1. Store the `processed` array in a way accessible to the tooltip event handler (it's already in scope).
2. In the `mouseenter` handler, filter `processed` to find movies matching the hovered decade range and genre.
3. Update the tooltip HTML to include a list of movie titles (with their individual budgets), below the existing decade/genre/total line.
4. Increase tooltip max-width/max-height with overflow scroll for decades with many movies.

