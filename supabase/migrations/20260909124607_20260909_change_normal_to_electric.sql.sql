/*
# Change bus_type 'normal' to 'electric'

## Summary
Replaces the 'normal' bus type with 'electric' so buses are classified as
AC, Non-AC, or Electric. Updates the CHECK constraint and existing data.
*/

-- Step 1: Drop old constraint so we can update the data
ALTER TABLE buses DROP CONSTRAINT IF EXISTS buses_bus_type_check;

-- Step 2: Update existing data
UPDATE buses SET bus_type = 'electric' WHERE bus_type = 'normal';

-- Step 3: Add new constraint with updated values
ALTER TABLE buses ADD CONSTRAINT buses_bus_type_check
  CHECK (bus_type IN ('ac', 'non-ac', 'electric'));
