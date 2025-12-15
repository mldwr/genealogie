# N+1 Query Performance Fix: `/deport` Route

**Date:** 2025-12-15
**Affected Files:** `app/deport/TableClient.tsx`, `app/deport/data.ts`

---

## 1. Problem Description

### Observed Behavior

When viewing the `/deport` table, the browser's Network tab showed individual fetch requests to Supabase for each row displayed in the table:

```
https://fvhgvfdnfqbdsxiekbvo.supabase.co/rest/v1/deport?select=*&Laufendenr=eq.1
https://fvhgvfdnfqbdsxiekbvo.supabase.co/rest/v1/deport?select=*&Laufendenr=eq.2
https://fvhgvfdnfqbdsxiekbvo.supabase.co/rest/v1/deport?select=*&Laufendenr=eq.3
... (one request per row)
```

### Location of the Issue

The problematic code was located in `app/deport/TableClient.tsx` (lines 292-318), within the `useEffect` hook that checks for historical versions of each record.

### Performance Impact

- **22+ individual HTTP requests** per page load (based on `ITEMS_PER_PAGE = 22`)
- Each request incurs network latency overhead
- Database connection overhead for each query
- Increased load on Supabase infrastructure
- Slower page rendering due to sequential async operations

---

## 2. Root Cause Analysis

### The Problematic Pattern

The `checkHistoricalRecords` function was iterating over each person in the table and calling `hasHistoricalVersions()` individually:

```typescript
// BEFORE: Problematic N+1 query pattern
const checkHistoricalRecords = async () => {
  const historyStatus: Record<number, boolean> = {};

  // This loop causes N individual queries!
  for (let i = 0; i < initialPeople.length; i++) {
    const person = initialPeople[i];
    if (person.Laufendenr) {
      try {
        // Each iteration makes a separate database request
        const hasHistory = await hasHistoricalVersions(person.Laufendenr);
        historyStatus[person.Laufendenr] = hasHistory;
      } catch (error) {
        console.error(`Error checking history for Laufendenr ${person.Laufendenr}:`, error);
        historyStatus[person.Laufendenr] = false;
      }
    }
  }

  setRecordsWithHistory(historyStatus);
};
```

### The Individual Query Function

The `hasHistoricalVersions()` function performed a count query for a single `Laufendenr`:

```typescript
export async function hasHistoricalVersions(laufendenr: number): Promise<boolean> {
  const { count, error } = await supabase
    .from('deport')
    .select('*', { count: 'exact', head: true })
    .eq('Laufendenr', laufendenr);

  // If count > 1, there are historical versions
  return (count || 0) > 1;
}
```

---

## 3. Solution Implemented

### New Batch Function: `batchHasHistoricalVersions()`

Added to `app/deport/data.ts`:

```typescript
export async function batchHasHistoricalVersions(
  laufendenrList: number[]
): Promise<Record<number, boolean>> {
  if (laufendenrList.length === 0) {
    return {};
  }

  // Single query using .in() to fetch all records at once
  const { data, error } = await supabase
    .from('deport')
    .select('Laufendenr')
    .in('Laufendenr', laufendenrList);

  if (error) {
    throw new Error(`Failed to batch check for historical versions: ${error.message}`);
  }

  // Count occurrences of each Laufendenr
  const counts: Record<number, number> = {};
  (data || []).forEach((record) => {
    const key = record.Laufendenr;
    if (key !== null) {
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  // Convert counts to boolean map (count > 1 = has history)
  const result: Record<number, boolean> = {};
  laufendenrList.forEach((laufendenr) => {
    result[laufendenr] = (counts[laufendenr] || 0) > 1;
  });

  return result;
}
```

### Refactored `checkHistoricalRecords` in `TableClient.tsx`

```typescript
// AFTER: Optimized batch query pattern
const checkHistoricalRecords = async () => {
  // Collect all Laufendenr values from the current page
  const laufendenrList = initialPeople
    .map(person => person.Laufendenr)
    .filter((laufendenr): laufendenr is number => laufendenr !== null);

  if (laufendenrList.length === 0) {
    setRecordsWithHistory({});
    return;
  }

  try {
    // Single batch query instead of N individual queries
    const historyStatus = await batchHasHistoricalVersions(laufendenrList);
    setRecordsWithHistory(historyStatus);
  } catch (error) {
    console.error('Error batch checking historical records:', error);
    // Graceful fallback on error
    const fallbackStatus: Record<number, boolean> = {};
    laufendenrList.forEach(laufendenr => {
      fallbackStatus[laufendenr] = false;
    });
    setRecordsWithHistory(fallbackStatus);
  }
};
```

---

## 4. Technical Details

### Batch Query Strategy

The optimized solution follows this approach:

1. **Collect IDs**: Extract all `Laufendenr` values from the current page's data
2. **Single Query**: Use Supabase's `.in()` operator to fetch all matching records in one request
3. **Client-Side Aggregation**: Count occurrences of each `Laufendenr` in the result set
4. **Map to Booleans**: Convert counts to a boolean map (count > 1 indicates historical versions exist)

### Supabase Query Comparison

| Approach | Query | Requests |
|----------|-------|----------|
| **Before** | `.eq('Laufendenr', X)` for each row | N |
| **After** | `.in('Laufendenr', [X, Y, Z, ...])` | 1 |

### Historization Logic Preserved

The historization logic using `valid_from`/`valid_to` timestamps is **correctly preserved**:

- **Current records** have `valid_to = NULL`
- **Historical records** have `valid_to != NULL` (superseded timestamp)
- Both versions share the same `Laufendenr` (business key)

The batch function does **NOT** filter by `valid_to` because:
- We need to count **all** records (current + historical) to determine if history exists
- A `Laufendenr` with count > 1 means: 1 current record + N historical records
- The main table data fetch (in `fetchDeported()`) already filters with `.is('valid_to', null)` to show only current records

---

## 5. Performance Impact

### Quantified Improvement

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| HTTP Requests per page | 22 | 1 | **95.5% reduction** |
| Database queries per page | 22 | 1 | **95.5% reduction** |
| Network latency overhead | 22x | 1x | **Eliminated** |

### Benefits

- ✅ **Faster page load times** - Single round-trip instead of 22
- ✅ **Reduced database load** - Single query execution plan
- ✅ **Better user experience** - Immediate history status display
- ✅ **Scalability** - Performance remains constant regardless of page size
- ✅ **Network efficiency** - Single TCP connection, single response

### Edge Cases Handled

- **Empty page**: Returns empty object `{}` immediately
- **Null Laufendenr values**: Filtered out before query
- **Query errors**: Graceful fallback sets all to `false` (UI remains functional)

---

## 6. Files Changed

| File | Change |
|------|--------|
| `app/deport/data.ts` | Added `batchHasHistoricalVersions()` function |
| `app/deport/TableClient.tsx` | Refactored `checkHistoricalRecords` to use batch function, updated import |

---

## 7. Testing Recommendations

To verify the fix:

1. Open browser DevTools → Network tab
2. Navigate to `/deport` route
3. Confirm only **one** request to the `deport` table for history checking (instead of 22+)
4. Verify the history icons still display correctly for records with historical versions
5. Test pagination to ensure batch fetching works on all pages
