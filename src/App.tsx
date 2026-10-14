import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import type { BusRoute, BusStop, Bus as BusType, CrowdingLevel, RouteStop, BusType as BusTypeKind } from './types';
import { CROWDING_INFO, BUS_TYPE_INFO, BUS_TYPES } from './types';
import { RouteLineGraph } from './components/RouteLineGraph';
import { CrowdPredictionPanel } from './components/CrowdPredictionPanel';
import { RouteMap } from './components/RouteMap';
import { BusRecommendationCard } from './components/BusRecommendationCard';
import { useCrowdForecasts } from './hooks/useCrowdForecasts';
import {
  Bus as BusIcon,
  MapPin,
  Clock,
  Users,
  Navigation,
  Bell,
  BellOff,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  X,
  Route,
  BarChart3,
  Snowflake,
} from 'lucide-react';

interface TripRoute {
  route: BusRoute;
  departureStop: BusStop;
  arrivalStop: BusStop;
  busesOnRoute: BusType[];
  estimatedTime: number;
  direction: 'forward' | 'reverse';
}

function App() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [selectedBusType, setSelectedBusType] = useState<BusTypeKind | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBus, setExpandedBus] = useState<string | null>(null);
  const [expandedCrowdRoute, setExpandedCrowdRoute] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);

  // Trip planner state
  const [originStop, setOriginStop] = useState<BusStop | null>(null);
  const [destinationStop, setDestinationStop] = useState<BusStop | null>(null);
  const [tripRoutes, setTripRoutes] = useState<TripRoute[]>([]);
  const [showTripPlanner, setShowTripPlanner] = useState(true);
  const [selectedTripRoute, setSelectedTripRoute] = useState<TripRoute | null>(null);


  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [routesRes, stopsRes, busesRes, routeStopsRes] = await Promise.all([
        supabase.from('bus_routes').select('*').order('route_number'),
        supabase.from('bus_stops').select('*').order('name'),
        supabase
          .from('buses')
          .select(`*, route:bus_routes(*), next_stop:bus_stops(*)`)
          .eq('is_active', true),
        supabase.from('route_stops').select('*').order('stop_order'),
      ]);

      if (routesRes.data) setRoutes(routesRes.data);
      if (stopsRes.data) setStops(stopsRes.data);
      if (busesRes.data) setBuses(busesRes.data as BusType[]);
      if (routeStopsRes.data) setRouteStops(routeStopsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Find routes between origin and destination (both directions)
  const findRoutes = useCallback((origin: BusStop, destination: BusStop) => {
    const foundRoutes: TripRoute[] = [];

    for (const route of routes) {
      const stopsForRoute = routeStops
        .filter(rs => rs.route_id === route.id)
        .sort((a, b) => a.stop_order - b.stop_order);

      const originIndex = stopsForRoute.findIndex(rs => rs.stop_id === origin.id);
      const destIndex = stopsForRoute.findIndex(rs => rs.stop_id === destination.id);

      if (originIndex !== -1 && destIndex !== -1 && originIndex !== destIndex) {
        const busesOnRoute = buses.filter(b => b.route_id === route.id);
        const direction: 'forward' | 'reverse' = originIndex < destIndex ? 'forward' : 'reverse';
        const startIndex = Math.min(originIndex, destIndex);
        const endIndex = Math.max(originIndex, destIndex);
        const segmentStops = stopsForRoute.slice(startIndex, endIndex + 1);
        const estimatedTime = segmentStops.reduce((sum, rs) => sum + rs.estimated_travel_time_minutes, 0);

        foundRoutes.push({
          route,
          departureStop: origin,
          arrivalStop: destination,
          busesOnRoute,
          estimatedTime,
          direction,
        });
      }
    }

    return foundRoutes.sort((a, b) => a.estimatedTime - b.estimatedTime);
  }, [routes, routeStops, buses]);

  useEffect(() => {
    if (originStop && destinationStop && originStop.id !== destinationStop.id) {
      const routes = findRoutes(originStop, destinationStop);
      setTripRoutes(routes);
    } else {
      setTripRoutes([]);
    }
  }, [originStop, destinationStop, findRoutes]);

  const filteredBuses = buses.filter(b => {
    if (selectedRoute && b.route_id !== selectedRoute.id) return false;
    if (selectedStop && b.next_stop_id !== selectedStop.id) return false;
    if (selectedBusType && b.bus_type !== selectedBusType) return false;
    return true;
  });

  const upcomingBuses = filteredBuses
    .filter(b => b.eta_next_stop_minutes != null)
    .sort((a, b) => (a.eta_next_stop_minutes ?? 0) - (b.eta_next_stop_minutes ?? 0));

  const toggleNotification = (busId: string) => {
    setNotifications(prev => {
      const next = new Set(prev);
      if (next.has(busId)) {
        next.delete(busId);
        showToast('Notification removed', 'info');
        return next;
      }
      next.add(busId);
      showToast('You will be notified when this bus arrives', 'success');
      return next;
    });
  };

  const routeIds = routes.map(r => r.id);
  const { forecasts, refreshForecasts } = useCrowdForecasts(routeIds);

  const clearTrip = () => {
    setOriginStop(null);
    setDestinationStop(null);
    setTripRoutes([]);
    setSelectedTripRoute(null);
    setSelectedRoute(null);
  };

  const swapStops = () => {
    const temp = originStop;
    setOriginStop(destinationStop);
    setDestinationStop(temp);
    setSelectedTripRoute(null);
  };

  const getCrowdingInfo = (level: CrowdingLevel) => CROWDING_INFO[level];

  const getSeatProbability = (bus: BusType) => {
    const percentage = (bus.seats_available / bus.total_capacity) * 100;
    if (percentage >= 70) return { label: 'High', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (percentage >= 40) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100' };
    if (percentage >= 10) return { label: 'Low', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'None', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading bus data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-blue-600'
            } text-white animate-in slide-in-from-right duration-300`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">BMTC Bus Tracker</h1>
                <p className="text-sm text-slate-500">Bengaluru • Real-time crowding & arrival info</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-white text-slate-800 shadow-sm"
                >
                  All Buses
                </button>
              </div>
              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchData();
                }}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-slate-700">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Trip Planner */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <button
            onClick={() => setShowTripPlanner(!showTripPlanner)}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Route className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-slate-800">Plan Your Trip</h2>
                <p className="text-sm text-slate-500">
                  {originStop && destinationStop
                    ? `${originStop.name} → ${destinationStop.name}`
                    : 'Select origin and destination stops'}
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {showTripPlanner ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showTripPlanner && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr,auto] gap-3 items-end">
                {/* Origin */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1 text-emerald-500" />
                    From
                  </label>
                  <select
                    value={originStop?.id || ''}
                    onChange={e => {
                      const stop = stops.find(s => s.id === e.target.value);
                      setOriginStop(stop || null);
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-slate-50"
                  >
                    <option value="">Select origin stop</option>
                    {stops.map(stop => (
                      <option key={stop.id} value={stop.id} disabled={stop.id === destinationStop?.id}>
                        {stop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap button */}
                <button
                  onClick={swapStops}
                  disabled={!originStop && !destinationStop}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Swap origin and destination"
                >
                  <ArrowRight className="w-5 h-5 text-slate-600 rotate-90" />
                </button>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1 text-red-500" />
                    To
                  </label>
                  <select
                    value={destinationStop?.id || ''}
                    onChange={e => {
                      const stop = stops.find(s => s.id === e.target.value);
                      setDestinationStop(stop || null);
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 bg-slate-50"
                  >
                    <option value="">Select destination stop</option>
                    {stops.map(stop => (
                      <option key={stop.id} value={stop.id} disabled={stop.id === originStop?.id}>
                        {stop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear button */}
                <button
                  onClick={clearTrip}
                  disabled={!originStop && !destinationStop}
                  className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Clear trip"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Trip results */}
              {originStop && destinationStop && (
                <div className="mt-4">
                  {tripRoutes.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-700">
                          {tripRoutes.length} route{tripRoutes.length !== 1 ? 's' : ''} found
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{originStop.name} → {destinationStop.name}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tripRoutes.map(trip => (
                          <div
                            key={trip.route.id}
                            className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div
                              className="px-4 py-3 text-white"
                              style={{ backgroundColor: trip.route.color }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-2xl font-bold">{trip.route.route_number}</span>
                                  <p className="text-sm opacity-90">{trip.route.route_name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-semibold">{trip.estimatedTime} min</p>
                                  <p className="text-xs opacity-90">est. travel</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 bg-slate-50">
                              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span>{trip.departureStop.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span>{trip.arrivalStop.name}</span>
                              </div>

                              {trip.busesOnRoute.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <p className="text-xs text-slate-500 mb-2">Next buses:</p>
                                  <div className="space-y-1">
                                    {trip.busesOnRoute
                                      .filter(b => b.eta_next_stop_minutes != null)
                                      .sort((a, b) => (a.eta_next_stop_minutes ?? 0) - (b.eta_next_stop_minutes ?? 0))
                                      .slice(0, 2)
                                      .map(bus => {
                                        const crowding = getCrowdingInfo(bus.crowding_level);
                                        return (
                                          <div
                                            key={bus.id}
                                            className="flex items-center justify-between text-xs"
                                          >
                                            <span className="text-slate-700">
                                              <Clock className="w-3 h-3 inline mr-1" />
                                              {bus.eta_next_stop_minutes ?? 0} min
                                            </span>
                                            <span className={crowding.color}>
                                              {crowding.icon} {crowding.label}
                                            </span>
                                            <span className="text-slate-600">
                                              {bus.seats_available} seats
                                            </span>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedRoute(trip.route);
                                  setSelectedTripRoute(trip);
                                }}
                                className="mt-3 w-full py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                View on Map
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-amber-800 font-medium">No direct routes found</p>
                      <p className="text-sm text-amber-600 mt-1">
                        Try different stops or check for connecting routes
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Best Bus Recommendation */}
        <BusRecommendationCard
          buses={buses}
          routes={routes}
          tripRoutes={tripRoutes.length > 0 ? tripRoutes : undefined}
          forecasts={forecasts}
          originStop={originStop}
          destinationStop={destinationStop}
          onSelectBus={busId => {
            setExpandedBus(busId);
            const el = document.getElementById(`bus-${busId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          onViewOnMap={routeId => {
            const route = routes.find(r => r.id === routeId);
            if (route) setSelectedRoute(route);
            const el = document.getElementById('route-map-section');
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />

        {/* Crowd Prediction Section */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Crowd Prediction</h2>
                <p className="text-sm text-slate-500">Current levels and forecast for the next 15, 30 & 60 minutes</p>
              </div>
            </div>
          </div>

          {routes.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No routes available</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {routes.map(route => {
                const forecast = forecasts[route.id];
                const isExpanded = expandedCrowdRoute === route.id;

                return (
                  <div key={route.id}>
                    {/* Route header row */}
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                      onClick={() => setExpandedCrowdRoute(isExpanded ? null : route.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
                          style={{ backgroundColor: route.color }}
                        >
                          {route.route_number}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{route.route_name}</p>
                          {forecast ? (
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs font-medium ${CROWDING_INFO[forecast.current].color}`}>
                                {CROWDING_INFO[forecast.current].icon} {CROWDING_INFO[forecast.current].label}
                              </span>
                              <span className="text-slate-300">|</span>
                              <span className="text-xs text-slate-400">
                                +15: {CROWDING_INFO[forecast.in15].label}
                              </span>
                              <span className="text-xs text-slate-400">
                                +30: {CROWDING_INFO[forecast.in30].label}
                              </span>
                              <span className="text-xs text-slate-400">
                                +60: {CROWDING_INFO[forecast.in60].label}
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400">Loading forecast...</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {forecast?.userAdjusted && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">
                            Live
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded crowd prediction panel */}
                    {isExpanded && forecast && (
                      <div className="px-4 pb-4 pt-1">
                        <CrowdPredictionPanel
                          route={route}
                          forecast={forecast}
                          onReportSubmitted={refreshForecasts}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bus filter bar */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Filter:</span>
              <select
                value={selectedRoute?.id || ''}
                onChange={e => {
                  const route = routes.find(r => r.id === e.target.value);
                  setSelectedRoute(route || null);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Routes</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.route_number} — {route.route_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedBusType || ''}
                onChange={e => {
                  setSelectedBusType((e.target.value || null) as BusTypeKind | null);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {BUS_TYPES.map(type => (
                  <option key={type} value={type}>
                    {BUS_TYPE_INFO[type].label}
                  </option>
                ))}
              </select>
            </div>

            {(selectedRoute || selectedBusType) && (
              <button
                onClick={() => {
                  setSelectedRoute(null);
                  setSelectedBusType(null);
                }}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}

            <div className="ml-auto text-sm text-slate-500">
              {upcomingBuses.length} bus{upcomingBuses.length !== 1 ? 'es' : ''} nearby
            </div>
          </div>
        </div>

        {/* Upcoming buses list */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" />
            Upcoming Buses
          </h2>

          {upcomingBuses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <BusIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No buses arriving soon. Try changing your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBuses.map(bus => {
                const route = routes.find(r => r.id === bus.route_id);
                if (!route) return null;
                const crowding = getCrowdingInfo(bus.crowding_level);
                const seatProb = getSeatProbability(bus);
                const isExpanded = expandedBus === bus.id;
                const isNotified = notifications.has(bus.id);
                const busTypeInfo = BUS_TYPE_INFO[bus.bus_type];

                return (
                  <div
                    key={bus.id}
                    id={`bus-${bus.id}`}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                      isExpanded ? 'ring-2 ring-blue-400' : 'hover:shadow-md'
                    }`}
                  >
                    {/* Bus card header */}
                    <div
                      className="px-4 py-3 text-white flex items-center justify-between"
                      style={{ backgroundColor: route.color }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{bus.bus_number}</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {busTypeInfo.icon} {busTypeInfo.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold leading-none">{bus.eta_next_stop_minutes}</p>
                        <p className="text-xs opacity-90">min</p>
                      </div>
                    </div>

                    {/* Bus card body */}
                    <div className="p-4">
                      <p className="text-sm font-medium text-slate-800 mb-1">{route.route_name}</p>
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Next: {bus.next_stop?.name || 'Unknown'}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${crowding.bgColor} ${crowding.color}`}>
                          {crowding.icon} {crowding.label}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${seatProb.bg} ${seatProb.color}`}>
                          {bus.seats_available}/{bus.total_capacity} seats
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedBus(isExpanded ? null : bus.id)}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-1"
                        >
                          {isExpanded ? 'Less info' : 'More info'}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleNotification(bus.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isNotified
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                          }`}
                          title={isNotified ? 'Notification on' : 'Get notified'}
                        >
                          {isNotified ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Vehicle ID</span>
                            <span className="font-medium text-slate-700">{bus.vehicle_id}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Speed</span>
                            <span className="font-medium text-slate-700">
                              {bus.speed != null ? `${bus.speed} km/h` : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Heading</span>
                            <span className="font-medium text-slate-700">
                              {bus.heading != null ? `${Math.round(bus.heading)}°` : '—'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Last updated</span>
                            <span className="font-medium text-slate-700">
                              {new Date(bus.last_updated).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Crowding</span>
                            <span className={`font-medium ${crowding.color}`}>{crowding.label}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Seats available</span>
                            <span className="font-medium text-slate-700">
                              {bus.seats_available} / {bus.total_capacity}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Route Map Section */}
        <div id="route-map-section" className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-slate-800">Route Map</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200 inline-block" />
                <span>Origin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200 inline-block" />
                <span>Destination</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span>Stop</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-2 rounded-full bg-slate-800 inline-block" />
                <span>Bus</span>
              </div>
              {(originStop || destinationStop || selectedRoute) && (
                <button
                  onClick={clearTrip}
                  className="ml-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Map container — fixed height so Leaflet renders correctly */}
          <div className="relative h-[520px]">
            <RouteMap
              routes={routes}
              stops={stops}
              routeStops={routeStops}
              buses={buses}
              selectedRoute={selectedRoute}
              originStop={originStop}
              destinationStop={destinationStop}
              forecasts={forecasts}
              onStopClick={stop => setSelectedStop(prev => prev?.id === stop.id ? null : stop)}
              onBusClick={busId => setExpandedBus(busId)}
            />
          </div>

          {/* Route line graph below map when a trip route is selected */}
          {selectedTripRoute && (
            <div className="border-t border-slate-100">
              <div className="px-4 py-2 flex items-center justify-between bg-slate-50">
                <p className="text-sm font-medium text-slate-700">
                  Stop-by-stop view — Route {selectedTripRoute.route.route_number}
                </p>
                <button
                  onClick={() => setSelectedTripRoute(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Close
                </button>
              </div>
              <RouteLineGraph
                route={selectedTripRoute.route}
                stops={stops}
                routeStops={routeStops}
                buses={selectedTripRoute.busesOnRoute}
                originStop={originStop}
                destinationStop={destinationStop}
                direction={selectedTripRoute.direction}
                onBusClick={busId => setExpandedBus(busId)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-slate-500">
          <p>Last updated: {new Date().toLocaleTimeString()} | Auto-refresh every 10 seconds</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
