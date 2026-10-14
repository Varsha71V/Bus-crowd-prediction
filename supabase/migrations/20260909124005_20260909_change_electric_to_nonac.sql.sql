/*
# Change bus_type 'electric' to 'non-ac'

## Summary
Replaces the 'electric' bus type with 'non-ac' to classify buses as
AC, Non-AC, or Normal. Updates the CHECK constraint and existing data.

## Changes
1. Drop old CHECK constraint
2. Update existing data: 'electric' → 'non-ac'
3. Add new CHECK constraint allowing 'ac', 'non-ac', 'normal'
*/

-- Step 1: Drop old constraint so we can update the data
ALTER TABLE buses DROP CONSTRAINT IF EXISTS buses_bus_type_check;

-- Step 2: Update existing data
UPDATE buses SET bus_type = 'non-ac' WHERE bus_type = 'electric';

-- Step 3: Add new constraint with updated values
ALTER TABLE buses ADD CONSTRAINT buses_bus_type_check
  CHECK (bus_type IN ('ac', 'non-ac', 'normal'));
