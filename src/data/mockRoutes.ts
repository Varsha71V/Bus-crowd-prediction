import type { BusRoute, RouteStop, BusType as BusTypeKind } from '../types';

export interface ExtendedBusRoute extends BusRoute {
  source: string;
  destination: string;
  type: BusTypeKind;
  fareRange: string;
  approxDurationMinutes: number;
  frequencyMinutes: number;
  firstBus: string;
  lastBus: string;
  distanceKm: number;
  totalStops: number;
  via: string[];
}

export const MOCK_ROUTES: ExtendedBusRoute[] = [
  {
    id: 'route-500',
    route_number: '500-D',
    route_name: 'Majestic to Electronic City via Silk Board',
    source: 'Kempegowda Bus Station (Majestic)',
    destination: 'Electronic City Toll Gate',
    color: '#2563EB',
    type: 'electric',
    fareRange: '₹20 - ₹45',
    approxDurationMinutes: 45,
    frequencyMinutes: 10,
    firstBus: '05:30 AM',
    lastBus: '11:15 PM',
    distanceKm: 24.5,
    totalStops: 3,
    via: ['Shantinagar', 'Koramangala', 'Central Silk Board'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'route-335',
    route_number: '335-E',
    route_name: 'Majestic to Whitefield via Marathahalli',
    source: 'Kempegowda Bus Station (Majestic)',
    destination: 'Whitefield (Kadugodi Bus Station)',
    color: '#D97706',
    type: 'ac',
    fareRange: '₹35 - ₹75',
    approxDurationMinutes: 55,
    frequencyMinutes: 12,
    firstBus: '06:00 AM',
    lastBus: '10:45 PM',
    distanceKm: 28.2,
    totalStops: 3,
    via: ['Halasuru', 'Domlur', 'HAL Main Gate', 'Marathahalli Bridge'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'route-290',
    route_number: '290',
    route_name: 'Majestic to Yelahanka via Hebbal',
    source: 'Kempegowda Bus Station (Majestic)',
    destination: 'Yelahanka Old Town (NES)',
    color: '#059669',
    type: 'non-ac',
    fareRange: '₹15 - ₹35',
    approxDurationMinutes: 45,
    frequencyMinutes: 8,
    firstBus: '05:00 AM',
    lastBus: '11:30 PM',
    distanceKm: 21.0,
    totalStops: 3,
    via: ['Mehkri Circle', 'Hebbal Flyover', 'Kodigehalli Gate'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'route-27',
    route_number: '27',
    route_name: 'Majestic to Jayanagar via Banashankari',
    source: 'Kempegowda Bus Station (Majestic)',
    destination: 'Jayanagar 4th Block TTMC',
    color: '#DC2626',
    type: 'non-ac',
    fareRange: '₹10 - ₹25',
    approxDurationMinutes: 30,
    frequencyMinutes: 15,
    firstBus: '06:15 AM',
    lastBus: '10:00 PM',
    distanceKm: 14.8,
    totalStops: 3,
    via: ['Chamrajpet', 'Basavanagudi', 'Banashankari TTMC'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'route-305',
    route_number: '305',
    route_name: 'Majestic to Whitefield via KR Puram',
    source: 'Kempegowda Bus Station (Majestic)',
    destination: 'Whitefield (Kadugodi Bus Station)',
    color: '#7C3AED',
    type: 'electric',
    fareRange: '₹25 - ₹50',
    approxDurationMinutes: 60,
    frequencyMinutes: 15,
    firstBus: '05:45 AM',
    lastBus: '10:30 PM',
    distanceKm: 26.4,
    totalStops: 3,
    via: ['Tin Factory', 'K R Puram Railway Station', 'Hoodi'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'route-290en',
    route_number: '290EN',
    route_name: 'Yelahanka to Nagawara Junction (Manyata)',
    source: 'Yelahanka Old Town (NES)',
    destination: 'Nagawara Junction (Manyata Tech Park)',
    color: '#0284C7',
    type: 'electric',
    fareRange: '₹15 - ₹30',
    approxDurationMinutes: 35,
    frequencyMinutes: 10,
    firstBus: '06:30 AM',
    lastBus: '10:15 PM',
    distanceKm: 15.2,
    totalStops: 8,
    via: ['Maruthi Nagar', 'Kogilu Cross', 'Thanisandra'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'route-300e',
    route_number: '300E',
    route_name: 'Shivajinagar to KR Puram via Banasawadi',
    source: 'Shivajinagar Bus Station',
    destination: 'K R Puram Railway Station',
    color: '#EA580C',
    type: 'electric',
    fareRange: '₹15 - ₹35',
    approxDurationMinutes: 40,
    frequencyMinutes: 12,
    firstBus: '06:05 AM',
    lastBus: '10:45 PM',
    distanceKm: 16.5,
    totalStops: 10,
    via: ['Cunningham Road', 'Coles Park', 'Banasawadi Fire Station'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'route-290ey',
    route_number: '290EY',
    route_name: 'Kempegowda Bus Station to Yelahanka via Coles Park',
    source: 'Kempegowda Bus Station (Majestic)',
    destination: 'Yelahanka Old Town (NES)',
    color: '#10B981',
    type: 'electric',
    fareRange: '₹20 - ₹40',
    approxDurationMinutes: 50,
    frequencyMinutes: 10,
    firstBus: '05:30 AM',
    lastBus: '11:00 PM',
    distanceKm: 23.0,
    totalStops: 9,
    via: ['Cunningham Road', 'Coles Park', 'Nagawara Junction'],
    created_at: new Date().toISOString(),
  },
];

export const MOCK_ROUTE_STOPS: RouteStop[] = [
  // Route 500-D (Majestic -> Silk Board -> Electronic City)
  { id: 'rs-500-1', route_id: 'route-500', stop_id: 'stop-kbs', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-500-2', route_id: 'route-500', stop_id: 'stop-silkboard', stop_order: 2, estimated_travel_time_minutes: 25 },
  { id: 'rs-500-3', route_id: 'route-500', stop_id: 'stop-ecity', stop_order: 3, estimated_travel_time_minutes: 20 },

  // Route 335-E (Majestic -> Marathahalli -> Whitefield)
  { id: 'rs-335-1', route_id: 'route-335', stop_id: 'stop-kbs', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-335-2', route_id: 'route-335', stop_id: 'stop-marathahalli', stop_order: 2, estimated_travel_time_minutes: 35 },
  { id: 'rs-335-3', route_id: 'route-335', stop_id: 'stop-whitefield', stop_order: 3, estimated_travel_time_minutes: 20 },

  // Route 290 (Majestic -> Hebbal -> Yelahanka)
  { id: 'rs-290-1', route_id: 'route-290', stop_id: 'stop-kbs', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-290-2', route_id: 'route-290', stop_id: 'stop-hebbal', stop_order: 2, estimated_travel_time_minutes: 25 },
  { id: 'rs-290-3', route_id: 'route-290', stop_id: 'stop-yelahanka', stop_order: 3, estimated_travel_time_minutes: 20 },

  // Route 27 (Majestic -> Banashankari -> Jayanagar)
  { id: 'rs-27-1', route_id: 'route-27', stop_id: 'stop-kbs', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-27-2', route_id: 'route-27', stop_id: 'stop-banashankari', stop_order: 2, estimated_travel_time_minutes: 20 },
  { id: 'rs-27-3', route_id: 'route-27', stop_id: 'stop-jayanagar', stop_order: 3, estimated_travel_time_minutes: 10 },

  // Route 305 (Majestic -> KR Puram -> Whitefield)
  { id: 'rs-305-1', route_id: 'route-305', stop_id: 'stop-kbs', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-305-2', route_id: 'route-305', stop_id: 'stop-krpuram', stop_order: 2, estimated_travel_time_minutes: 35 },
  { id: 'rs-305-3', route_id: 'route-305', stop_id: 'stop-whitefield', stop_order: 3, estimated_travel_time_minutes: 25 },

  // Route 290EN (Yelahanka -> Nagawara)
  { id: 'rs-290en-1', route_id: 'route-290en', stop_id: 'stop-yelahanka', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-290en-2', route_id: 'route-290en', stop_id: 'stop-maruthi-nagar', stop_order: 2, estimated_travel_time_minutes: 5 },
  { id: 'rs-290en-3', route_id: 'route-290en', stop_id: 'stop-kogilu', stop_order: 3, estimated_travel_time_minutes: 7 },
  { id: 'rs-290en-4', route_id: 'route-290en', stop_id: 'stop-thanisandra', stop_order: 4, estimated_travel_time_minutes: 10 },
  { id: 'rs-290en-5', route_id: 'route-290en', stop_id: 'stop-nagawara', stop_order: 5, estimated_travel_time_minutes: 12 },

  // Route 300E (Shivajinagar -> Banasawadi -> KR Puram)
  { id: 'rs-300e-1', route_id: 'route-300e', stop_id: 'stop-shivajinagar', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-300e-2', route_id: 'route-300e', stop_id: 'stop-cunningham', stop_order: 2, estimated_travel_time_minutes: 6 },
  { id: 'rs-300e-3', route_id: 'route-300e', stop_id: 'stop-coles-park', stop_order: 3, estimated_travel_time_minutes: 8 },
  { id: 'rs-300e-4', route_id: 'route-300e', stop_id: 'stop-banasawadi', stop_order: 4, estimated_travel_time_minutes: 12 },
  { id: 'rs-300e-5', route_id: 'route-300e', stop_id: 'stop-krpuram', stop_order: 5, estimated_travel_time_minutes: 14 },

  // Route 290EY (Majestic -> Cunningham -> Coles Park -> Nagawara -> Yelahanka)
  { id: 'rs-290ey-1', route_id: 'route-290ey', stop_id: 'stop-kbs', stop_order: 1, estimated_travel_time_minutes: 0 },
  { id: 'rs-290ey-2', route_id: 'route-290ey', stop_id: 'stop-cunningham', stop_order: 2, estimated_travel_time_minutes: 8 },
  { id: 'rs-290ey-3', route_id: 'route-290ey', stop_id: 'stop-coles-park', stop_order: 3, estimated_travel_time_minutes: 8 },
  { id: 'rs-290ey-4', route_id: 'route-290ey', stop_id: 'stop-nagawara', stop_order: 4, estimated_travel_time_minutes: 16 },
  { id: 'rs-290ey-5', route_id: 'route-290ey', stop_id: 'stop-yelahanka', stop_order: 5, estimated_travel_time_minutes: 18 },
];
