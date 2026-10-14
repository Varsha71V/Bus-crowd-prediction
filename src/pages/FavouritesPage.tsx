import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Route,
  MapPin,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle2,
  Radio,
  Plus,
} from 'lucide-react';
import { storageService, type StoredFavourite } from '../services/storageService';

export function FavouritesPage() {
  const [favourites, setFavourites] = useState<StoredFavourite[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setFavourites(storageService.getFavourites());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const removeFavourite = (id: string, name: string) => {
    const next = favourites.filter(f => f.id !== id);
    storageService.saveFavourites(next);
    setFavourites(next);
    showToast(`Removed "${name}" from favourites`);
  };

  const routeFavs = favourites.filter(f => f.type === 'route');
  const stopFavs = favourites.filter(f => f.type === 'stop');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
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
            <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Saved Routes & Stops
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bookmarked Bangalore routes and bus stops stored locally in your browser for 1-click access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/routes"
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Browse More Routes</span>
          </Link>
        </div>
      </div>

      {/* Disclaimer on LocalStorage */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Browser Local Demonstration Storage</p>
          <p className="text-amber-800/90 leading-relaxed">
            These saved items are stored securely in your browser's <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">localStorage</code>. No remote account login is required for this demonstration.
          </p>
        </div>
      </div>

      {/* Saved Routes Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-slate-900">Saved Bus Routes ({routeFavs.length})</h2>
          </div>
        </div>

        {routeFavs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <Route className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>You haven't bookmarked any bus routes yet.</p>
            <Link to="/routes" className="text-red-600 font-bold hover:underline mt-1 inline-block">
              Explore BMTC Routes Catalog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routeFavs.map(fav => (
              <div
                key={fav.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-red-300 shadow-xs bg-slate-50/50 flex flex-col justify-between group transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white">
                      {fav.name}
                    </span>
                    <button
                      onClick={() => removeFavourite(fav.id, fav.name)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove favourite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{fav.subtext}</h3>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <Link
                    to={`/routes/${fav.id}`}
                    className="font-bold text-slate-700 hover:text-red-600"
                  >
                    View Stops
                  </Link>
                  <Link
                    to="/tracking"
                    className="font-bold text-red-600 flex items-center gap-1 hover:underline"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Stops Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Saved Bus Stops ({stopFavs.length})</h2>
          </div>
        </div>

        {stopFavs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>You haven't bookmarked any bus stops yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stopFavs.map(fav => (
              <div
                key={fav.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-xs bg-slate-50/50 flex flex-col justify-between group transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Bus Stop
                    </span>
                    <button
                      onClick={() => removeFavourite(fav.id, fav.name)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Remove favourite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{fav.name}</h3>
                  {fav.subtext && <p className="text-xs text-slate-500">{fav.subtext}</p>}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <Link
                    to={`/planner?from=${fav.id}`}
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>Depart from here</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
