import { useState, useMemo } from 'react';
import {
  Shield,
  Bus,
  Route as RouteIcon,
  Users,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  X,
  Send,
  Zap,
} from 'lucide-react';
import { busService } from '../services/busService';
import { type ExtendedBusRoute } from '../data/mockRoutes';
import { BUS_TYPE_INFO, CROWDING_INFO, type Bus as BusType } from '../types';

export function AdminDashboardPage() {
  const [routes, setRoutes] = useState<ExtendedBusRoute[]>(() => busService.getRoutes());
  const [buses] = useState<BusType[]>(() => busService.getBuses());
  const [activeTab, setActiveTab] = useState<'routes' | 'buses' | 'analytics'>('routes');
  const [searchFilter, setSearchFilter] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Add Route Modal state
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteNumber, setNewRouteNumber] = useState('');
  const [newRouteName, setNewRouteName] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newType, setNewType] = useState<'electric' | 'ac' | 'non-ac'>('electric');
  const [newDuration, setNewDuration] = useState('40');

  // Broadcast Announcement state
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annCategory, setAnnCategory] = useState('Service Alert');
  const [annBody, setAnnBody] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteNumber || !newRouteName || !newSource || !newDestination) {
      showToast('Please fill all mandatory route fields');
      return;
    }

    const created = busService.addRoute({
      route_number: newRouteNumber.toUpperCase().trim(),
      route_name: newRouteName.trim(),
      source: newSource.trim(),
      destination: newDestination.trim(),
      color: newType === 'electric' ? '#059669' : newType === 'ac' ? '#2563EB' : '#DC2626',
      type: newType,
      fareRange: '₹15 - ₹35',
      approxDurationMinutes: parseInt(newDuration, 10) || 40,
      frequencyMinutes: 12,
      firstBus: '06:00 AM',
      lastBus: '10:30 PM',
      distanceKm: 18.5,
      totalStops: 5,
      via: [newSource, newDestination],
    });

    setRoutes(busService.getRoutes());
    setShowAddRouteModal(false);
    setNewRouteNumber('');
    setNewRouteName('');
    setNewSource('');
    setNewDestination('');
    showToast(`✓ Route ${created.route_number} added successfully (Simulated)`);
  };

  const handleDeleteRoute = (id: string, num: string) => {
    if (window.confirm(`Are you sure you want to delete Route ${num} from simulated fleet?`)) {
      busService.deleteRoute(id);
      setRoutes(busService.getRoutes());
      showToast(`Route ${num} removed`);
    }
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle) return;
    setShowAnnounceModal(false);
    setAnnTitle('');
    setAnnBody('');
    showToast('✓ Announcement dispatched to all Bengaluru terminals (Demo)');
  };

  // Filtered views
  const filteredRoutes = useMemo(() => {
    if (!searchFilter.trim()) return routes;
    const q = searchFilter.toLowerCase();
    return routes.filter(
      r =>
        r.route_number.toLowerCase().includes(q) ||
        r.route_name.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
    );
  }, [routes, searchFilter]);

  const filteredBuses = useMemo(() => {
    if (!searchFilter.trim()) return buses;
    const q = searchFilter.toLowerCase();
    return buses.filter(
      b =>
        b.bus_number.toLowerCase().includes(q) ||
        b.vehicle_id.toLowerCase().includes(q) ||
        b.route?.route_name?.toLowerCase().includes(q)
    );
  }, [buses, searchFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-right duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-900 text-white rounded-xl">
              <Shield className="w-5 h-5 text-red-500" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fleet Operations & Dispatch Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulated administrative portal for Bengaluru Metropolitan Transport Corporation fleet managers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAnnounceModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </button>
          <button
            onClick={() => setShowAddRouteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Route</span>
          </button>
        </div>
      </div>

      {/* Demo Disclaimer Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-red-500/20 text-red-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </span>
          <p className="text-xs">
            <strong>Demonstration Console:</strong> All additions, modifications, and deletions operate in local simulated memory and are not sent to any production server.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 uppercase tracking-wider">
          Read-Write Sandbox
        </span>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Active Corridors</span>
            <RouteIcon className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{routes.length}</p>
          <p className="text-[10px] text-emerald-600 font-bold">100% On Schedule</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Simulated Fleet</span>
            <Bus className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{buses.length} Buses</p>
          <p className="text-[10px] text-slate-400">Telemetry transmitting</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Zero-Emission EV Ratio</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {Math.round((routes.filter(r => r.type === 'electric').length / routes.length) * 100)}%
          </p>
          <p className="text-[10px] text-emerald-600 font-bold">Bangalore Clean Air Goal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Average Occupancy</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">54%</p>
          <p className="text-[10px] text-slate-400">Optimal Passenger Flow</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'routes', label: `Manage Routes (${routes.length})` },
              { id: 'buses', label: `Fleet Tracker (${buses.length})` },
              { id: 'analytics', label: 'Occupancy Analytics' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter table records..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Tab 1: Routes Management Table */}
        {activeTab === 'routes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Route No.</th>
                  <th className="py-3 px-3">Route Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Frequency</th>
                  <th className="py-3 px-3">Fare</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRoutes.map(route => {
                  const typeInfo = BUS_TYPE_INFO[route.type];
                  return (
                    <tr key={route.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <span
                          className="px-2 py-0.5 rounded text-white text-[11px]"
                          style={{ backgroundColor: route.color }}
                        >
                          {route.route_number}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{route.route_name}</p>
                        <p className="text-[10px] text-slate-400">{route.source} → {route.destination}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor}`}>
                          {typeInfo.shortLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3">~{route.approxDurationMinutes}m</td>
                      <td className="py-3 px-3 font-semibold text-emerald-700">Every {route.frequencyMinutes}m</td>
                      <td className="py-3 px-3">{route.fareRange}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteRoute(route.id, route.route_number)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Bus Fleet Table */}
        {activeTab === 'buses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Bus Code</th>
                  <th className="py-3 px-3">Vehicle Plate</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Next Stop</th>
                  <th className="py-3 px-3">ETA</th>
                  <th className="py-3 px-3">Crowd Status</th>
                  <th className="py-3 px-3">Speed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBuses.map(bus => {
                  const crowd = CROWDING_INFO[bus.crowding_level];
                  return (
                    <tr key={bus.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{bus.bus_number}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{bus.vehicle_id}</td>
                      <td className="py-3 px-3">{bus.route?.route_name || 'Assigned corridor'}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{bus.next_stop?.name || '—'}</td>
                      <td className="py-3 px-3 font-bold text-red-600">{bus.eta_next_stop_minutes} min</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${crowd.bgColor} ${crowd.color}`}>
                          {crowd.icon} {crowd.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{bus.speed} km/h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Analytics and Route Congestion */}
        {activeTab === 'analytics' && (
          <div className="p-4 space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Hourly Commuter Peak Congestion Model (Bengaluru)</h3>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-48 pt-6 pb-2 border-b border-slate-200">
              {[
                { time: '6 AM', level: 25 },
                { time: '7 AM', level: 50 },
                { time: '8 AM', level: 85 },
                { time: '9 AM', level: 98 },
                { time: '10 AM', level: 90 },
                { time: '11 AM', level: 60 },
                { time: '12 PM', level: 45 },
                { time: '2 PM', level: 40 },
                { time: '4 PM', level: 55 },
                { time: '6 PM', level: 95 },
                { time: '8 PM', level: 90 },
                { time: '10 PM', level: 35 },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    className={`w-full rounded-t-lg transition-all group-hover:opacity-80 ${
                      bar.level >= 80 ? 'bg-red-500' : bar.level >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ height: `${bar.level}%` }}
                    title={`${bar.time}: ${bar.level}% ridership`}
                  />
                  <span className="text-[9px] font-semibold text-slate-500 whitespace-nowrap">{bar.time}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-500 rounded"></span> Peak Rush Hour (80-100%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-400 rounded"></span> Moderate Load (50-80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-400 rounded"></span> Off-Peak Comfortable (&lt;50%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Route Modal Dialog */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New BMTC Route</h3>
              <button onClick={() => setShowAddRouteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Route Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 500-NA"
                    value={newRouteNumber}
                    onChange={e => setNewRouteNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bus Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                  >
                    <option value="electric">⚡ Electric EV</option>
                    <option value="ac">❄ Vajra AC</option>
                    <option value="non-ac">🚐 Non-AC Ordinary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Route Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Majestic to Electronic City via Silk Board"
                  value={newRouteName}
                  onChange={e => setNewRouteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Starting Point (Origin)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kempegowda Bus Station"
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ending Point (Destination)</label>
                  <input
                    type="text"
                    placeholder="e.g. Electronic City Toll Gate"
                    value={newDestination}
                    onChange={e => setNewDestination(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Travel Time (Minutes)</label>
                <input
                  type="number"
                  value={newDuration}
                  onChange={e => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md shadow-red-600/20"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Broadcast Service Announcement</h3>
              <button onClick={() => setShowAnnounceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={annCategory}
                  onChange={e => setAnnCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                >
                  <option value="Service Alert">Service Alert</option>
                  <option value="Route Change">Route Change</option>
                  <option value="Metro Feeder">Metro Feeder</option>
                  <option value="Passenger Info">Passenger Info</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Detour near Hebbal Flyover due to metro girder launch"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Body</label>
                <textarea
                  rows={3}
                  placeholder="Detailed information for passengers..."
                  value={annBody}
                  onChange={e => setAnnBody(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAnnounceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
