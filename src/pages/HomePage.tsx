import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Search,
  MapPin,
  Route as RouteIcon,
  Radio,
  ArrowRight,
  Zap,
  Users,
  Sparkles,
  ChevronRight,
  Flame,
  Calendar,
} from 'lucide-react';
import { busService } from '../services/busService';
import { MOCK_ANNOUNCEMENTS } from '../data/mockAnnouncements';
import { BUS_TYPE_INFO } from '../types';

export function HomePage() {
  const navigate = useNavigate();
  const routes = busService.getRoutes();
  const stops = busService.getStops();

  const [fromStopId, setFromStopId] = useState('');
  const [toStopId, setToStopId] = useState('');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  const handleHeroPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromStopId && toStopId) {
      navigate(`/planner?from=${fromStopId}&to=${toStopId}`);
    } else {
      navigate('/planner');
    }
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      navigate(`/routes?q=${encodeURIComponent(quickSearchQuery.trim())}`);
    }
  };

  const popularRoutes = routes.slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and description */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-red-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3"></span>
                <span>Bengaluru's Smart Urban Mobility Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Travel smarter across{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                  Namma Bengaluru
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
                Real-time crowding forecasts, live animated GPS bus radar, seat probability guidance, and seamless journey planning for every BMTC route.
              </p>

              {/* Quick Route Search input */}
              <form onSubmit={handleQuickSearch} className="max-w-xl flex items-center gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search bus number, route name or stop (e.g. 500-D, Silk Board)..."
                    value={quickSearchQuery}
                    onChange={e => setQuickSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 focus:border-red-400 focus:bg-white/15 rounded-xl text-white placeholder:text-slate-400 text-sm outline-none transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/30 transition-all shrink-0 flex items-center gap-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick tags */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 justify-center lg:justify-start">
                <span>Popular:</span>
                {['500-D', '335-E (Vajra)', '290EN (Electric)', 'Majestic to E-City'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const clean = tag.split(' ')[0];
                      navigate(`/routes?q=${encodeURIComponent(clean)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Quick Trip Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-xl text-slate-800 p-6 sm:p-7 rounded-2xl shadow-2xl border border-white/40 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                      <RouteIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Quick Journey Planner</h3>
                      <p className="text-xs text-slate-500">Find direct buses between two stops</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                    Live Demo
                  </span>
                </div>

                <form onSubmit={handleHeroPlan} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      From (Origin Stop)
                    </label>
                    <select
                      value={fromStopId}
                      onChange={e => setFromStopId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    >
                      <option value="">Select origin stop...</option>
                      {stops.map(s => (
                        <option key={s.id} value={s.id} disabled={s.id === toStopId}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      To (Destination Stop)
                    </label>
                    <select
                      value={toStopId}
                      onChange={e => setToStopId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    >
                      <option value="">Select destination stop...</option>
                      {stops.map(s => (
                        <option key={s.id} value={s.id} disabled={s.id === fromStopId}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Find Matching Buses</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <Link to="/tracking" className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    Open Live Bus Radar
                  </Link>
                  <Link to="/routes" className="hover:text-slate-800 font-medium">
                    View All Routes →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics / Key Indicators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Fleet Today', value: '6,450+', sub: 'Daily operating buses', icon: Bus, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Electric EV Buses', value: '1,200+', sub: 'Zero-emission routes', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Daily Commuters', value: '5.2 Million', sub: 'Bengaluru public transit', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Live GPS Coverage', value: '98.6%', sub: 'Real-time telemetry', icon: Radio, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-[10px] text-slate-400">{stat.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-100 text-red-700 rounded-md">
                <Flame className="w-4 h-4" />
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Popular Commuter Corridors</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">High-frequency arterial routes connecting major tech parks and hubs</p>
          </div>
          <Link
            to="/routes"
            className="text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group"
          >
            <span>View All Routes</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRoutes.map(route => {
            const typeInfo = BUS_TYPE_INFO[route.type];
            return (
              <div
                key={route.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-red-300 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-xs"
                      style={{ backgroundColor: route.color }}
                    >
                      {route.route_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor}`}>
                      {typeInfo.shortLabel}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-red-600 transition-colors line-clamp-2">
                    {route.route_name}
                  </h3>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-semibold text-slate-800">~{route.approxDurationMinutes} mins</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-semibold text-emerald-700">Every {route.frequencyMinutes}m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fare:</span>
                      <span className="font-semibold text-slate-800">{route.fareRange}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/routes/${route.id}`}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900"
                  >
                    Details
                  </Link>
                  <Link
                    to="/tracking"
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Radio className="w-3 h-3 text-red-600" />
                    <span>Track Bus</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-50 to-red-50/40 rounded-2xl p-6 sm:p-10 border border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-100/70 px-3 py-1 rounded-full">
              Modern Commuter Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Everything you need to navigate Bengaluru
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Designed with precision for passengers, commuters, and fleet dispatchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Crowd Forecast Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Check whether your bus has empty seats or is packed before it even reaches your stop. Visual timelines show expected crowding in +15, +30, and +60 minutes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Live Interactive Map Radar</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Watch simulated buses travel stop-by-stop across OpenStreetMap. Test play, pause, speed control, and reverse simulation on real Bangalore routes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Intelligent Bus Recommendation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our smart algorithm scores incoming buses based on ETA, live crowding level, and seat availability ratio, advising you which bus offers the most comfortable journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements & Service Notices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
              <Calendar className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Service Advisories & News</h2>
          </div>
          <Link to="/announcements" className="text-xs font-bold text-red-600 hover:text-red-700">
            View All ({MOCK_ANNOUNCEMENTS.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_ANNOUNCEMENTS.slice(0, 2).map(ann => (
            <div
              key={ann.id}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ann.badgeColor}`}>
                  {ann.category}
                </span>
                <span className="text-[11px] text-slate-400">{ann.date}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ann.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
