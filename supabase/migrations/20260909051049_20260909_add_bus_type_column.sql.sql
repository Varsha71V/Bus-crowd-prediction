/*
# Add bus_type column to buses table

## Summary
Adds a new `bus_type` column to the `buses` table to classify each bus as
"electric", "ac", or "normal". Existing buses are assigned types in a realistic
distribution. No data is lost — this is a purely additive column with a default
value.

## Changes

### 1. New column
- `buses.bus_type` (TEXT, NOT NULL, DEFAULT 'normal')
  - Allowed values: 'electric', 'ac', 'normal'
  - Enforced via a CHECK constraint

### 2. Data updates
- Existing 11 buses are assigned types:
  - Electric: 500-A, 335-B, 290-B, 305-A (4 buses — newer fleet)
  - AC:       500-C, 335-A, 27-B (3 buses — premium service)
  - Normal:   500-B, 290-A, 27-A, 305-B (4 buses — standard)

### 3. Security
- No RLS or policy changes. The existing public-read policy on `buses`
  already covers the new column (column-level privileges are not restricted).

### 4. Notes
- The column is additive — no existing data is modified or lost.
- The CHECK constraint ensures only valid bus type values are accepted.
- The DEFAULT 'normal' means any future bus inserts without an explicit
  type will be classified as a normal bus.
- Idempotent: re-running is safe (uses DO $$ ... IF NOT EXISTS ... END $$).
*/

-- ──────────────────────────────────────────────────────────────────────────
-- 1. Add bus_type column if it doesn't exist
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'buses' AND column_name = 'bus_type'
  ) THEN
    ALTER TABLE buses ADD COLUMN bus_type TEXT NOT NULL DEFAULT 'normal';
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 2. Add CHECK constraint for valid bus types (drop first for idempotency)
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'buses_bus_type_check'
  ) THEN
    ALTER TABLE buses ADD CONSTRAINT buses_bus_type_check
      CHECK (bus_type IN ('electric', 'ac', 'normal'));
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 3. Assign bus types to existing buses
-- ──────────────────────────────────────────────────────────────────────────
UPDATE buses SET bus_type = 'electric' WHERE bus_number IN ('500-A', '335-B', '290-B', '305-A');
UPDATE buses SET bus_type = 'ac'       WHERE bus_number IN ('500-C', '335-A', '27-B');
UPDATE buses SET bus_type = 'normal'   WHERE bus_number IN ('500-B', '290-A', '27-A', '305-B');
