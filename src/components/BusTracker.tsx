import { useState, useEffect, useRef, useCallback } from 'react';
import { BusTrackerMap, type TrackerStop } from './BusTrackerMap';
import {
  Bus as BusIcon,
  MapPin,
  Users,
  Armchair,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Bell,
  Navigation,
  CheckCircle2,
  Circle,
  Star,
  ChevronRight,
} from 'lucide-react';

export interface BusConfig {
  busNumber: string;
  busType: string;
  source: string;
  destination: string;
  departureTime: string;
  totalSeats: number;
  stops: TrackerStop[];
  centerLat: number;
  centerLng: number;
}

const TRAVEL_TIME_PER_STOP = 20;

type CrowdLevel = 'Low' | 'Moderate' | 'High' | 'Full';
type Direction = 'forward' | 'reverse';

interface SimState {
  currentIndex: number;
  segmentProgress: number;
  availableSeats: number;
  occupiedSeats: number;
  standingPassengers: number;
  isRunning: boolean;
  notifiedStops: Set<number>;
  direction: Direction;
}

function calcCrowdLevel(available: number, standing: number): CrowdLevel {
  if (available >= 20 && standing <= 5) return 'Low';
  if (available >= 10 && standing <= 15) return 'Moderate';
  if (available >= 1 || standing <= 25) return 'High';
  return 'Full';
}

function crowdColor(level: CrowdLevel): string {
  switch (level) {
    case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'Moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'Full': return 'text-red-600 bg-red-50 border-red-200';
  }
}

