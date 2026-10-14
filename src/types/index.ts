export type CrowdingLevel = 'empty' | 'low' | 'moderate' | 'high' | 'full';
export type BusType = 'ac' | 'non-ac' | 'electric';

export interface RouteStop {
  id: string;
  route_id: string;
  stop_id: string;
  stop_order: number;
  estimated_travel_time_minutes: number;
}

export interface BusRoute {
  id: string;
  route_number: string;
  route_name: string;
  color: string;
  created_at: string;
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Bus {
  id: string;
  route_id: string;
  bus_number: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  crowding_level: CrowdingLevel;
  seats_available: number;
  total_capacity: number;
  next_stop_id: string | null;
  eta_next_stop_minutes: number | null;
  heading: number | null;
  speed: number | null;
  last_updated: string;
  is_active: boolean;
  bus_type: BusType;
  route?: BusRoute;
  next_stop?: BusStop;
}

export interface CrowdPrediction {
  id: string;
  route_id: string;
  day_of_week: number;
  hour_of_day: number;
  crowding_level: CrowdingLevel;
  confidence: number;
}

export interface CrowdReport {
  id: string;
  route_id: string;
  bus_id: string | null;
  reported_level: CrowdingLevel;
  reported_at: string;
}

export interface RouteCrowdForecast {
  current: CrowdingLevel;
  in15: CrowdingLevel;
  in30: CrowdingLevel;
  in60: CrowdingLevel;
  confidence: number;
  recentReportCount: number;
  userAdjusted: boolean;
}

export interface UserSavedStop {
  id: string;
  user_id: string;
  stop_id: string;
  route_id: string;
  notify_before_minutes: number;
  is_active: boolean;
  created_at: string;
  stop?: BusStop;
  route?: BusRoute;
}

export interface CrowdingInfo {
  level: CrowdingLevel;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  seatChance: string;
}

export const CROWDING_INFO: Record<CrowdingLevel, CrowdingInfo> = {
  empty: {
    level: 'empty',
    label: 'Empty',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: '🟢',
    seatChance: 'Excellent - Many seats available',
  },
  low: {
    level: 'low',
    label: 'Low Crowd',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: '🟩',
    seatChance: 'Very Good - Seats likely available',
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: '🟨',
    seatChance: 'Fair - Some seats may be available',
  },
  high: {
    level: 'high',
    label: 'Crowded',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '🟧',
    seatChance: 'Low - Standing likely required',
  },
  full: {
    level: 'full',
    label: 'Full',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '🔴',
    seatChance: 'None - Wait for next bus',
  },
};

export interface BusTypeInfo {
  type: BusType;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}

export const BUS_TYPE_INFO: Record<BusType, BusTypeInfo> = {
  ac: {
    type: 'ac',
    label: 'AC',
    shortLabel: 'AC',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    icon: '❄',
    description: 'Air-conditioned comfort bus',
  },
  'non-ac': {
    type: 'non-ac',
    label: 'Non-AC',
    shortLabel: 'Non-AC',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: '🚐',
    description: 'Non-air-conditioned bus',
  },
  electric: {
    type: 'electric',
    label: 'Electric',
    shortLabel: 'EV',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: '⚡',
    description: 'Zero-emission electric bus',
  },
};

export const BUS_TYPES: BusType[] = ['ac', 'non-ac', 'electric'];
