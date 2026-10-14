import type { BusStop, Bus as BusType, BusRoute, RouteStop } from '../types';
import { CROWDING_INFO, BUS_TYPE_INFO } from '../types';
import { Navigation, Clock, Users } from 'lucide-react';

interface RouteLineGraphProps {
  route: BusRoute;
  stops: BusStop[];
  routeStops: RouteStop[];
  buses: BusType[];
  originStop: BusStop | null;
  destinationStop: BusStop | null;
  direction?: 'forward' | 'reverse';
  onBusClick?: (busId: string) => void;
}

export function RouteLineGraph({
  route,
  stops,
  routeStops,
  buses,
  originStop,
  destinationStop,
  direction = 'forward',
  onBusClick,
}: RouteLineGraphProps) {
  // Get stops for this route in order
  const routeStopIds = routeStops
    .filter(rs => rs.route_id === route.id)
    .sort((a, b) => a.stop_order - b.stop_order);

  // Find the segment we're interested in
  const originIndex = originStop ? routeStopIds.findIndex(rs => rs.stop_id === originStop.id) : 0;
  const destIndex = destinationStop ? routeStopIds.findIndex(rs => rs.stop_id === destinationStop.id) : routeStopIds.length - 1;

  // If no valid segment, show all stops
  const startIndex = originIndex !== -1 ? originIndex : 0;
  const endIndex = destIndex !== -1 ? destIndex : routeStopIds.length - 1;

  // Get the stops in the segment (in stored order)
  const lo = Math.min(startIndex, endIndex);
  const hi = Math.max(startIndex, endIndex);
  const segmentRouteStops = routeStopIds.slice(lo, hi + 1);

  // Reverse for reverse direction so display matches travel direction
  const orderedRouteStops = direction === 'reverse' ? [...segmentRouteStops].reverse() : segmentRouteStops;

  const segmentStops = orderedRouteStops
    .map(rs => {
      const stop = stops.find(s => s.id === rs.stop_id);
      return stop ? { ...stop, order: rs.stop_order, travelTime: rs.estimated_travel_time_minutes } : null;
    })
    .filter((s): s is BusStop & { order: number; travelTime: number } => s !== null);

  // Calculate cumulative travel times
  let cumulativeTime = 0;
  const stopsWithTimes = segmentStops.map((stop, index) => {
    const time = index === 0 ? 0 : orderedRouteStops[index]?.estimated_travel_time_minutes || 0;
    cumulativeTime += time;
    return { ...stop, cumulativeTime, individualTime: time };
  });

  const totalTime = cumulativeTime;

  // Position buses along the route
  const busesWithPosition = buses
    .filter(bus => bus.route_id === route.id && bus.eta_next_stop_minutes != null)
    .map(bus => {
      // Find position based on next stop and ETA
      const nextStopIndex = stopsWithTimes.findIndex(s => s.id === bus.next_stop_id);

      if (nextStopIndex === -1) {
        // Bus not in segment, estimate position
        return { ...bus, position: 0 };
      }

      const nextStop = stopsWithTimes[nextStopIndex];
      const prevStopTime = nextStopIndex > 0 ? stopsWithTimes[nextStopIndex - 1].cumulativeTime : 0;
      const segmentDuration = nextStop.cumulativeTime - prevStopTime;
      const eta = bus.eta_next_stop_minutes || 0;
      const progress = segmentDuration > 0 ? 1 - (eta / segmentDuration) : 0;

      const position = prevStopTime + (segmentDuration * Math.max(0, Math.min(1, progress)));
      const totalPosition = position / totalTime;

      return { ...bus, position: totalPosition * 100, nextStopIndex };
    });

  if (stopsWithTimes.length < 2) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No route information available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Route header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ backgroundColor: route.color }}
          >
            {route.route_number}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{route.route_name}</h3>
            <p className="text-sm text-slate-500">
              {stopsWithTimes.length} stops • ~{Math.round(totalTime)} min total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <BusIcon className="w-4 h-4" />
            <span>{buses.length} buses</span>
          </div>
        </div>
      </div>

      {/* Line graph */}
      <div className="relative mb-8">
        {/* Progress bar background */}
        <div className="relative h-2 bg-slate-200 rounded-full overflow-visible">
          {/* Route line */}
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: '100%', backgroundColor: route.color, opacity: 0.3 }}
          />
        </div>

        {/* Stop markers */}
        <div className="relative mt-[-13px]">
          {stopsWithTimes.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === stopsWithTimes.length - 1;
            const isOrigin = stop.id === originStop?.id;
            const isDestination = stop.id === destinationStop?.id;
            const position = totalTime > 0 ? stop.cumulativeTime / totalTime : index / (stopsWithTimes.length - 1);

            return (
              <div
                key={stop.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${position * 100}%` }}
              >
                {/* Stop line */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 w-0.5 h-6 -translate-y-1/2"
                  style={{ backgroundColor: route.color, opacity: 0.5 }}
                />

                {/* Stop circle */}
                <div
                  className={`relative z-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-125 ${
                    isOrigin || isDestination
                      ? 'w-6 h-6 ring-4 ring-white shadow-lg'
                      : isFirst || isLast
                        ? 'w-5 h-5 ring-2 ring-white shadow-md'
                        : 'w-4 h-4 ring-2 ring-white shadow'
                  }`}
                  style={{
                    backgroundColor: isOrigin ? '#10B981' : isDestination ? '#EF4444' : route.color,
                  }}
                >
                  {(isOrigin || isDestination) && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                {/* Stop label */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap ${
                    index % 2 === 0 ? 'top-8' : 'bottom-8'
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    isOrigin || isDestination ? 'text-slate-800' : 'text-slate-600'
                  }`}>
                    {stop.name}
                  </div>
                  {stop.individualTime > 0 && (
                    <div className="text-xs text-slate-400 text-center mt-0.5">
                      +{stop.individualTime} min
                    </div>
                  )}
                </div>

                {/* Origin/Destination badge */}
                {isOrigin && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      ORIGIN
                    </span>
                  </div>
                )}
                {isDestination && (
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      DESTINATION
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bus markers */}
        {busesWithPosition.map(bus => {
          const crowding = CROWDING_INFO[bus.crowding_level];

          return (
            <div
              key={bus.id}
              className="absolute transform -translate-x-1/2 cursor-pointer group"
              style={{ left: `${bus.position}%`, top: '-35px' }}
              onClick={() => onBusClick?.(bus.id)}
            >
              {/* Bus icon */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                style={{ backgroundColor: route.color }}
              >
                <Navigation className="w-4 h-4" />
              </div>

              {/* Bus tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                  <div className="font-semibold">{bus.bus_number}</div>
                  <div className="text-sm text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ETA: {bus.eta_next_stop_minutes} min
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${crowding.color.replace('text-', 'text-')}`}>
                    <Users className="w-3 h-3" />
                    {crowding.label} • {bus.seats_available} seats
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
              </div>

              {/* Bus number badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-1.5 py-0.5 rounded text-xs font-bold shadow" style={{ color: route.color }}>
                {bus.bus_number.split('-')[1]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time scale */}
      <div className="flex justify-between px-1 text-xs text-slate-400 mt-4">
        <span>0 min</span>
        {stopsWithTimes.length > 2 && (
          <span>{Math.round(totalTime / 2)} min</span>
        )}
        <span>{Math.round(totalTime)} min</span>
      </div>

      {/* Legend */}
      <div className="mt-8 pt-4 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-700 mb-2">Crowding Level</p>
        <div className="flex flex-wrap gap-3">
          {Object.values(CROWDING_INFO).map(info => (
            <div key={info.level} className="flex items-center gap-1.5 text-xs">
              <span>{info.icon}</span>
              <span className="text-slate-600">{info.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bus list */}
      {busesWithPosition.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            Buses on this route
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {busesWithPosition
              .sort((a, b) => (a.eta_next_stop_minutes || 0) - (b.eta_next_stop_minutes || 0))
              .map(bus => {
                const crowding = CROWDING_INFO[bus.crowding_level];
                return (
                  <div
                    key={bus.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => onBusClick?.(bus.id)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: route.color }}
                    >
                      {bus.bus_number.split('-')[1]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          {bus.eta_next_stop_minutes} min
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${BUS_TYPE_INFO[bus.bus_type].bgColor} ${BUS_TYPE_INFO[bus.bus_type].color}`}>
                          {BUS_TYPE_INFO[bus.bus_type].label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        to {bus.next_stop?.name || 'Next Stop'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs">
                        <span>{crowding.icon}</span>
                        <span className={crowding.color}>{bus.seats_available} seats</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// Bus icon component for the legend
function BusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6" />
      <path d="M15 6v6" />
      <path d="M2 12v-4a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v4" />
      <path d="M2 12v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2 -2v-4" />
      <path d="M7 18v2" />
      <path d="M17 18v2" />
      <path d="M8 9h8" />
    </svg>
  );
}
