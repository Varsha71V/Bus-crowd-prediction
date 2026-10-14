-- Replace all sample bus routes/stops with real BMTC (Bengaluru Metropolitan Transport Corporation) routes and stops.
-- Major stops include Majestic, Silk Board, Electronic City, Whitefield, Marathahalli,
-- KR Puram, Hebbal, Jayanagar, Banashankari, and Yelahanka.

-- 1) Clear existing sample data (order respects FK constraints)
DELETE FROM buses;
DELETE FROM route_stops;
DELETE FROM bus_routes;
DELETE FROM bus_stops;

-- 2) Insert real BMTC bus stops with approximate real-world lat/long coordinates
INSERT INTO bus_stops (id, name, latitude, longitude) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Majestic (Kempegowda Bus Station)', 12.96090, 77.57510),
  ('00000000-0000-4000-8000-000000000002', 'Silk Board',                        12.91660, 77.62230),
  ('00000000-0000-4000-8000-000000000003', 'Electronic City',                   12.84520, 77.66020),
  ('00000000-0000-4000-8000-000000000004', 'Whitefield',                        12.96980, 77.74990),
  ('00000000-0000-4000-8000-000000000005', 'Marathahalli',                      12.95920, 77.69740),
  ('00000000-0000-4000-8000-000000000006', 'KR Puram',                          13.00050, 77.68890),
  ('00000000-0000-4000-8000-000000000007', 'Hebbal',                            13.03580, 77.59180),
  ('00000000-0000-4000-8000-000000000008', 'Jayanagar 4th Block',               12.92500, 77.58220),
  ('00000000-0000-4000-8000-000000000009', 'Banashankari',                      12.92490, 77.54660),
  ('00000000-0000-4000-8000-000000000010', 'Yelahanka',                          13.10120, 77.59660);

-- 3) Insert real BMTC routes (well-known Bangalore bus route numbers)
INSERT INTO bus_routes (id, route_number, route_name, color) VALUES
  ('10000000-0000-4000-8000-000000000001', '500',  'Majestic - Electronic City via Silk Board', '#3B82F6'),
  ('10000000-0000-4000-8000-000000000002', '335',  'Majestic - Whitefield via Marathahalli',    '#F59E0B'),
  ('10000000-0000-4000-8000-000000000003', '290',  'Majestic - Hebbal - Yelahanka',              '#10B981'),
  ('10000000-0000-4000-8000-000000000004', '27',   'Majestic - Banashankari - Jayanagar',        '#EF4444'),
  ('10000000-0000-4000-8000-000000000005', '305',  'Majestic - KR Puram - Whitefield',           '#8B5CF6');

-- 4) Insert route_stops linking routes to stops in the correct order with realistic travel times
-- Route 500: Majestic -> Silk Board -> Electronic City
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_travel_time_minutes) VALUES
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 1, 0),
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 2, 25),
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 3, 20);

-- Route 335: Majestic -> Marathahalli -> Whitefield
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_travel_time_minutes) VALUES
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 1, 0),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000005', 2, 35),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000004', 3, 20);

-- Route 290: Majestic -> Hebbal -> Yelahanka
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_travel_time_minutes) VALUES
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 1, 0),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000007', 2, 25),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000010', 3, 20);

-- Route 27: Majestic -> Banashankari -> Jayanagar
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_travel_time_minutes) VALUES
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 1, 0),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000009', 2, 20),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000008', 3, 10);

-- Route 305: Majestic -> KR Puram -> Whitefield
INSERT INTO route_stops (route_id, stop_id, stop_order, estimated_travel_time_minutes) VALUES
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 1, 0),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000006', 2, 35),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000004', 3, 25);

-- 5) Insert active buses on each route, positioned near real coordinates with ETAs to next stop
-- Route 500 (Majestic -> Silk Board -> Electronic City)
INSERT INTO buses (route_id, bus_number, vehicle_id, latitude, longitude, crowding_level, seats_available, total_capacity, next_stop_id, eta_next_stop_minutes, heading, speed, is_active) VALUES
  ('10000000-0000-4000-8000-000000000001', '500-A', 'KA01-FA-1001', 12.94000, 77.60000, 'low',      35, 50, '00000000-0000-4000-8000-000000000002', 8,  150, 400, true),
  ('10000000-0000-4000-8000-000000000001', '500-B', 'KA01-FA-1002', 12.92000, 77.61500, 'moderate', 20, 50, '00000000-0000-4000-8000-000000000002', 3,  155, 350, true),
  ('10000000-0000-4000-8000-000000000001', '500-C', 'KA01-FA-1003', 12.91000, 77.62200, 'high',      8, 50, '00000000-0000-4000-8000-000000000003', 18, 160, 380, true);

-- Route 335 (Majestic -> Marathahalli -> Whitefield)
INSERT INTO buses (route_id, bus_number, vehicle_id, latitude, longitude, crowding_level, seats_available, total_capacity, next_stop_id, eta_next_stop_minutes, heading, speed, is_active) VALUES
  ('10000000-0000-4000-8000-000000000002', '335-A', 'KA01-FA-1004', 12.96500, 77.65000, 'low',      38, 50, '00000000-0000-4000-8000-000000000005', 12, 110, 420, true),
  ('10000000-0000-4000-8000-000000000002', '335-B', 'KA01-FA-1005', 12.96000, 77.69000, 'empty',    48, 50, '00000000-0000-4000-8000-000000000004', 15, 105, 400, true);

-- Route 290 (Majestic -> Hebbal -> Yelahanka)
INSERT INTO buses (route_id, bus_number, vehicle_id, latitude, longitude, crowding_level, seats_available, total_capacity, next_stop_id, eta_next_stop_minutes, heading, speed, is_active) VALUES
  ('10000000-0000-4000-8000-000000000003', '290-A', 'KA01-FA-1006', 12.99000, 77.58000, 'moderate', 22, 50, '00000000-0000-4000-8000-000000000007', 10, 5,   380, true),
  ('10000000-0000-4000-8000-000000000003', '290-B', 'KA01-FA-1007', 13.02000, 77.59000, 'low',      40, 50, '00000000-0000-4000-8000-000000000010', 14, 10,  360, true);

-- Route 27 (Majestic -> Banashankari -> Jayanagar)
INSERT INTO buses (route_id, bus_number, vehicle_id, latitude, longitude, crowding_level, seats_available, total_capacity, next_stop_id, eta_next_stop_minutes, heading, speed, is_active) VALUES
  ('10000000-0000-4000-8000-000000000004', '27-A', 'KA01-FA-1008', 12.94000, 77.56000, 'high',      6, 50, '00000000-0000-4000-8000-000000000009', 6,  195, 350, true),
  ('10000000-0000-4000-8000-000000000004', '27-B', 'KA01-FA-1009', 12.92400, 77.55000, 'moderate', 18, 50, '00000000-0000-4000-8000-000000000008', 4,  200, 320, true);

-- Route 305 (Majestic -> KR Puram -> Whitefield)
INSERT INTO buses (route_id, bus_number, vehicle_id, latitude, longitude, crowding_level, seats_available, total_capacity, next_stop_id, eta_next_stop_minutes, heading, speed, is_active) VALUES
  ('10000000-0000-4000-8000-000000000005', '305-A', 'KA01-FA-1010', 12.98000, 77.66000, 'low',      36, 50, '00000000-0000-4000-8000-000000000006', 9, 65,  400, true),
  ('10000000-0000-4000-8000-000000000005', '305-B', 'KA01-FA-1011', 13.00000, 77.68500, 'moderate', 15, 50, '00000000-0000-4000-8000-000000000004', 22, 70,  380, true);
