import type { Bus as BusType, CrowdingLevel, BusType as BusTypeKind } from '../types';
import { MOCK_ROUTES } from './mockRoutes';
import { MOCK_STOPS } from './mockStops';

interface RawBusDef {
  id: string;
  route_id: string;
  bus_number: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  crowding_level: CrowdingLevel;
  seats_available: number;
  total_capacity: number;
  next_stop_id: string;
  eta_next_stop_minutes: number;
  heading: number;
  speed: number;
  last_updated: string;
  is_active: boolean;
  bus_type: BusTypeKind;
}

const RAW_BUSES: RawBusDef[] = [
  // Route 500-D buses
  {
    id: 'bus-500-1',
    route_id: 'route-500',
    bus_number: '500-D1',
    vehicle_id: 'KA01-FA-1001',
    latitude: 12.9400,
    longitude: 77.6000,
    crowding_level: 'low',
    seats_available: 34,
    total_capacity: 50,
    next_stop_id: 'stop-silkboard',
    eta_next_stop_minutes: 8,
    heading: 150,
    speed: 38,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'electric',
  },
  {
    id: 'bus-500-2',
    route_id: 'route-500',
    bus_number: '500-D2',
    vehicle_id: 'KA01-FA-1002',
    latitude: 12.9200,
    longitude: 77.6150,
    crowding_level: 'moderate',
    seats_available: 18,
    total_capacity: 50,
    next_stop_id: 'stop-silkboard',
    eta_next_stop_minutes: 3,
    heading: 155,
    speed: 32,
    last_updated: '1 min ago',
    is_active: true,
    bus_type: 'electric',
  },
  {
    id: 'bus-500-3',
    route_id: 'route-500',
    bus_number: '500-D3',
    vehicle_id: 'KA01-FA-1003',
    latitude: 12.8750,
    longitude: 77.6450,
    crowding_level: 'high',
    seats_available: 6,
    total_capacity: 50,
    next_stop_id: 'stop-ecity',
    eta_next_stop_minutes: 14,
    heading: 160,
    speed: 42,
    last_updated: '2 min ago',
    is_active: true,
    bus_type: 'electric',
  },

  // Route 335-E buses (Vajra AC)
  {
    id: 'bus-335-1',
    route_id: 'route-335',
    bus_number: '335-E1',
    vehicle_id: 'KA01-FA-1004',
    latitude: 12.9650,
    longitude: 77.6500,
    crowding_level: 'low',
    seats_available: 28,
    total_capacity: 45,
    next_stop_id: 'stop-marathahalli',
    eta_next_stop_minutes: 11,
    heading: 110,
    speed: 36,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'ac',
  },
  {
    id: 'bus-335-2',
    route_id: 'route-335',
    bus_number: '335-E2',
    vehicle_id: 'KA01-FA-1005',
    latitude: 12.9620,
    longitude: 77.7200,
    crowding_level: 'empty',
    seats_available: 40,
    total_capacity: 45,
    next_stop_id: 'stop-whitefield',
    eta_next_stop_minutes: 7,
    heading: 105,
    speed: 40,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'ac',
  },

  // Route 290 buses
  {
    id: 'bus-290-1',
    route_id: 'route-290',
    bus_number: '290-1',
    vehicle_id: 'KA01-FA-1006',
    latitude: 13.0050,
    longitude: 77.5850,
    crowding_level: 'moderate',
    seats_available: 21,
    total_capacity: 55,
    next_stop_id: 'stop-hebbal',
    eta_next_stop_minutes: 9,
    heading: 15,
    speed: 35,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'non-ac',
  },
  {
    id: 'bus-290-2',
    route_id: 'route-290',
    bus_number: '290-2',
    vehicle_id: 'KA01-FA-1007',
    latitude: 13.0600,
    longitude: 77.5930,
    crowding_level: 'low',
    seats_available: 38,
    total_capacity: 55,
    next_stop_id: 'stop-yelahanka',
    eta_next_stop_minutes: 12,
    heading: 10,
    speed: 44,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'non-ac',
  },

  // Route 27 buses
  {
    id: 'bus-27-1',
    route_id: 'route-27',
    bus_number: '27-1',
    vehicle_id: 'KA01-FA-1008',
    latitude: 12.9400,
    longitude: 77.5580,
    crowding_level: 'high',
    seats_available: 5,
    total_capacity: 50,
    next_stop_id: 'stop-banashankari',
    eta_next_stop_minutes: 5,
    heading: 195,
    speed: 28,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'non-ac',
  },
  {
    id: 'bus-27-2',
    route_id: 'route-27',
    bus_number: '27-2',
    vehicle_id: 'KA01-FA-1009',
    latitude: 12.9245,
    longitude: 77.5650,
    crowding_level: 'moderate',
    seats_available: 16,
    total_capacity: 50,
    next_stop_id: 'stop-jayanagar',
    eta_next_stop_minutes: 4,
    heading: 100,
    speed: 30,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'non-ac',
  },

  // Route 305 buses
  {
    id: 'bus-305-1',
    route_id: 'route-305',
    bus_number: '305-1',
    vehicle_id: 'KA01-FA-1010',
    latitude: 12.9900,
    longitude: 77.6700,
    crowding_level: 'low',
    seats_available: 32,
    total_capacity: 50,
    next_stop_id: 'stop-krpuram',
    eta_next_stop_minutes: 8,
    heading: 65,
    speed: 35,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'electric',
  },

  // Route 290EN bus
  {
    id: 'bus-290en-1',
    route_id: 'route-290en',
    bus_number: '290EN',
    vehicle_id: 'KA01-EV-2042',
    latitude: 13.0880,
    longitude: 77.5870,
    crowding_level: 'low',
    seats_available: 28,
    total_capacity: 42,
    next_stop_id: 'stop-thanisandra',
    eta_next_stop_minutes: 6,
    heading: 145,
    speed: 33,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'electric',
  },

  // Route 300E bus
  {
    id: 'bus-300e-1',
    route_id: 'route-300e',
    bus_number: '300E',
    vehicle_id: 'KA01-EV-3012',
    latitude: 13.0050,
    longitude: 77.6400,
    crowding_level: 'moderate',
    seats_available: 19,
    total_capacity: 42,
    next_stop_id: 'stop-banasawadi',
    eta_next_stop_minutes: 5,
    heading: 60,
    speed: 29,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'electric',
  },

  // Route 290EY bus
  {
    id: 'bus-290ey-1',
    route_id: 'route-290ey',
    bus_number: '290EY',
    vehicle_id: 'KA01-EV-2908',
    latitude: 13.0150,
    longitude: 77.5890,
    crowding_level: 'empty',
    seats_available: 36,
    total_capacity: 42,
    next_stop_id: 'stop-nagawara',
    eta_next_stop_minutes: 10,
    heading: 15,
    speed: 38,
    last_updated: 'Just now',
    is_active: true,
    bus_type: 'electric',
  },
];

export const MOCK_BUSES: BusType[] = RAW_BUSES.map(bus => {
  const route = MOCK_ROUTES.find(r => r.id === bus.route_id);
  const next_stop = MOCK_STOPS.find(s => s.id === bus.next_stop_id);
  return { ...bus, route, next_stop };
});
