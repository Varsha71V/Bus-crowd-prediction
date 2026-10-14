import { useState } from 'react';
import { Bell, Calendar, AlertTriangle, Info, Search } from 'lucide-react';
import { MOCK_ANNOUNCEMENTS } from '../data/mockAnnouncements';

export function AnnouncementsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['All', 'Service Alert', 'Route Change', 'Metro Feeder', 'Passenger Info'];

  const filteredAnnouncements = MOCK_ANNOUNCEMENTS.filter(ann => {
    const matchesCategory = categoryFilter === 'All' || ann.category === categoryFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.affectedRoutes?.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Bell className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Service Advisories & Announcements
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Stay informed on Bengaluru transit updates, metro feeder schedules, route diversions, and holiday services.
        </p>
      </div>

      {/* Demo Notice Warning */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Demonstration Sample Advisories</p>
          <p className="text-blue-800/80 leading-relaxed">
            These announcements are structured demonstration notices illustrating how transit updates and corridor maintenance are communicated to commuters.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(ann => (
          <div
            key={ann.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 hover:border-slate-300 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${ann.badgeColor}`}>
                  {ann.category}
                </span>
                {ann.priority === 'high' && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Priority Notice
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{ann.date}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {ann.content}
            </p>

            {ann.affectedRoutes && ann.affectedRoutes.length > 0 && (
              <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-semibold">Affected Routes:</span>
                {ann.affectedRoutes.map(r => (
                  <span
                    key={r}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold rounded-md"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