function crowdIcon(level: CrowdLevel): string {
  switch (level) {
    case 'Low': return '🟢';
    case 'Moderate': return '🟡';
    case 'High': return '🟠';
    case 'Full': return '🔴';
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function reverseStops(stops: TrackerStop[]): TrackerStop[] {
  return [...stops].reverse();
}

export function BusTracker({ config }: { config: BusConfig }) {
  const { busNumber, departureTime, totalSeats, stops, centerLat, centerLng } = config;
  const [selectedDestIndex, setSelectedDestIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const stateRef = useRef<SimState>({
    currentIndex: 0,
    segmentProgress: 0,
    availableSeats: Math.floor(totalSeats * 0.8),
    occupiedSeats: Math.floor(totalSeats * 0.2),
    standingPassengers: 0,
    isRunning: false,
    notifiedStops: new Set(),
    direction: 'forward',
  });
  const [, forceRender] = useState(0);
  const rerender = useCallback(() => forceRender(n => n + 1), []);

  const s = stateRef.current;

  // The stops the bus is currently travelling through, based on direction
  const effectiveStops = s.direction === 'forward' ? stops : reverseStops(stops);

  // Dynamic source/destination based on current direction
  const currentSource = effectiveStops[0].name;
  const currentDestination = effectiveStops[effectiveStops.length - 1].name;

  const fromStop = effectiveStops[s.currentIndex];
  const toStop = effectiveStops[Math.min(s.currentIndex + 1, effectiveStops.length - 1)];
  const busLat = lerp(fromStop.lat, toStop.lat, s.segmentProgress);
  const busLng = lerp(fromStop.lng, toStop.lng, s.segmentProgress);

  // Clamp selectedDestIndex if it's out of bounds for current direction
  const clampedDestIndex = selectedDestIndex !== null && selectedDestIndex < effectiveStops.length
    ? selectedDestIndex
    : null;

  useEffect(() => {
    if (!s.isRunning) return;
    const interval = setInterval(() => {
      const st = stateRef.current;
      const curStops = st.direction === 'forward' ? stops : reverseStops(stops);

      st.segmentProgress += 1 / TRAVEL_TIME_PER_STOP;

      if (st.segmentProgress >= 1) {
        st.segmentProgress = 0;
        st.currentIndex = Math.min(st.currentIndex + 1, curStops.length - 1);

        const boarded = Math.floor(Math.random() * 8);
        const alighted = Math.floor(Math.random() * 8);

        let newStanding = st.standingPassengers + boarded - alighted;
        let newOccupied = st.occupiedSeats;
        let newAvailable = st.availableSeats;

        const canSeat = Math.min(newStanding, newAvailable);
        if (canSeat > 0 && Math.random() > 0.3) {
          newAvailable -= canSeat;
          newOccupied += canSeat;
          newStanding -= canSeat;
        }

        const leaving = Math.floor(Math.random() * 5);
        const actualLeaving = Math.min(leaving, newOccupied);
        newOccupied -= actualLeaving;
        newAvailable += actualLeaving;

        newStanding = Math.max(0, newStanding);
        newAvailable = Math.max(0, Math.min(totalSeats, newAvailable));
        newOccupied = totalSeats - newAvailable;

        st.availableSeats = newAvailable;
        st.occupiedSeats = newOccupied;
        st.standingPassengers = newStanding;

        const destIdx = selectedDestIndex !== null && selectedDestIndex < curStops.length
          ? selectedDestIndex
          : null;

        if (destIdx !== null) {
          const remaining = destIdx - st.currentIndex;

          if (remaining === 2 && !st.notifiedStops.has(st.currentIndex)) {
            st.notifiedStops.add(st.currentIndex);
            setNotification(`🔔 Bus ${busNumber} is approaching your stop. 2 stops remaining.`);
          } else if (remaining === 1 && !st.notifiedStops.has(st.currentIndex)) {
            st.notifiedStops.add(st.currentIndex);
            setNotification(`🔔 Bus ${busNumber} is 1 stop away from your destination.`);
          } else if (remaining === 0 && !st.notifiedStops.has(st.currentIndex)) {
            st.notifiedStops.add(st.currentIndex);
            setNotification(`📍 Bus ${busNumber} has arrived at your destination.`);
            st.isRunning = false;
          }
        }

        // Auto-reverse when reaching either endpoint
        if (st.currentIndex >= curStops.length - 1) {
          st.direction = st.direction === 'forward' ? 'reverse' : 'forward';
          st.currentIndex = 0;
          st.segmentProgress = 0;
          st.notifiedStops = new Set();

          // Simulate passenger turnover at the terminal
          const turnoverBoarded = Math.floor(Math.random() * 10);
          const turnoverAlighted = Math.floor(Math.random() * 10);
          let tStanding = Math.max(0, st.standingPassengers + turnoverBoarded - turnoverAlighted);
          let tOccupied = st.occupiedSeats;
          let tAvailable = st.availableSeats;

          const canSeatT = Math.min(tStanding, tAvailable);
          if (canSeatT > 0 && Math.random() > 0.3) {
            tAvailable -= canSeatT;
            tOccupied += canSeatT;
            tStanding -= canSeatT;
          }

          const leavingT = Math.floor(Math.random() * 8);
          const actualLeavingT = Math.min(leavingT, tOccupied);
          tOccupied -= actualLeavingT;
          tAvailable += actualLeavingT;

          tStanding = Math.max(0, tStanding);
          tAvailable = Math.max(0, Math.min(totalSeats, tAvailable));
          tOccupied = totalSeats - tAvailable;

          st.availableSeats = tAvailable;
          st.occupiedSeats = tOccupied;
          st.standingPassengers = tStanding;

          // If user had selected the last stop of the previous direction (the terminal),
          // they've arrived — keep simulation paused
          if (destIdx !== null && destIdx >= curStops.length - 1) {
            st.isRunning = false;
          }
        }
      }

      rerender();
    }, 1000);

    return () => clearInterval(interval);
  }, [s.isRunning, selectedDestIndex, rerender, busNumber, stops, totalSeats]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleStart = () => {
    s.isRunning = true;
    rerender();
  };

  const handlePause = () => {
    s.isRunning = false;
    rerender();
  };

  const handleReset = () => {
    s.isRunning = false;
    s.currentIndex = 0;
    s.segmentProgress = 0;
    s.direction = 'forward';
    s.availableSeats = Math.floor(totalSeats * 0.8);
    s.occupiedSeats = Math.floor(totalSeats * 0.2);
    s.standingPassengers = 0;
    s.notifiedStops = new Set();
    setSelectedDestIndex(null);
    setNotification(null);
    rerender();
  };

  const handleSelectDest = (index: number) => {
    setSelectedDestIndex(index);
    s.notifiedStops = new Set();
    setNotification(null);
  };

  const crowdLevel = calcCrowdLevel(s.availableSeats, s.standingPassengers);
  const stopsRemaining = clampedDestIndex !== null ? clampedDestIndex - s.currentIndex : 0;
  const etaMinutes = Math.max(0, Math.ceil((stopsRemaining * TRAVEL_TIME_PER_STOP - s.segmentProgress * TRAVEL_TIME_PER_STOP) / 60 * 2));
  const currentStopName = effectiveStops[s.currentIndex].name;
  const nextStopName = s.currentIndex < effectiveStops.length - 1 ? effectiveStops[s.currentIndex + 1].name : 'End of route';

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg">
          <div className="bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <Bell className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm font-medium">{notification}</p>
          </div>
        </div>
      )}

      {/* Bus status hero card */}
      <div className="bg-gradient-to-br from-sky-600 to-sky-800 rounded-2xl shadow-lg overflow-hidden text-white">
        <div className="px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <BusIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bus {busNumber}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-sm bg-emerald-500/30 px-2.5 py-1 rounded-full">
                    <Zap className="w-3.5 h-3.5" /> Electric Bus
                  </span>
                  <span className="text-sm text-sky-100">{departureTime} Departure</span>
                  <span className="text-sm bg-sky-500/30 px-2.5 py-1 rounded-full">
                    {s.direction === 'forward' ? '→' : '←'} {s.direction === 'forward' ? 'Outbound' : 'Return'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-sky-200">Route</p>
              <p className="text-lg font-semibold">{currentSource} → {currentDestination}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-xs text-sky-200">Current Stop</p>
              <p className="text-sm font-semibold mt-0.5">{currentStopName}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-xs text-sky-200">Next Stop</p>
              <p className="text-sm font-semibold mt-0.5">{nextStopName}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-xs text-sky-200">Stops Remaining</p>
              <p className="text-sm font-semibold mt-0.5">
                {clampedDestIndex !== null ? `${stopsRemaining} stop${stopsRemaining !== 1 ? 's' : ''}` : 'Select destination'}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-xs text-sky-200">ETA</p>
              <p className="text-sm font-semibold mt-0.5">
                {clampedDestIndex !== null ? `${etaMinutes} min` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={handleStart}
          disabled={s.isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" /> Start
        </button>
        <button
          onClick={handlePause}
          disabled={!s.isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Pause className="w-4 h-4" /> Pause
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
          <span className={`w-2.5 h-2.5 rounded-full ${s.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          {s.isRunning ? 'Simulation running' : 'Simulation paused'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-slate-800">Live Route Map</h3>
          </div>
          <div className="relative h-[450px]">
            <BusTrackerMap
              stops={effectiveStops}
              currentIndex={s.currentIndex}
              selectedDestIndex={clampedDestIndex}
              busLat={busLat}
              busLng={busLng}
              busNumber={busNumber}
              centerLat={centerLat}
              centerLng={centerLng}
            />
          </div>
        </div>

        {/* Seat availability & passenger status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Armchair className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Seat Availability</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total Seats</span>
                <span className="text-lg font-bold text-slate-800">{totalSeats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">🟢 Available Seats</span>
                <span className="text-lg font-bold text-emerald-600">{s.availableSeats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">🔴 Occupied Seats</span>
                <span className="text-lg font-bold text-red-500">{s.occupiedSeats}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">👥 Standing Passengers</span>
                <span className="text-lg font-bold text-orange-500">{s.standingPassengers}</span>
              </div>

              <div>
                <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
                  <div
                    className="bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(s.availableSeats / totalSeats) * 100}%` }}
                  />
                  <div
                    className="bg-red-400 transition-all duration-500"
                    style={{ width: `${(s.occupiedSeats / totalSeats) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-slate-400">
                  <span>0</span>
                  <span>{totalSeats} seats</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">📊 Crowd Level</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border ${crowdColor(crowdLevel)}`}>
                    {crowdIcon(crowdLevel)} {crowdLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-800">Passenger Status</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Seats Available</span>
                <span className="font-semibold text-slate-800">{s.availableSeats} / {totalSeats}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Occupied Seats</span>
                <span className="font-semibold text-slate-800">{s.occupiedSeats}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Standing</span>
                <span className="font-semibold text-slate-800">{s.standingPassengers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Crowd</span>
                <span className={`font-semibold ${crowdColor(crowdLevel).split(' ')[0]}`}>{crowdLevel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route stops list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-slate-800">Route Stops</h3>
          </div>
          <p className="text-sm text-slate-500">Tap a stop to set as your destination</p>
        </div>
        <div className="divide-y divide-slate-50">
          {effectiveStops.map((stop, i) => {
            const isCompleted = i < s.currentIndex;
            const isCurrent = i === s.currentIndex;
            const isUpcoming = i > s.currentIndex;
            const isDestination = clampedDestIndex === i;
            const remainingFromHere = i - s.currentIndex;

            return (
              <button
                key={stop.id + (s.direction === 'reverse' ? '-r' : '-f')}
                onClick={() => handleSelectDest(i)}
                className={`w-full px-4 py-3.5 flex items-center gap-4 transition-colors text-left ${
                  isDestination ? 'bg-red-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500 ring-4 ring-amber-100 flex items-center justify-center">
                      <BusIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : isDestination ? (
                    <Star className="w-6 h-6 text-red-500 fill-red-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isCompleted ? 'text-slate-400 line-through' : isCurrent ? 'text-amber-700' : isDestination ? 'text-red-700' : 'text-slate-700'}`}>
                      {stop.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Bus is here</span>
                    )}
                    {isDestination && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Destination</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isCompleted
                      ? 'Completed'
                      : isCurrent
                        ? 'Current stop'
                        : isDestination
                          ? `${remainingFromHere} stop${remainingFromHere !== 1 ? 's' : ''} away`
                          : `Stop ${i + 1} of ${effectiveStops.length}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isCompleted && <span className="w-3 h-3 rounded-full bg-emerald-500" />}
                  {isUpcoming && !isDestination && <span className="w-3 h-3 rounded-full bg-blue-400" />}
                  {isDestination && <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200" />}
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
