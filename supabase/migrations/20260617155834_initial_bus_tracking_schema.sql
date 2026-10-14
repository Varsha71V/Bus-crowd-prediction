-- Bus routes table
CREATE TABLE bus_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_number TEXT NOT NULL UNIQUE,
  route_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bus stops table
CREATE TABLE bus_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Route stops (junction table for stops on routes)
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES bus_routes(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES bus_stops(id) ON DELETE CASCADE,
  stop_order INT NOT NULL,
  estimated_travel_time_minutes INT NOT NULL DEFAULT 5,
  UNIQUE(route_id, stop_id, stop_order)
);

-- Active buses with real-time data
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES bus_routes(id) ON DELETE CASCADE,
  bus_number TEXT NOT NULL,
  vehicle_id TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  crowding_level TEXT NOT NULL CHECK (crowding_level IN ('empty', 'low', 'moderate', 'high', 'full')),
  seats_available INT NOT NULL DEFAULT 0,
  total_capacity INT NOT NULL DEFAULT 50,
  next_stop_id UUID REFERENCES bus_stops(id),
  eta_next_stop_minutes INT,
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User saved stops for notifications
CREATE TABLE user_saved_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES bus_stops(id) ON DELETE CASCADE,
  route_id UUID REFERENCES bus_routes(id) ON DELETE CASCADE,
  notify_before_minutes INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stop_id, route_id)
);

-- Enable RLS
ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_stops ENABLE ROW LEVEL SECURITY;

-- Public read policies for bus data
CREATE POLICY "public_read_bus_routes" ON bus_routes FOR SELECT USING (true);
CREATE POLICY "public_read_bus_stops" ON bus_stops FOR SELECT USING (true);
CREATE POLICY "public_read_route_stops" ON route_stops FOR SELECT USING (true);
CREATE POLICY "public_read_buses" ON buses FOR SELECT USING (true);

-- User-owned policies for saved stops
CREATE POLICY "select_own_saved_stops" ON user_saved_stops FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_saved_stops" ON user_saved_stops FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_saved_stops" ON user_saved_stops FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_saved_stops" ON user_saved_stops FOR DELETE
  TO authenticated USING (auth.uid() = user_id);