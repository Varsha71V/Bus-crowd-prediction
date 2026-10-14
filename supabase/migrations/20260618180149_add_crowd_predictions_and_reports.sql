/*
# Crowd Prediction Tables

## Summary
Adds two tables to support crowd prediction for BMTC bus routes:

1. `crowd_predictions` — stores hourly historical crowd level patterns per route per day-of-week.
   Used to look up what the expected crowd level is at any given time window (+15, +30, +60 min).

2. `crowd_reports` — stores anonymous real-time crowd reports submitted by users.
   Weighted with historical predictions to produce adjusted forecasts.

## New Tables

### crowd_predictions
- `id` (uuid, primary key)
- `route_id` (uuid, FK → bus_routes) — which route this pattern applies to
- `day_of_week` (int, 0=Sunday … 6=Saturday)
- `hour_of_day` (int, 0–23) — the hour this row covers
- `crowding_level` (text, enum: empty/low/moderate/high/full)
- `confidence` (numeric 0–1) — model confidence score
- `created_at` (timestamptz)

### crowd_reports
- `id` (uuid, primary key)
- `route_id` (uuid, FK → bus_routes)
- `bus_id` (uuid, nullable FK → buses)
- `reported_level` (text, enum: empty/low/moderate/high/full)
- `reported_at` (timestamptz)
- `created_at` (timestamptz)

## Security
- RLS enabled on both tables.
- Public (anon + authenticated) SELECT on crowd_predictions — read-only reference data.
- Public (anon + authenticated) INSERT on crowd_reports — anonymous reporting.
- Public (anon + authenticated) SELECT on crowd_reports — needed to compute recent average.
- No UPDATE or DELETE on crowd_reports (append-only telemetry).
*/

-- crowd_predictions: historical hourly patterns per route per day
CREATE TABLE IF NOT EXISTS crowd_predictions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id       uuid NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  day_of_week    int  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  hour_of_day    int  NOT NULL CHECK (hour_of_day  BETWEEN 0 AND 23),
  crowding_level text NOT NULL CHECK (crowding_level IN ('empty','low','moderate','high','full')),
  confidence     numeric NOT NULL DEFAULT 0.8 CHECK (confidence BETWEEN 0 AND 1),
  created_at     timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_crowd_predictions_route_day_hour
  ON crowd_predictions (route_id, day_of_week, hour_of_day);

ALTER TABLE crowd_predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_crowd_predictions" ON crowd_predictions;
CREATE POLICY "anon_select_crowd_predictions" ON crowd_predictions FOR SELECT
  TO anon, authenticated USING (true);

-- crowd_reports: anonymous real-time user reports
CREATE TABLE IF NOT EXISTS crowd_reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id       uuid NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  bus_id         uuid REFERENCES buses(id) ON DELETE SET NULL,
  reported_level text NOT NULL CHECK (reported_level IN ('empty','low','moderate','high','full')),
  reported_at    timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crowd_reports_route_reported_at
  ON crowd_reports (route_id, reported_at DESC);

ALTER TABLE crowd_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_crowd_reports" ON crowd_reports;
CREATE POLICY "anon_select_crowd_reports" ON crowd_reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_crowd_reports" ON crowd_reports;
CREATE POLICY "anon_insert_crowd_reports" ON crowd_reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- -----------------------------------------------------------------------
-- Seed historical crowd patterns
-- Routes: 500, 335, 290, 27, 305
-- UUIDs match previous migration:
--   500 → 10000000-0000-4000-8000-000000000001
--   335 → 10000000-0000-4000-8000-000000000002
--   290 → 10000000-0000-4000-8000-000000000003
--   27  → 10000000-0000-4000-8000-000000000004
--   305 → 10000000-0000-4000-8000-000000000005
--
-- Pattern logic (Bangalore commuter reality):
--   Weekday (Mon-Fri, dow 1-5):
--     0-5   → empty
--     6-7   → low
--     7-10  → high (morning peak)
--     10-16 → moderate (midday)
--     16-20 → high/full (evening peak)
--     20-22 → moderate
--     22-23 → low
--   Weekend (Sat=6, Sun=0):
--     0-7   → empty
--     8-11  → low/moderate
--     11-19 → moderate
--     19-21 → moderate
--     21-23 → low
-- -----------------------------------------------------------------------

DO $$
DECLARE
  routes uuid[] := ARRAY[
    '10000000-0000-4000-8000-000000000001'::uuid,
    '10000000-0000-4000-8000-000000000002'::uuid,
    '10000000-0000-4000-8000-000000000003'::uuid,
    '10000000-0000-4000-8000-000000000004'::uuid,
    '10000000-0000-4000-8000-000000000005'::uuid
  ];
  rid uuid;
  dow int;
  h   int;
  lvl text;
  conf numeric;
BEGIN
  FOREACH rid IN ARRAY routes LOOP
    FOR dow IN 0..6 LOOP
      FOR h IN 0..23 LOOP
        -- Determine level and confidence based on time and day
        IF dow IN (1,2,3,4,5) THEN  -- Weekday
          IF h < 6 THEN
            lvl := 'empty'; conf := 0.95;
          ELSIF h < 7 THEN
            lvl := 'low'; conf := 0.85;
          ELSIF h < 10 THEN
            lvl := 'high'; conf := 0.90;
          ELSIF h < 12 THEN
            lvl := 'moderate'; conf := 0.85;
          ELSIF h < 16 THEN
            lvl := 'low'; conf := 0.80;
          ELSIF h < 20 THEN
            lvl := 'high'; conf := 0.90;
          ELSIF h < 22 THEN
            lvl := 'moderate'; conf := 0.80;
          ELSE
            lvl := 'low'; conf := 0.85;
          END IF;
          -- Route 500 (Electronic City corridor) is consistently more crowded
          IF rid = '10000000-0000-4000-8000-000000000001'::uuid AND lvl = 'high' THEN
            lvl := 'full'; conf := 0.88;
          END IF;
          -- Route 27 (Banashankari) has lighter evening crowds
          IF rid = '10000000-0000-4000-8000-000000000004'::uuid AND h BETWEEN 17 AND 19 THEN
            lvl := 'moderate'; conf := 0.82;
          END IF;
        ELSE  -- Weekend
          IF h < 8 THEN
            lvl := 'empty'; conf := 0.95;
          ELSIF h < 10 THEN
            lvl := 'low'; conf := 0.85;
          ELSIF h < 19 THEN
            lvl := 'moderate'; conf := 0.80;
          ELSIF h < 21 THEN
            lvl := 'moderate'; conf := 0.78;
          ELSE
            lvl := 'low'; conf := 0.80;
          END IF;
        END IF;

        INSERT INTO crowd_predictions (route_id, day_of_week, hour_of_day, crowding_level, confidence)
        VALUES (rid, dow, h, lvl, conf)
        ON CONFLICT (route_id, day_of_week, hour_of_day) DO UPDATE
          SET crowding_level = EXCLUDED.crowding_level,
              confidence     = EXCLUDED.confidence;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
