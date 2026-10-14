import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Radio,
  Users,
  Star,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { busService } from '../services/busService';
import { storageService } from '../services/storageService';
import { RouteLineGraph } from '../components/RouteLineGraph';
import { CrowdPredictionPanel } from '../components/CrowdPredictionPanel';
import { useCrowdForecasts } from '../hooks/useCrowdForecasts';
import { BUS_TYPE_INFO, CROWDING_INFO } from '../types';

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();

  const route = useMemo(() => {
    if (!routeId) return undefined;
    return busService.getRouteById(routeId);
  }, [routeId]);

  const stops = useMemo(() => busService.getStops(), []);
  const routeStops = useMemo(() => {
    if (!route) return [];
    return busService.getRouteStops(route.id);
  }, [route]);

  const stopsForRoute = useMemo(() => {
    if (!route) return [];
    return busService.getStopsForRoute(route.id);
  }, [route]);

  const busesOnRoute = useMemo(() => {
    if (!route) return [];
    return busService.getBusesForRoute(route.id);
  }, [route]);

  const { forecasts } = useCrowdForecasts(route ? [route.id] : []);
  const forecast = route ? forecasts[route.id] : undefined;

  const [isFav, setIsFav] = useState(() => (route ? storageService.isFavourite(route.id) : false));
  const [toast, setToast] = useState<string | null>(null);

  if (!route) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Route not found</h2>
        <p className="text-xs text-slate-500">The requested BMTC route could not be loaded.</p>
        <Link
          to="/routes"
          className="inline-flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Routes
        </Link>
      </div>
    );
  }

  const typeInfo = BUS_TYPE_INFO[route.type];

  const handleToggleFav = () => {
    const added = storageService.toggleFavourite({
      id: route.id,
      type: 'route',
      name: route.route_number,
      subtext: route.route_name,
    });
    setIsFav(added);
    setToast(added ? `Route ${route.route_number} saved to favourites` : 'Removed from favourites');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast alert */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-right duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Back button */}
      <div>
        <Link
          to="/routes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Routes</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-md shrink-0"
              style={{ backgroundColor: route.color }}
            >
              <span className="text-lg">{route.route_number}</span>
              <span className="text-[10px] font-medium opacity-90">{typeInfo.shortLabel}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor}`}>
                  {typeInfo.label} Fleet
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">{route.distanceKm} km route length</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {route.route_name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Via: {route.via ? route.via.join(' → ') : `${route.source} to ${route.destination}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFav}
              className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
                isFav
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-amber-200'
              }`}
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isFav ? 'Saved' : 'Save'}</span>
            </button>

            <Link
              to="/tracking"
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Track Live on Map</span>
            </Link>
          </div>
        </div>

        {/* Schedule & Fare Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Operating Hours</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{route.firstBus} - {route.lastBus}</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Frequency</p>
            <p className="text-sm font-bold text-emerald-600 mt-0.5">Every {route.frequencyMinutes} mins</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Travel</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">~{route.approxDurationMinutes} mins</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Commuter Fare</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{route.fareRange}</p>
          </div>
        </div>
      </div>

      {/* Grid: Route Schematic & Live Buses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Intermediate Stop Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ordered Intermediate Stops</h3>
                <p className="text-xs text-slate-500">Official sequential stop progression with cumulative time</p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {stopsForRoute.length} Stops
              </span>
            </div>

            {/* Visual Schematic Line Graph */}
            <div className="py-2 border-y border-slate-100">
              <RouteLineGraph
                route={route}
                stops={stops}
                routeStops={routeStops}
                buses={busesOnRoute}
                originStop={stopsForRoute[0] || null}
                destinationStop={stopsForRoute[stopsForRoute.length - 1] || null}
                onBusClick={() => navigate('/tracking')}
              />
            </div>

            {/* Ordered Stop List Table */}
            <div className="space-y-3">
              {stopsForRoute.map((stop, index) => {
                const isOrigin = index === 0;
                const isDestination = index === stopsForRoute.length - 1;

                return (
                  <div
                    key={stop.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/60"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isOrigin
                            ? 'bg-emerald-600 text-white'
                            : isDestination
                            ? 'bg-red-600 text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{stop.name}</h4>
                        {stop.kannadaName && (
                          <p className="text-[10px] text-slate-500 font-normal">{stop.kannadaName}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-600">
                        {index === 0 ? 'Start' : `+${stop.travelTime}m`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Crowd Prediction & Active Fleet */}
        <div className="lg:col-span-5 space-y-6">
          {/* Crowd Prediction Panel */}
          {forecast && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Crowd Forecast</h3>
                  <p className="text-xs text-slate-500">Real-time prediction and commuter reporting</p>
                </div>
              </div>

              <CrowdPredictionPanel
                route={route}
                forecast={forecast}
                onReportSubmitted={() => {
                  setToast('Thank you! Your crowd report was recorded.');
                  setTimeout(() => setToast(null), 3000);
                }}
              />
            </div>
          )}

          {/* Active Buses currently on this route */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Active Fleet on Route</h3>
                  <p className="text-xs text-slate-500">{busesOnRoute.length} buses running</p>
                </div>
              </div>
            </div>

            {busesOnRoute.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No simulated buses currently active on this specific route.
              </p>
            ) : (
              <div className="space-y-3">
                {busesOnRoute.map(bus => {
                  const crowd = CROWDING_INFO[bus.crowding_level];
                  return (
                    <div
                      key={bus.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          Bus {bus.bus_number} ({bus.vehicle_id})
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${crowd.bgColor} ${crowd.color}`}>
                          {crowd.icon} {crowd.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Approaching: <strong>{bus.next_stop?.name || 'Upcoming stop'}</strong></span>
                        <span className="font-bold text-red-600">ETA {bus.eta_next_stop_minutes}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Disclaimer badge */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Simulated Data Disclaimer</span>
            </div>
            <p>
              Bus timings, intermediate stops, and fares are representative sample models aligned with BMTC Bangalore schedules for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
