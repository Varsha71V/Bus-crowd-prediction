import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Route,
  Filter,
  Radio,
  Star,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { busService } from '../services/busService';
import { storageService } from '../services/storageService';
import { BUS_TYPE_INFO, type BusType as BusTypeKind } from '../types';

export function RouteSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [busTypeFilter, setBusTypeFilter] = useState<'all' | BusTypeKind>('all');
  const [sortBy, setSortBy] = useState<'number' | 'duration' | 'frequency'>('number');
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const favs = storageService.getFavourites().map(f => f.id);
    setFavouriteIds(new Set(favs));
  }, []);

  // Update query if URL param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
      storageService.addRecentSearch(val.trim());
    } else {
      setSearchParams({});
    }
  };

  const toggleFavourite = (routeId: string, routeNumber: string, routeName: string) => {
    const isAdded = storageService.toggleFavourite({
      id: routeId,
      type: 'route',
      name: routeNumber,
      subtext: routeName,
    });
    setFavouriteIds(prev => {
      const next = new Set(prev);
      if (isAdded) {
        next.add(routeId);
        showToast(`Route ${routeNumber} added to favourites`);
      } else {
        next.delete(routeId);
        showToast(`Route ${routeNumber} removed from favourites`);
      }
      return next;
    });
  };

  // Filter routes using busService
  const filteredRoutes = useMemo(() => {
    let list = busService.searchRoutes(query, busTypeFilter);

    if (sortBy === 'number') {
      list.sort((a, b) => a.route_number.localeCompare(b.route_number, undefined, { numeric: true }));
    } else if (sortBy === 'duration') {
      list.sort((a, b) => a.approxDurationMinutes - b.approxDurationMinutes);
    } else if (sortBy === 'frequency') {
      list.sort((a, b) => a.frequencyMinutes - b.frequencyMinutes);
    }

    return list;
  }, [query, busTypeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-right duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header and Search Filters */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            BMTC Route Catalog & Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search Bengaluru bus routes by bus number, starting point, destination, or intermediate stops.
          </p>
        </div>

        {/* Search bar & filter pills */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by route number (e.g. 500-D), stop name (e.g. Silk Board), or corridor..."
              value={query}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-md px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Bus Type Filter Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Fleet:
              </span>
              {[
                { id: 'all', label: 'All Buses' },
                { id: 'electric', label: '⚡ Electric (EV)' },
                { id: 'ac', label: '❄ Vajra AC' },
                { id: 'non-ac', label: '🚐 Non-AC Ordinary' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBusTypeFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    busTypeFilter === tab.id
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium outline-none focus:border-red-500"
              >
                <option value="number">Route Number</option>
                <option value="duration">Fastest Duration</option>
                <option value="frequency">Highest Frequency</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Showing {filteredRoutes.length} matching routes</span>
        {query && <span>Filter: "{query}"</span>}
      </div>

      {/* Routes Grid / Cards */}
      {filteredRoutes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <Route className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching BMTC routes found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try searching by key Bengaluru terminals like "Majestic", "Silk Board", "Whitefield", "Hebbal", or bus codes like "500-D", "335-E", or "290".
          </p>
          <button
            onClick={() => {
              setQuery('');
              setBusTypeFilter('all');
              setSearchParams({});
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 transition-colors inline-block mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutes.map(route => {
            const typeInfo = BUS_TYPE_INFO[route.type];
            const isFav = favouriteIds.has(route.id);
            const stopsForRoute = busService.getStopsForRoute(route.id);

            return (
              <div
                key={route.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-red-400/80 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top line: Route number pill + Bus type badge + Fav button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-xl text-sm font-black text-white shadow-xs"
                        style={{ backgroundColor: route.color }}
                      >
                        {route.route_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.bgColor} ${typeInfo.color} ${typeInfo.borderColor}`}>
                        {typeInfo.shortLabel}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleFavourite(route.id, route.route_number, route.route_name)}
                      className={`p-2 rounded-lg border transition-colors ${
                        isFav
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
                      }`}
                      title={isFav ? 'Remove favourite' : 'Save favourite'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Route Name & Terminals */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition-colors line-clamp-1">
                      {route.route_name}
                    </h3>
                    <div className="mt-2 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="font-medium text-slate-800 line-clamp-1">{route.source}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                        <span className="font-medium text-slate-800 line-clamp-1">{route.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Intermediate Stops pill preview */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Key Intermediate Stops ({stopsForRoute.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {stopsForRoute.slice(0, 3).map(st => (
                        <span
                          key={st.id}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium"
                        >
                          {st.name.split(' (')[0]}
                        </span>
                      ))}
                      {stopsForRoute.length > 3 && (
                        <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-bold">
                          +{stopsForRoute.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics: duration, frequency, fare */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Travel Time</p>
                      <p className="text-xs font-bold text-slate-800">~{route.approxDurationMinutes}m</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Frequency</p>
                      <p className="text-xs font-bold text-emerald-600">Every {route.frequencyMinutes}m</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Fare</p>
                      <p className="text-xs font-bold text-slate-800">{route.fareRange}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/routes/${route.id}`}
                    className="text-xs font-bold text-slate-700 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <span>View All Stops</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to="/tracking"
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>Track Live</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
