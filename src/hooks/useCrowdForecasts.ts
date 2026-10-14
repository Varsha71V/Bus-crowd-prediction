import { useState, useEffect, useCallback } from 'react';
import type { CrowdingLevel, RouteCrowdForecast } from '../types';

const RANK_LEVEL: CrowdingLevel[] = ['empty', 'low', 'moderate', 'high', 'full'];

function rankToLevel(rank: number): CrowdingLevel {
  return RANK_LEVEL[Math.max(0, Math.min(4, Math.round(rank)))];
}

// Deterministic mock prediction based on route and time of day
function generateMockRouteForecast(routeId: string, hour: number): RouteCrowdForecast {
  // Peak commute hours in Bangalore: 8-11 AM and 5-9 PM
  const isMorningPeak = hour >= 8 && hour <= 11;
  const isEveningPeak = hour >= 17 && hour <= 21;
  const isLateNight = hour >= 22 || hour <= 5;

  let baseRank = 2; // moderate
  if (isLateNight) baseRank = 0; // empty
  else if (isMorningPeak || isEveningPeak) {
    baseRank = routeId.includes('500') || routeId.includes('335') ? 4 : 3; // full or high
  } else {
    baseRank = 1; // low
  }

  const current = rankToLevel(baseRank);
  const in15 = rankToLevel(baseRank + (isMorningPeak && hour === 8 ? 1 : 0));
  const in30 = rankToLevel(Math.max(0, baseRank + (isLateNight ? 0 : 0.5)));
  const in60 = rankToLevel(Math.min(4, Math.max(0, baseRank)));

  return {
    current,
    in15,
    in30,
    in60,
    confidence: 0.88,
    recentReportCount: 3,
    userAdjusted: false,
  };
}

export function useCrowdForecasts(routeIds: string[]) {
  const [forecasts, setForecasts] = useState<Record<string, RouteCrowdForecast>>({});

  const computeForecasts = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const result: Record<string, RouteCrowdForecast> = {};

    for (const routeId of routeIds) {
      result[routeId] = generateMockRouteForecast(routeId, hour);
    }
    setForecasts(result);
  }, [routeIds]);

  useEffect(() => {
    computeForecasts();
  }, [computeForecasts]);

  // Allow simulated user crowd submission
  const reportCrowdLevel = useCallback((routeId: string, level: CrowdingLevel) => {
    setForecasts(prev => {
      const currentForecast = prev[routeId] || generateMockRouteForecast(routeId, new Date().getHours());
      return {
        ...prev,
        [routeId]: {
          ...currentForecast,
          current: level,
          recentReportCount: currentForecast.recentReportCount + 1,
          userAdjusted: true,
        },
      };
    });
  }, []);

  return { forecasts, refreshForecasts: computeForecasts, reportCrowdLevel };
}
