import { useState } from 'react';
import {
  Ticket,
  ShieldCheck,
  Bus,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { storageService, type DemoTicket } from '../services/storageService';
import { busService } from '../services/busService';

export function TicketPage() {
  const stops = busService.getStops();
  const [tickets, setTickets] = useState<DemoTicket[]>(() => storageService.getTickets());
  const [selectedTicket, setSelectedTicket] = useState<DemoTicket>(tickets[0] || {
    ticketId: 'BMTC-TKT-884920',
    routeNumber: '500-D',
    fromStop: 'Kempegowda Bus Station (Majestic)',
    toStop: 'Electronic City Toll Gate',
    fare: 45,
    passengerCount: 1,
    busType: 'Electric AC',
    bookingTime: 'Today, 08:30 AM',
    validUntil: 'Today, 11:30 PM',
  });

  const [fromStop, setFromStop] = useState(stops[0]?.name || 'Majestic');
  const [toStop, setToStop] = useState(stops[1]?.name || 'Silk Board');
  const [passType, setPassType] = useState('Daily Vajra AC Pass');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTkt: DemoTicket = {
      ticketId: `BMTC-TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      routeNumber: passType.includes('AC') ? 'Vajra AC' : 'Ordinary EV',
      fromStop,
      toStop,
      fare: passType.includes('AC') ? 140 : 70,
      passengerCount: 1,
      busType: passType,
      bookingTime: 'Just now',
      validUntil: 'Today, 11:59 PM',
    };

    storageService.saveTicket(newTkt);
    const updated = storageService.getTickets();
    setTickets(updated);
    setSelectedTicket(newTkt);
    showToast('✓ Demo digital ticket generated successfully');
  };

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
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-red-100 text-red-600 rounded-xl">
            <Ticket className="w-5 h-5" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Digital QR Pass & Ticket Simulator
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore the paperless QR ticket format designed for BMTC contactless validator turnstiles and bus conductors.
        </p>
      </div>

      {/* Demo Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Demonstration Only — Non-Fiscal Pass</p>
          <p className="text-amber-800/80 leading-relaxed">
            This screen simulates contactless electronic ticketing for UI demonstration purposes. It does not perform financial transactions or issue valid statutory travel instruments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Ticket Preview */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border-2 border-red-500/20 overflow-hidden relative">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white text-red-600 flex items-center justify-center font-black shadow-sm">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base tracking-tight">BMTC Bengaluru</h3>
                    <p className="text-[10px] text-red-100 uppercase tracking-wider font-semibold">
                      Digital Commuter Pass
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 uppercase">
                  Active
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-6">
              {/* Origin and Destination Journey */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="w-0.5 h-7 bg-slate-300"></span>
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  </div>
                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Boarding</p>
                      <p className="font-bold text-slate-900 text-sm">{selectedTicket.fromStop}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Destination</p>
                      <p className="font-bold text-slate-900 text-sm">{selectedTicket.toStop}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Demonstration Box */}
              <div className="text-center p-6 bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-200">
                  {/* SVG QR Code Simulation */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="#0f172a" />

                    <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="#0f172a" />

                    <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="#0f172a" />

                    {/* Matrix patterns */}
                    <rect x="42" y="15" width="6" height="6" fill="#0f172a" />
                    <rect x="52" y="25" width="6" height="6" fill="#0f172a" />
                    <rect x="45" y="45" width="10" height="10" fill="#dc2626" />
                    <rect x="25" y="45" width="6" height="6" fill="#0f172a" />
                    <rect x="65" y="55" width="8" height="6" fill="#0f172a" />
                    <rect x="42" y="75" width="8" height="8" fill="#0f172a" />
                    <rect x="55" y="68" width="6" height="6" fill="#0f172a" />
                    <rect x="75" y="75" width="6" height="6" fill="#0f172a" />
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-slate-800">{selectedTicket.ticketId}</p>
                  <p className="text-[10px] text-slate-400">Scan at electronic conductor device</p>
                </div>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Fare Paid</p>
                  <p className="text-sm font-black text-slate-900">₹{selectedTicket.fare}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Service Tier</p>
                  <p className="text-sm font-bold text-slate-800">{selectedTicket.busType}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Issued</p>
                  <p className="text-xs font-bold text-slate-700">{selectedTicket.bookingTime}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Valid Till</p>
                  <p className="text-xs font-bold text-emerald-600">{selectedTicket.validUntil}</p>
                </div>
              </div>
            </div>

            {/* Bottom perforation visual */}
            <div className="bg-slate-100 p-4 border-t-2 border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <ShieldCheck className="w-4 h-4" /> Cryptographically Signed
              </span>
              <button
                onClick={() => showToast('Demo pass copied to clipboard')}
                className="text-red-600 hover:text-red-700 font-bold"
              >
                Share Pass
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Pass Generator Simulator Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Simulate New Demo Pass</span>
            </h3>

            <form onSubmit={handleGenerateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pass / Service Class</label>
                <select
                  value={passType}
                  onChange={e => setPassType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500"
                >
                  <option value="Daily Vajra AC Pass">Daily Vajra AC Pass (Unlimited all AC routes) — ₹140</option>
                  <option value="Daily Non-AC Ordinary Pass">Daily Non-AC Ordinary Pass — ₹70</option>
                  <option value="Single Journey Ticket">Single Journey Ticket — ₹45</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Origin Stop</label>
                <select
                  value={fromStop}
                  onChange={e => setFromStop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500"
                >
                  {stops.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Stop</label>
                <select
                  value={toStop}
                  onChange={e => setToStop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-red-500"
                >
                  {stops.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Generate Demo Pass Now</span>
              </button>
            </form>
          </div>

          {/* Past Generated Passes in Local Storage */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Recent Demo Passes ({tickets.length})</h4>
            <div className="space-y-2">
              {tickets.map(t => (
                <div
                  key={t.ticketId}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    selectedTicket.ticketId === t.ticketId
                      ? 'bg-red-50 border-red-500'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900">{t.ticketId}</span>
                    <p className="text-[11px] text-slate-500">{t.fromStop} → {t.toStop}</p>
                  </div>
                  <span className="font-bold text-red-600">₹{t.fare}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
