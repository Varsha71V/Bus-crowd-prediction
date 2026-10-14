import { useState } from 'react';
import { BusTracker, type BusConfig } from '../components/BusTracker';
import { BUS_290_CONFIG, BUS_300_CONFIG, BUS_290EY_CONFIG } from '../components/busConfigs';
import { Radio, Bus, MapPin, Info, Sparkles } from 'lucide-react';

const TRACKING_FLEET: { id: string; name: string; routeDesc: string; type: string; config: BusConfig }[] = [
  {
    id: '290EN',
    name: '290EN (Electric)',
    routeDesc: 'Yelahanka ↔ Nagawara Junction (Manyata)',
    type: 'Electric EV',
    config: BUS_290_CONFIG,
  },
  {
    id: '300E',
    name: '300E (Electric)',
    routeDesc: 'Shivajinagar ↔ Banasawadi ↔ KR Puram',
    type: 'Electric EV',
    config: BUS_300_CONFIG,
  },
  {
    id: '290EY',
    name: '290EY (Electric Express)',
    routeDesc: 'Kempegowda Station (Majestic) ↔ Yelahanka',
    type: 'Electric EV',
    config: BUS_290EY_CONFIG,
  },
];

export function LiveTrackingPage() {
  const [selectedBusId, setSelectedBusId] = useState<string>('290EN');

  const currentBus = TRACKING_FLEET.find(b => b.id === selectedBusId) || TRACKING_FLEET[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 text-red-600 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Live Bus GPS Radar & Tracking
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track live simulated BMTC buses moving in real time along Bengaluru route corridors.
          </p>
        </div>

        {/* Demo Mode Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl text-amber-800 text-xs font-semibold w-fit">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Interactive Demo Mode • Simulated Telemetry</span>
        </div>
      </div>

      {/* Bus Selector Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Bus className="w-4 h-4 text-red-600" />
          <span>Select Active Bus to Track on Map</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TRACKING_FLEET.map(b => {
            const isSelected = b.id === selectedBusId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBusId(b.id)}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-red-50/80 border-red-500 shadow-sm ring-1 ring-red-500'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black ${isSelected ? 'text-red-700' : 'text-slate-900'}`}>
                    Bus {b.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    {b.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{b.routeDesc}</p>
                <div className="mt-2 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>{b.config.stops.length} Stops Active</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive BusTracker Component with Leaflet Map & Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6">
        <BusTracker key={currentBus.id} config={currentBus.config} />
      </div>

      {/* Educational Information Note */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>About BMTC Live Simulation Mode</span>
        </div>
        <p>
          Simulated buses smoothly interpolate between GPS coordinates on real Bangalore roadways. The engine dynamically calculates available seat counts, crowd status, and notifies you when the bus approaches your chosen stop.
        </p>
      </div>
    </div>
  );
}
