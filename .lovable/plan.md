

## Plan: Convert Non-USD Budgets to US Dollars

Update the three movies with budgets stored in their local currencies to approximate USD values using historical exchange rates.

### Data Updates (via insert tool)

| Movie | Current Budget | Currency | Approx USD |
|-------|---------------|----------|------------|
| Princess Mononoke (1997) | 2,400,000,000 | JPY | 23,500,000 |
| 3 Idiots (2009) | 550,000,000 | INR | 12,000,000 |
| Seven Samurai (1954) | 125,000,000 | JPY | 350,000 |

Three `UPDATE` statements against the `movies` table to set the corrected `budget` values.

