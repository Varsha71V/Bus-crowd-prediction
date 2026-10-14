import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Users, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import type { CrowdingLevel, BusRoute, RouteCrowdForecast } from '../types';
import { CROWDING_INFO } from '../types';
import { supabase } from '../lib/supabase';

interface CrowdPredictionPanelProps {
  route: BusRoute;
  forecast: RouteCrowdForecast;
  busId?: string;
  onReportSubmitted?: () => void;
}

const LEVEL_RANK: Record<CrowdingLevel, number> = {
  empty: 0, low: 1, moderate: 2, high: 3, full: 4,
};

function TrendIcon({ from, to }: { from: CrowdingLevel; to: CrowdingLevel }) {
  const delta = LEVEL_RANK[to] - LEVEL_RANK[from];
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
  if (delta < 0) return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

function CrowdBadge({ level, size = 'sm' }: { level: CrowdingLevel; size?: 'sm' | 'lg' }) {
  const info = CROWDING_INFO[level];
  const base = size === 'lg'
    ? 'px-3 py-1.5 text-sm font-semibold rounded-lg'
    : 'px-2 py-1 text-xs font-medium rounded-md';
  return (
    <span className={`inline-flex items-center gap-1 ${base} ${info.bgColor} ${info.color}`}>
      <span>{info.icon}</span>
      <span>{info.label}</span>
    </span>
  );
}

function ConfidenceDots({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <div className="flex items-center gap-0.5" title={`${Math.round(value * 100)}% confidence`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < filled ? 'bg-blue-400' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

const REPORT_LEVELS: { level: CrowdingLevel; label: string }[] = [
  { level: 'empty',    label: 'Empty' },
  { level: 'low',      label: 'Low' },
  { level: 'moderate', label: 'Moderate' },
  { level: 'high',     label: 'Crowded' },
  { level: 'full',     label: 'Full' },
];

export function CrowdPredictionPanel({
  route,
  forecast,
  busId,
  onReportSubmitted,
}: CrowdPredictionPanelProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitReport = async (level: CrowdingLevel) => {
    setSubmitting(true);
    try {
      try {
        await supabase.from('crowd_reports').insert({
          route_id: route.id,
          bus_id: busId ?? null,
          reported_level: level,
          reported_at: new Date().toISOString(),
        });
      } catch (err) {
        console.info('Simulated crowd report stored in demo state', err);
      }
      setSubmitted(true);
      setShowReportForm(false);
      setTimeout(() => setSubmitted(false), 3000);
      onReportSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  const forecasts: { label: string; level: CrowdingLevel; from: CrowdingLevel }[] = [
    { label: '+15 min', level: forecast.in15, from: forecast.current },
    { label: '+30 min', level: forecast.in30, from: forecast.in15 },
    { label: '+60 min', level: forecast.in60, from: forecast.in30 },
  ];

  return (
    <div className="space-y-3">
      {/* Current status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Current Crowd</span>
          {forecast.userAdjusted && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100">
              Live
            </span>
          )}
        </div>
        <CrowdBadge level={forecast.current} size="lg" />
      </div>

      {/* Confidence + report count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ConfidenceDots value={forecast.confidence} />
          <span>{Math.round(forecast.confidence * 100)}% confidence</span>
        </div>
        {forecast.recentReportCount > 0 && (
          <span className="text-blue-500 font-medium">
            {forecast.recentReportCount} live report{forecast.recentReportCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Forecast timeline */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Crowd Forecast
        </p>
        <div className="grid grid-cols-3 gap-2">
          {forecasts.map(({ label, level, from }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 bg-white rounded-lg p-2.5 border border-slate-100 shadow-sm"
            >
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <CrowdBadge level={level} />
              <TrendIcon from={from} to={level} />
            </div>
          ))}
        </div>
      </div>

      {/* Crowd level bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Empty</span>
          <span>Full</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
          {(['empty','low','moderate','high','full'] as CrowdingLevel[]).map((lvl) => {
            const isCurrent = lvl === forecast.current;
            const colors: Record<CrowdingLevel, string> = {
              empty: 'bg-emerald-400',
              low: 'bg-green-400',
              moderate: 'bg-amber-400',
              high: 'bg-orange-400',
              full: 'bg-red-500',
            };
            return (
              <div
                key={lvl}
                className={`flex-1 transition-all ${
                  isCurrent ? colors[lvl] : 'bg-slate-100'
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          {['empty','low','moderate','high','full'].map((lvl, i) => (
            <span key={i} className={`flex-1 text-center ${lvl === forecast.current ? 'text-slate-700 font-medium' : ''}`}>
              {lvl === forecast.current ? CROWDING_INFO[forecast.current as CrowdingLevel].label : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Report form */}
      <div className="pt-1">
        {submitted ? (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thanks for your report!</span>
          </div>
        ) : showReportForm ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">How crowded is it right now?</p>
            <div className="flex flex-wrap gap-1.5">
              {REPORT_LEVELS.map(({ level, label }) => {
                const info = CROWDING_INFO[level];
                return (
                  <button
                    key={level}
                    disabled={submitting}
                    onClick={() => submitReport(level)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-50 ${info.bgColor} ${info.color} border-current hover:opacity-90`}
                  >
                    {info.icon} {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowReportForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            Report current crowd level
          </button>
        )}
      </div>
    </div>
  );
}
