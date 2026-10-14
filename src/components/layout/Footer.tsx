import { Link } from 'react-router-dom';
import { Bus, Phone, Mail, MapPin, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-md">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white">BMTC Bengaluru</span>
                <p className="text-[10px] text-slate-400">Metropolitan Transport Corporation</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empowering Bengaluru's 5+ million daily commuters with modern real-time crowding forecasts, intelligent route recommendations, and zero-emission electric mobility.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-medium bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Smart Transit Demonstration Environment</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase text-[11px]">Passenger Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/routes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-red-500">›</span> Route Catalog & Fares
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-red-500">›</span> Live GPS Radar (Map)
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-red-500">›</span> Journey Planner
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-red-500">›</span> Saved Routes & Stops
                </Link>
              </li>
              <li>
                <Link to="/ticket" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-red-500">›</span> Demo QR Ticket & Pass
                </Link>
              </li>
            </ul>
          </div>

          {/* Major TTMCs & Depots */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase text-[11px]">Major TTMC Hubs</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>Kempegowda Bus Station (Majestic Terminal)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>Central Silk Board Junction (South Hub)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>Banashankari TTMC & Metro Interchange</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>Whitefield Kadugodi Bus Station</span>
              </li>
            </ul>
          </div>

          {/* Commuter Helpline */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase text-[11px]">Commuter Helpline</h4>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-600/20 text-red-400 rounded-lg">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Toll-Free Helpline</p>
                  <p className="text-sm font-bold text-white">1800-425-1663</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Passenger Support</p>
                  <p className="text-xs font-semibold text-slate-200">commuters@mybmtc.karnataka.gov.in</p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
              >
                <span>Access Demo Admin Fleet Console</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} BMTC Smart Bus Demonstration. Built for Bengaluru Commuters.
          </p>
          <p className="flex items-center justify-center gap-1 text-[11px]">
            Designed with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Namma Bengaluru
          </p>
        </div>
      </div>
    </footer>
  );
}
