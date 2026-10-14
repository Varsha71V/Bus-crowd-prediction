import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CrowdingLevel, CrowdPrediction, RouteCrowdForecast } from '../types';

const LEVEL_RANK: Record<CrowdingLevel, number> = {
  empty: 0, low: 1, moderate: 2, high: 3, full: 4,
};
const RANK_LEVEL: CrowdingLevel[] = ['empty', 'low', 'moderate', 'high', 'full'];

// Returns the prediction row closest to the given hour for a route
function getPredictedLevel(
  predictions: CrowdPrediction[],
  routeId: string,
  dayOfWeek: number,
  hour: number,
): { level: CrowdingLevel; confidence: number } | null {
  const match = predictions.find(
    p => p.route_id === routeId && p.day_of_week === dayOfWeek && p.hour_of_day === hour,
  );
  if (!match) return null;
  return { level: match.crowding_level, confidence: match.confidence };
}

// Clamp rank 0-4 back to a valid level
function rankToLevel(rank: number): CrowdingLevel {
  return RANK_LEVEL[Math.max(0, Math.min(4, Math.round(rank)))];
}

// Blend historical prediction with recent user reports
function blendWithReports(
  baseLevel: CrowdingLevel,
  recentLevels: CrowdingLevel[],
  historicalWeight = 0.65,
): CrowdingLevel {
  if (recentLevels.length === 0) return baseLevel;
  const baseRank = LEVEL_RANK[baseLevel];
  const reportAvg = recentLevels.reduce((s, l) => s + LEVEL_RANK[l], 0) / recentLevels.length;
  const blended = historicalWeight * baseRank + (1 - historicalWeight) * reportAvg;
  return rankToLevel(blended);
}

export function useCrowdForecasts(routeIds: string[]) {
  const [predictions, setPredictions] = useState<CrowdPrediction[]>([]);
  const [forecasts, setForecasts] = useState<Record<string, RouteCrowdForecast>>({});

  // Fetch all historical patterns once
  const fetchPredictions = useCallback(async () => {
    const { data } = await supabase
      .from('crowd_predictions')
      .select('*');
    if (data) setPredictions(data as CrowdPrediction[]);
  }, []);

  // Fetch recent reports (last 30 min) and compute adjusted forecasts
  const computeForecasts = useCallback(async () => {
    if (predictions.length === 0 || routeIds.length === 0) return;

    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: reports } = await supabase
      .from('crowd_reports')
      .select('route_id, reported_level')
      .in('route_id', routeIds)
      .gte('reported_at', cutoff);

    const now = new Date();
    const dow = now.getDay();
    const hour = now.getHours();

    const result: Record<string, RouteCrowdForecast> = {};

    for (const routeId of routeIds) {
      const routeReports = (reports ?? [])
        .filter(r => r.route_id === routeId)
        .map(r => r.reported_level as CrowdingLevel);

      const currentPred  = getPredictedLevel(predictions, routeId, dow, hour);
      const pred15       = getPredictedLevel(predictions, routeId, dow, (hour + 1) % 24);
      const pred30       = getPredictedLevel(predictions, routeId, dow, (hour + 1) % 24);
      const pred60       = getPredictedLevel(predictions, routeId, dow, (hour + 1) % 24);

      // Use minutes offset for more precise forecast slots
      const min = now.getMinutes();
      const h15  = Math.floor((hour * 60 + min + 15) / 60) % 24;
      const h30  = Math.floor((hour * 60 + min + 30) / 60) % 24;
      const h60  = Math.floor((hour * 60 + min + 60) / 60) % 24;

      const p15 = getPredictedLevel(predictions, routeId, dow, h15);
      const p30 = getPredictedLevel(predictions, routeId, dow, h30);
      const p60 = getPredictedLevel(predictions, routeId, dow, h60);

      const currentBase = currentPred?.level ?? 'moderate';
      const current = blendWithReports(currentBase, routeReports);
      const in15 = p15?.level ?? currentBase;
      const in30 = p30?.level ?? currentBase;
      const in60 = p60?.level ?? currentBase;

      result[routeId] = {
        current,
        in15,
        in30,
        in60,
        confidence: currentPred?.confidence ?? 0.7,
        recentReportCount: routeReports.length,
        userAdjusted: routeReports.length > 0 && current !== currentBase,
      };
    }

    setForecasts(result);
  }, [predictions, routeIds]);

  useEffect(() => { fetchPredictions(); }, [fetchPredictions]);

  useEffect(() => { computeForecasts(); }, [computeForecasts]);

  // Refresh forecasts every 60 s to pick up new reports
  useEffect(() => {
    const id = setInterval(computeForecasts, 60_000);
    return () => clearInterval(id);
  }, [computeForecasts]);

  return { forecasts, refreshForecasts: computeForecasts };
}
