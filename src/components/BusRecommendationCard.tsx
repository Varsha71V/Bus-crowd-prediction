import { useMemo } from 'react';
import { Star, Clock, Users, Armchair, TrendingUp, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import type { Bus as BusType, BusRoute, BusStop, RouteCrowdForecast } from '../types';
import { CROWDING_INFO, BUS_TYPE_INFO } from '../types';

interface BusRecommendationCardProps {
  buses: BusType[];
  routes: BusRoute[];
  tripRoutes?: { route: BusRoute; estimatedTime: number; busesOnRoute: BusType[] }[];
  forecasts: Record<string, RouteCrowdForecast>;
  originStop: BusStop | null;
  destinationStop: BusStop | null;
  onSelectBus: (busId: string) => void;
  onViewOnMap: (routeId: string) => void;
}

const CROWD_RANK: Record<string, number> = {
  empty: 5, low: 4, moderate: 3, high: 2, full: 1,
};

const CROWD_GRADE: Record<string, { label: string; color: string; bg: string }> = {
  empty:    { label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  low:      { label: 'Good',      color: 'text-green-700',   bg: 'bg-green-50 border-green-200' },
  moderate: { label: 'Fair',      color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  high:     { label: 'Crowded',   color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200' },
  full:     { label: 'Full',      color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
};

interface ScoredBus {
  bus: BusType;
  route: BusRoute;
  estimatedTripTime?: number;
  totalScore: number;
  etaScore: number;
  crowdScore: number;
  seatScore: number;
  etaGrade: string;
  crowdGrade: string;
  seatGrade: string;
  reasons: string[];
}

function scoreBus(
  bus: BusType,
  route: BusRoute,
  estimatedTripTime: number | undefined,
  forecasts: Record<string, RouteCrowdForecast>,
): ScoredBus {
  // ── ETA score (0–40 pts): closer = better ───────────────────────────────
  const eta = bus.eta_next_stop_minutes ?? 30;
  const etaScore = eta <= 2 ? 40 : eta <= 5 ? 35 : eta <= 10 ? 28 : eta <= 15 ? 18 : eta <= 20 ? 10 : 4;
  const etaGrade = eta <= 2 ? 'Arriving' : eta <= 5 ? 'Very soon' : eta <= 10 ? 'Soon' : `${eta} min`;

  // ── Crowd score (0–35 pts): from live level + route forecast ────────────
  const liveCrowdRank = CROWD_RANK[bus.crowding_level] ?? 3;
  const forecastCrowdRank = CROWD_RANK[forecasts[bus.route_id]?.current ?? bus.crowding_level] ?? 3;
  const blendedCrowdRank = (liveCrowdRank * 0.6 + forecastCrowdRank * 0.4);
  const crowdScore = Math.round((blendedCrowdRank / 5) * 35);
  const crowdGrade = bus.crowding_level;

  // ── Seat score (0–25 pts): seat fill ratio ──────────────────────────────
  const seatRatio = bus.seats_available / bus.total_capacity;
  const seatScore = Math.round(seatRatio * 25);
  const seatRatioPct = Math.round(seatRatio * 100);
  const seatGrade =
    seatRatioPct >= 60 ? 'Many seats' :
    seatRatioPct >= 30 ? 'Some seats' :
    seatRatioPct >= 10 ? 'Few seats' : 'Standing only';

  // ── Reason fragments ─────────────────────────────────────────────────────
  const reasons: string[] = [];
  if (eta <= 3) reasons.push('Arriving very soon');
  else if (eta <= 7) reasons.push(`Only ${eta} min away`);
  if (liveCrowdRank >= 4) reasons.push('Comfortable ride');
  if (seatRatioPct >= 50) reasons.push(`${bus.seats_available} seats free`);
  if (forecasts[bus.route_id]?.recentReportCount > 0) reasons.push('Live crowd data');

  return {
    bus,
    route,
    estimatedTripTime,
    totalScore: etaScore + crowdScore + seatScore,
    etaScore,
    crowdScore,
    seatScore,
    etaGrade,
    crowdGrade,
    seatGrade,
    reasons,
  };
}

function ScorePill({ label, value, max, icon, color }: {
  label: string; value: number; max: number; icon: React.ReactNode; color: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500">{value}/{max}</span>
    </div>
  );
}

export function BusRecommendationCard({
  buses,
  routes,
  tripRoutes,
  forecasts,
  originStop,
  destinationStop,
  onSelectBus,
  onViewOnMap,
}: BusRecommendationCardProps) {
  const { best, alternatives, mode } = useMemo(() => {
    let candidates: ScoredBus[] = [];
    let mode: 'trip' | 'general' = 'general';

    if (tripRoutes && tripRoutes.length > 0 && originStop && destinationStop) {
      mode = 'trip';
      for (const tr of tripRoutes) {
        for (const bus of tr.busesOnRoute) {
          if (bus.eta_next_stop_minutes == null) continue;
          const route = routes.find(r => r.id === bus.route_id);
          if (!route) continue;
          candidates.push(scoreBus(bus, route, tr.estimatedTime, forecasts));
        }
      }
    } else {
      mode = 'general';
      for (const bus of buses) {
        if (bus.eta_next_stop_minutes == null || !bus.is_active) continue;
        const route = routes.find(r => r.id === bus.route_id);
        if (!route) continue;
        candidates.push(scoreBus(bus, route, undefined, forecasts));
      }
    }

    candidates.sort((a, b) => b.totalScore - a.totalScore);
    return {
      best: candidates[0] ?? null,
      alternatives: candidates.slice(1, 4),
      mode,
    };
  }, [buses, routes, tripRoutes, forecasts, originStop, destinationStop]);

  if (!best) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Best Bus Recommendation</h2>
        </div>
        <div className="flex items-center gap-3 text-slate-500 bg-slate-50 rounded-xl p-4 mt-2">
          <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <p className="text-sm">No active buses with ETA data right now. Check back soon.</p>
        </div>
      </div>
    );
  }

  const crowd = CROWDING_INFO[best.crowdGrade as keyof typeof CROWDING_INFO];
  const crowdStyle = CROWD_GRADE[best.crowdGrade] ?? CROWD_GRADE.moderate;
  const scorePercent = Math.round((best.totalScore / 100) * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Star className="w-5 h-5 text-amber-600 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Best Bus Recommendation</h2>
            <p className="text-xs text-slate-500">
              {mode === 'trip' && originStop && destinationStop
                ? `Scored for ${originStop.name} → ${destinationStop.name}`
                : 'Best available bus right now across all routes'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          {scorePercent}% match
        </div>
      </div>

      {/* Best bus hero */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Route badge */}
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md"
              style={{ backgroundColor: best.route.color }}
            >
              {best.route.route_number}
            </div>
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-base font-bold text-slate-900">{best.bus.bus_number}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BUS_TYPE_INFO[best.bus.bus_type].bgColor} ${BUS_TYPE_INFO[best.bus.bus_type].color} border ${BUS_TYPE_INFO[best.bus.bus_type].borderColor}`}>
                {BUS_TYPE_INFO[best.bus.bus_type].icon} {BUS_TYPE_INFO[best.bus.bus_type].label}
              </span>
              <span className="text-sm text-slate-500 truncate">{best.route.route_name}</span>
              {best.reasons.map((r, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r}</span>
              ))}
            </div>

            {/* Key metrics row */}
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-blue-500 font-medium leading-none">ETA</p>
                  <p className="text-sm font-bold text-blue-800 leading-tight">{best.etaGrade}</p>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 ${crowdStyle.bg}`}>
                <Users className={`w-4 h-4 ${crowdStyle.color}`} />
                <div>
                  <p className={`text-xs font-medium leading-none ${crowdStyle.color}`}>Crowd</p>
                  <p className={`text-sm font-bold leading-tight ${crowdStyle.color}`}>
                    {crowd.icon} {crowdStyle.label}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 border ${
                best.bus.seats_available > 20 ? 'bg-emerald-50 border-emerald-200' :
                best.bus.seats_available > 5  ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <Armchair className={`w-4 h-4 ${
                  best.bus.seats_available > 20 ? 'text-emerald-600' :
                  best.bus.seats_available > 5  ? 'text-amber-600' : 'text-red-600'
                }`} />
                <div>
                  <p className={`text-xs font-medium leading-none ${
                    best.bus.seats_available > 20 ? 'text-emerald-600' :
                    best.bus.seats_available > 5  ? 'text-amber-600' : 'text-red-600'
                  }`}>Seats</p>
                  <p className={`text-sm font-bold leading-tight ${
                    best.bus.seats_available > 20 ? 'text-emerald-800' :
                    best.bus.seats_available > 5  ? 'text-amber-800' : 'text-red-800'
                  }`}>{best.seatGrade}</p>
                </div>
              </div>

              {best.estimatedTripTime && (
                <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-lg px-3 py-1.5">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  <div>
                    <p className="text-xs text-violet-500 font-medium leading-none">Trip</p>
                    <p className="text-sm font-bold text-violet-800 leading-tight">{best.estimatedTripTime} min</p>
                  </div>
                </div>
              )}
            </div>

            {/* Score bars */}
            <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ScorePill
                label="ETA"
                value={best.etaScore}
                max={40}
                icon={<Clock className="w-3 h-3" />}
                color="text-blue-500"
              />
              <ScorePill
                label="Crowd"
                value={best.crowdScore}
                max={35}
                icon={<Users className="w-3 h-3" />}
                color="text-amber-500"
              />
              <ScorePill
                label="Seats"
                value={best.seatScore}
                max={25}
                icon={<Armchair className="w-3 h-3" />}
                color="text-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSelectBus(best.bus.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            View Bus Details
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewOnMap(best.route.id)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            Map
          </button>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Other options</p>
          <div className="space-y-2">
            {alternatives.map(alt => {
              const altCrowd = CROWDING_INFO[alt.crowdGrade as keyof typeof CROWDING_INFO];
              const altCrowdStyle = CROWD_GRADE[alt.crowdGrade] ?? CROWD_GRADE.moderate;
              return (
                <button
                  key={alt.bus.id}
                  onClick={() => onSelectBus(alt.bus.id)}
                  className="w-full flex items-center gap-3 p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all text-left"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: alt.route.color }}
                  >
                    {alt.route.route_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-800 truncate">{alt.bus.bus_number}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${BUS_TYPE_INFO[alt.bus.bus_type].bgColor} ${BUS_TYPE_INFO[alt.bus.bus_type].color}`}>
                        {BUS_TYPE_INFO[alt.bus.bus_type].label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{alt.route.route_name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {alt.etaGrade}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${altCrowdStyle.bg} ${altCrowdStyle.color}`}>
                      {altCrowd.icon} {altCrowdStyle.label}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {Math.round((alt.totalScore / 100) * 100)}%
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
