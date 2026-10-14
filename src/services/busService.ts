import { MOCK_ROUTES, MOCK_ROUTE_STOPS, type ExtendedBusRoute } from '../data/mockRoutes';
import { MOCK_STOPS, type ExtendedBusStop } from '../data/mockStops';
import { MOCK_BUSES } from '../data/mockBuses';
import type { Bus as BusType, RouteStop } from '../types';

let liveRoutes: ExtendedBusRoute[] = [...MOCK_ROUTES];
let liveStops: ExtendedBusStop[] = [...MOCK_STOPS];
let liveBuses: BusType[] = [...MOCK_BUSES];
let liveRouteStops: RouteStop[] = [...MOCK_ROUTE_STOPS];

export interface JourneyOption {
  id: string;
  route: ExtendedBusRoute;
  departureStop: ExtendedBusStop;
  arrivalStop: ExtendedBusStop;
  busesOnRoute: BusType[];
  estimatedTime: number;
  intermediateStops: ExtendedBusStop[];
  fare: string;
  direction: 'forward' | 'reverse';
  departureTime: string;
}

export const busService = {
  getRoutes(): ExtendedBusRoute[] {
    return liveRoutes;
  },

  getRouteById(id: string): ExtendedBusRoute | undefined {
    return liveRoutes.find(r => r.id === id || r.route_number.toLowerCase() === id.toLowerCase());
  },

  getStops(): ExtendedBusStop[] {
    return liveStops;
  },

  getStopById(id: string): ExtendedBusStop | undefined {
    return liveStops.find(s => s.id === id);
  },

  getBuses(): BusType[] {
    return liveBuses;
  },

  getBusesForRoute(routeId: string): BusType[] {
    return liveBuses.filter(b => b.route_id === routeId);
  },

  getRouteStops(routeId: string): RouteStop[] {
    return liveRouteStops
      .filter(rs => rs.route_id === routeId)
      .sort((a, b) => a.stop_order - b.stop_order);
  },

  getStopsForRoute(routeId: string): (ExtendedBusStop & { travelTime: number; order: number })[] {
    const stopsInOrder = this.getRouteStops(routeId);
    return stopsInOrder.map(rs => {
      const stop = this.getStopById(rs.stop_id);
      return {
        ...(stop || {
          id: rs.stop_id,
          name: 'Stop',
          latitude: 12.97,
          longitude: 77.59,
          created_at: '',
        }),
        travelTime: rs.estimated_travel_time_minutes,
        order: rs.stop_order,
      };
    });
  },

  searchRoutes(query: string, busTypeFilter?: string): ExtendedBusRoute[] {
    let results = [...liveRoutes];
    const q = query.trim().toLowerCase();

    if (q) {
      results = results.filter(route => {
        const matchesNumber = route.route_number.toLowerCase().includes(q);
        const matchesName = route.route_name.toLowerCase().includes(q);
        const matchesSource = route.source.toLowerCase().includes(q);
        const matchesDest = route.destination.toLowerCase().includes(q);
        const matchesVia = route.via?.some(v => v.toLowerCase().includes(q));

        // Also check if any stops on this route match
        const routeStops = this.getStopsForRoute(route.id);
        const matchesStop = routeStops.some(s => s.name.toLowerCase().includes(q) || s.kannadaName?.includes(q));

        return matchesNumber || matchesName || matchesSource || matchesDest || matchesVia || matchesStop;
      });
    }

    if (busTypeFilter && busTypeFilter !== 'all') {
      results = results.filter(r => r.type === busTypeFilter);
    }

    return results;
  },

  findJourneys(originStopId: string, destStopId: string): JourneyOption[] {
    const origin = this.getStopById(originStopId);
    const dest = this.getStopById(destStopId);
    if (!origin || !dest || origin.id === dest.id) return [];

    const matchedOptions: JourneyOption[] = [];

    for (const route of liveRoutes) {
      const stopsForRoute = this.getRouteStops(route.id);
      const originIndex = stopsForRoute.findIndex(rs => rs.stop_id === origin.id);
      const destIndex = stopsForRoute.findIndex(rs => rs.stop_id === dest.id);

      if (originIndex !== -1 && destIndex !== -1 && originIndex !== destIndex) {
        const busesOnRoute = liveBuses.filter(b => b.route_id === route.id);
        const direction = originIndex < destIndex ? 'forward' : 'reverse';
        const start = Math.min(originIndex, destIndex);
        const end = Math.max(originIndex, destIndex);
        const segment = stopsForRoute.slice(start, end + 1);
        const estimatedTime = segment.reduce((sum, s) => sum + s.estimated_travel_time_minutes, 0) || route.approxDurationMinutes;

        const intermediateStops = segment
          .map(s => this.getStopById(s.stop_id))
          .filter((s): s is ExtendedBusStop => !!s);

        matchedOptions.push({
          id: `opt-${route.id}-${origin.id}-${dest.id}`,
          route,
          departureStop: origin,
          arrivalStop: dest,
          busesOnRoute,
          estimatedTime,
          intermediateStops: direction === 'reverse' ? intermediateStops.reverse() : intermediateStops,
          fare: route.fareRange,
          direction,
          departureTime: 'Every ' + route.frequencyMinutes + ' mins',
        });
      }
    }

    return matchedOptions.sort((a, b) => a.estimatedTime - b.estimatedTime);
  },

  // Simulated Admin functions
  addRoute(newRoute: Omit<ExtendedBusRoute, 'id' | 'created_at'>): ExtendedBusRoute {
    const route: ExtendedBusRoute = {
      ...newRoute,
      id: `route-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    liveRoutes = [route, ...liveRoutes];
    return route;
  },

  updateRoute(id: string, updates: Partial<ExtendedBusRoute>): ExtendedBusRoute | null {
    const idx = liveRoutes.findIndex(r => r.id === id);
    if (idx === -1) return null;
    liveRoutes[idx] = { ...liveRoutes[idx], ...updates };
    return liveRoutes[idx];
  },

  deleteRoute(id: string): boolean {
    const prevLen = liveRoutes.length;
    liveRoutes = liveRoutes.filter(r => r.id !== id);
    return liveRoutes.length < prevLen;
  },

  addBus(newBus: Omit<BusType, 'id'>): BusType {
    const bus: BusType = {
      ...newBus,
      id: `bus-${Date.now()}`,
    };
    liveBuses = [bus, ...liveBuses];
    return bus;
  },

  deleteBus(id: string): boolean {
    const prevLen = liveBuses.length;
    liveBuses = liveBuses.filter(b => b.id !== id);
    return liveBuses.length < prevLen;
  },
};
