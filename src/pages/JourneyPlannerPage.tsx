import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ArrowUpDown,
  Route,
  Radio,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { busService } from '../services/busService';
import { BusRecommendationCard } from '../components/BusRecommendationCard';
import { useCrowdForecasts } from '../hooks/useCrowdForecasts';
import { BUS_TYPE_INFO } from '../types';

export function JourneyPlannerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const stops = useMemo(() => busService.getStops(), []);
  const routes = useMemo(() => busService.getRoutes(), []);
  const allBuses = useMemo(() => busService.getBuses(), []);

  const [originId, setOriginId] = useState(searchParams.get('from') || '');
  const [destId, setDestId] = useState(searchParams.get('to') || '');
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);

  // Sync state with URL params
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && from !== originId) setOriginId(from);
    if (to && to !== destId) setDestId(to);
  }, [searchParams]);

  const handleOriginChange = (val: string) => {
    setOriginId(val);
    setSearchParams(prev => {
      if (val) prev.set('from', val);
      else prev.delete('from');
      return prev;
    });
  };

  const handleDestChange = (val: string) => {
    setDestId(val);
    setSearchParams(prev => {
      if (val) prev.set('to', val);
      else prev.delete('to');
      return prev;
    });
  };

  const swapStops = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
    setSearchParams(prev => {
      if (destId) prev.set('from', destId);
      else prev.delete('from');
      if (temp) prev.set('to', temp);
      else prev.delete('to');
      return prev;
    });
  };

  const journeyOptions = useMemo(() => {
    if (!originId || !destId || originId === destId) return [];
    return busService.findJourneys(originId, destId);
  }, [originId, destId]);

  const originStop = stops.find(s => s.id === originId) || null;
  const destinationStop = stops.find(s => s.id === destId) || null;

  const routeIds = useMemo(() => routes.map(r => r.id), [routes]);
  const { forecasts } = useCrowdForecasts(routeIds);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-red-100 text-red-600 rounded-xl">
            <Route className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            BMTC Smart Journey Planner
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select boarding and destination stops across Bengaluru to discover matching direct routes and smart bus recommendations.
        </p>
      </div>

      {/* Origin / Destination Search Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
          {/* Origin Stop */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Boarding Stop (Origin)</span>
            </label>
            <select
              value={originId}
              onChange={e => handleOriginChange(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
            >
              <option value="">Select starting stop...</option>
              {stops.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === destId}>
                  {s.name} {s.zone ? `(${s.zone} Zone)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center pt-2 md:pt-5">
            <button
              onClick={swapStops}
              disabled={!originId && !destId}
              className="p-3 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Swap origin and destination"
            >
              <ArrowUpDown className="w-4 h-4 md:rotate-90" />
            </button>
          </div>

          {/* Destination Stop */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>Destination Stop</span>
            </label>
            <select
              value={destId}
              onChange={e => handleDestChange(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
            >
              <option value="">Select destination stop...</option>
              {stops.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === originId}>
                  {s.name} {s.zone ? `(${s.zone} Zone)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Commuter Pairs:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: 'Majestic ↔ Electronic City', from: 'stop-kbs', to: 'stop-ecity' },
              { label: 'Majestic ↔ Whitefield', from: 'stop-kbs', to: 'stop-whitefield' },
              { label: 'Majestic ↔ Yelahanka', from: 'stop-kbs', to: 'stop-yelahanka' },
              { label: 'Shivajinagar ↔ KR Puram', from: 'stop-shivajinagar', to: 'stop-krpuram' },
            ].map((pair, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOriginId(pair.from);
                  setDestId(pair.to);
                  setSearchParams({ from: pair.from, to: pair.to });
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                {pair.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {!originId || !destId ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <Route className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Select Boarding and Destination Stops</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose both stops above to discover direct BMTC bus options and AI-assisted seating recommendations.
          </p>
        </div>
      ) : journeyOptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Direct BMTC Bus Route Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No single direct bus connects the selected stops in the demo dataset. Try selecting an interchange hub such as Kempegowda Bus Station (Majestic) or Central Silk Board.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Found {journeyOptions.length} matching journey options</span>
            <span>Sorted by shortest duration</span>
          </div>

          {/* AI Recommendation Widget */}
          <BusRecommendationCard
            buses={allBuses}
            routes={routes}
            tripRoutes={journeyOptions.map(j => ({
              route: j.route,
              estimatedTime: j.estimatedTime,
              busesOnRoute: j.busesOnRoute,
            }))}
            forecasts={forecasts}
            originStop={originStop}
            destinationStop={destinationStop}
            onSelectBus={() => navigate('/tracking')}
            onViewOnMap={routeId => navigate(`/routes/${routeId}`)}
          />

          {/* Journey Options List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">All Matching Bus Options</h3>

            {journeyOptions.map(opt => {
              const typeInfo = BUS_TYPE_INFO[opt.route.type];
              const isExpanded = expandedOptionId === opt.id;

              return (
                <div
                  key={opt.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-red-300 transition-all p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl text-white font-black flex flex-col items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: opt.route.color }}
                      >
                        <span className="text-xs">{opt.route.route_number}</span>
                        <span className="text-[9px] font-medium opacity-90">{typeInfo.shortLabel}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{opt.route.route_name}</h4>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {opt.departureStop.name} → {opt.arrivalStop.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Est. Travel Time</p>
                        <p className="text-base font-black text-slate-800">~{opt.estimatedTime} min</p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Frequency</p>
                        <p className="text-xs font-bold text-emerald-600">{opt.departureTime}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Fare</p>
                        <p className="text-xs font-bold text-slate-800">{opt.fare}</p>
                      </div>
                    </div>
                  </div>

                  {/* Toggle intermediate stops */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                      onClick={() => setExpandedOptionId(isExpanded ? null : opt.id)}
                      className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'Hide' : 'View'} Intermediate Stops ({opt.intermediateStops.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/routes/${opt.route.id}`}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        Route Details
                      </Link>
                      <Link
                        to="/tracking"
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Radio className="w-3 h-3" />
                        <span>Track Bus</span>
                      </Link>
                    </div>
                  </div>

                  {/* Expanded Intermediate Stop Sequence */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                      <p className="font-bold text-slate-700">Journey Sequence:</p>
                      <div className="space-y-1.5 pl-2 border-l-2 border-red-500 ml-1">
                        {opt.intermediateStops.map((stop, idx) => (
                          <div key={stop.id} className="flex items-center justify-between text-slate-600">
                            <span className="font-medium text-slate-800">
                              {idx + 1}. {stop.name}
                            </span>
                            {idx === 0 && <span className="text-[10px] font-bold text-emerald-600 uppercase">Boarding</span>}
                            {idx === opt.intermediateStops.length - 1 && <span className="text-[10px] font-bold text-red-600 uppercase">Alighting</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
