import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Star,
  Clock,
  Radio,
  MapPin,
  Bell,
  BellOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { busService } from '../services/busService';
import { storageService, type StoredFavourite } from '../services/storageService';
import { MOCK_ANNOUNCEMENTS } from '../data/mockAnnouncements';
import { CROWDING_INFO, BUS_TYPE_INFO, type Bus as BusType } from '../types';

export function PassengerDashboard() {
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState<StoredFavourite[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [notifications, setNotifications] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setFavourites(storageService.getFavourites());
    setRecentSearches(storageService.getRecentSearches());
    setBuses(busService.getBuses());
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleNotification = (busId: string, busNumber: string) => {
    setNotifications(prev => {
      const next = new Set(prev);
      if (next.has(busId)) {
        next.delete(busId);
        triggerToast(`Arrival alert cancelled for ${busNumber}`);
      } else {
        next.add(busId);
        triggerToast(`🔔 Alert active: We will notify you when ${busNumber} is 2 stops away!`);
      }
      return next;
    });
  };

  const removeFavourite = (id: string) => {
    const list = favourites.filter(f => f.id !== id);
    storageService.saveFavourites(list);
    setFavourites(list);
    triggerToast('Removed from favourites');
  };

  const clearRecentSearches = () => {
    storageService.clearRecentSearches();
    setRecentSearches([]);
    triggerToast('Search history cleared');
  };

  // Top 5 upcoming buses by ETA
  const upcomingBuses = [...buses]
    .filter(b => b.eta_next_stop_minutes != null)
    .sort((a, b) => (a.eta_next_stop_minutes ?? 0) - (b.eta_next_stop_minutes ?? 0))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-right duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-red-200 text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Namma Commuter Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Passenger Dashboard</h1>
            <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-xl">
              Track your regular routes, check live arrivals, and monitor real-time crowding across Bengaluru.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/planner"
              className="px-4 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              <span>Plan Journey</span>
            </Link>
            <Link
              to="/tracking"
              className="px-4 py-2.5 bg-red-800/80 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-all border border-red-500/40 flex items-center gap-1.5"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Live Radar Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main: Upcoming Buses & Favourites */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming Buses Live Radar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Radio className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Live Arrivals Radar</h2>
                  <p className="text-xs text-slate-500">Upcoming buses approaching next stops with live crowding</p>
                </div>
              </div>
              <Link to="/tracking" className="text-xs font-bold text-red-600 hover:text-red-700">
                View Full Map →
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {upcomingBuses.map(bus => {
                const crowd = CROWDING_INFO[bus.crowding_level];
                const busTypeInfo = BUS_TYPE_INFO[bus.bus_type];
                const isNotified = notifications.has(bus.id);

                return (
                  <div
                    key={bus.id}
                    className="p-4 rounded-xl border border-slate-200/80 hover:border-red-300 hover:shadow-md transition-all bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-red-600 text-white font-black flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-xs">{bus.bus_number}</span>
                        <span className="text-[9px] font-medium opacity-80">{busTypeInfo.shortLabel}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {bus.route?.route_name || `Route ${bus.bus_number}`}
                          </span>
                          <span className="text-xs font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                            {bus.vehicle_id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Approaching: </span>
                          <strong className="text-slate-800">{bus.next_stop?.name || 'Upcoming Station'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                      {/* ETA */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">ETA</p>
                        <p className="text-lg font-black text-red-600 leading-tight">
                          {bus.eta_next_stop_minutes} <span className="text-xs font-semibold">min</span>
                        </p>
                      </div>

                      {/* Crowding badge */}
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 ${crowd.bgColor} ${crowd.color}`}>
                        <span>{crowd.icon}</span>
                        <span>{crowd.label}</span>
                      </div>

                      {/* Alert toggle */}
                      <button
                        onClick={() => toggleNotification(bus.id, bus.bus_number)}
                        className={`p-2 rounded-xl border transition-colors ${
                          isNotified
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-600 hover:text-red-600 border-slate-200'
                        }`}
                        title={isNotified ? 'Cancel notification' : 'Notify when approaching'}
                      >
                        {isNotified ? <Bell className="w-4 h-4 fill-white" /> : <BellOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Favourites Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Saved Routes & Stops</h2>
                  <p className="text-xs text-slate-500">Quick 1-click access to your frequent commutes</p>
                </div>
              </div>
              <Link to="/favourites" className="text-xs font-bold text-red-600 hover:text-red-700">
                Manage All →
              </Link>
            </div>

            {favourites.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No saved favourites yet.</p>
                <Link to="/routes" className="text-red-600 font-bold hover:underline mt-1 inline-block">
                  Browse routes to add favourites
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {favourites.map(fav => (
                  <div
                    key={fav.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/50 flex items-center justify-between gap-3 group transition-all"
                  >
                    <div
                      className="cursor-pointer space-y-0.5 flex-1"
                      onClick={() => {
                        if (fav.type === 'route') {
                          navigate(`/routes/${fav.id}`);
                        } else {
                          navigate(`/planner?from=${fav.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          {fav.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors">
                          {fav.name}
                        </h4>
                      </div>
                      {fav.subtext && <p className="text-xs text-slate-500 line-clamp-1">{fav.subtext}</p>}
                    </div>

                    <button
                      onClick={() => removeFavourite(fav.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Search Shortcuts & Announcements */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Searches */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Recent Searches</span>
              </h3>
              {recentSearches.length > 0 && (
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-slate-400 hover:text-red-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No recent searches.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recentSearches.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/routes?q=${encodeURIComponent(query)}`)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200/60"
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Commute Tools */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-bold">Commuter Tools</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore your digital daily pass, calculate bus fares, or test administrative fleet simulation.
            </p>
            <div className="space-y-2 pt-1">
              <Link
                to="/ticket"
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center justify-between transition-colors border border-white/10"
              >
                <span>Digital QR Pass Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/planner"
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center justify-between transition-colors border border-white/10"
              >
                <span>Direct Stop-to-Stop Route Finder</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/admin"
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center justify-between transition-colors border border-white/10"
              >
                <span>Admin Fleet Management Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Service Advisories */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-red-600" />
              <span>Service Alerts</span>
            </h3>

            <div className="space-y-2.5 pt-1">
              {MOCK_ANNOUNCEMENTS.slice(0, 3).map(ann => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-red-700">{ann.category}</span>
                    <span className="text-slate-400">{ann.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
