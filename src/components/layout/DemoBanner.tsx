import { Sparkles, ShieldCheck } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white text-xs py-1.5 px-4 shadow-sm border-b border-red-900/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded font-bold tracking-wider text-[11px] uppercase">
            <Sparkles className="w-3 h-3 text-amber-300" /> Demo Mode
          </span>
          <span className="text-red-100 hidden sm:inline">
            Bengaluru Metropolitan Transport Corporation (BMTC) Smart Commuter Demonstration
          </span>
          <span className="text-red-100 sm:hidden">
            BMTC Smart Transit Demo
          </span>
        </div>
        <div className="flex items-center gap-3 text-red-100 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Simulated GPS & Crowds
          </span>
          <span className="hidden md:inline text-red-200/60">•</span>
          <span className="hidden md:inline text-red-200">
            Commuter Helpline: <strong className="text-white">1800-425-1663</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
