import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  MapPin,
  Route,
  Radio,
  Star,
  Bell,
  Ticket,
  Shield,
  Menu,
  X,
  Search,
  LayoutDashboard,
} from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const navigate = useNavigate();

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/routes?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Bus, end: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/routes', label: 'Routes & Stops', icon: Route },
    { to: '/tracking', label: 'Live Tracking', icon: Radio, badge: 'Live' },
    { to: '/planner', label: 'Journey Planner', icon: MapPin },
    { to: '/favourites', label: 'Favourites', icon: Star },
    { to: '/announcements', label: 'Alerts', icon: Bell },
    { to: '/ticket', label: 'Demo Ticket', icon: Ticket },
    { to: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  BMTC
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                  Bengaluru
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 tracking-wide uppercase">
                Smart Bus Management System
              </p>
            </div>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleQuickSearch}
            className="hidden lg:flex items-center relative w-64 max-w-xs"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search route (e.g. 500-D)..."
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200 focus:border-red-500 rounded-lg outline-none transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-red-50 text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <form onSubmit={handleQuickSearch} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search route (e.g. 500-D, Majestic)..."
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-red-500"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
