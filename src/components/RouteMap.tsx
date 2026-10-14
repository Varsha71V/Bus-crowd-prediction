import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BusRoute, BusStop, Bus as BusType, RouteStop, RouteCrowdForecast } from '../types';
import { CROWDING_INFO, BUS_TYPE_INFO } from '../types';

// Leaflet's default icon asset resolution breaks under Vite; override it here.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RouteMapProps {
  routes: BusRoute[];
  stops: BusStop[];
  routeStops: RouteStop[];
  buses: BusType[];
  selectedRoute: BusRoute | null;
  originStop: BusStop | null;
  destinationStop: BusStop | null;
  forecasts: Record<string, RouteCrowdForecast>;
  onStopClick?: (stop: BusStop) => void;
  onBusClick?: (busId: string) => void;
}

const CROWDING_COLORS: Record<string, string> = {
  empty: '#10b981',
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#f97316',
  full: '#ef4444',
};

function makeBusIcon(color: string, crowdingLevel: string): L.DivIcon {
  const crowdColor = CROWDING_COLORS[crowdingLevel] ?? '#6b7280';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
      ">
        <div style="
          width: 36px; height: 36px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        "></div>
        <div style="
          position: absolute;
          top: 5px; left: 5px;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: white;
          display: flex; align-items: center; justify-content: center;
          transform: rotate(45deg);
        ">
          <div style="
            width: 10px; height: 10px;
            border-radius: 50%;
            background: ${crowdColor};
          "></div>
        </div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

function makeStopIcon(type: 'origin' | 'destination' | 'intermediate' | 'default'): L.DivIcon {
  const configs = {
    origin: { bg: '#10b981', border: '#059669', size: 18, label: '' },
    destination: { bg: '#ef4444', border: '#dc2626', size: 18, label: '' },
    intermediate: { bg: '#3b82f6', border: '#2563eb', size: 13, label: '' },
    default: { bg: '#6b7280', border: '#4b5563', size: 11, label: '' },
  };
  const c = configs[type];
  const pulse = type === 'origin' || type === 'destination';
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; width:${c.size * 2}px; height:${c.size * 2}px;">
        ${pulse ? `<div style="
          position:absolute; top:0; left:0;
          width:${c.size * 2}px; height:${c.size * 2}px;
          border-radius:50%;
          background:${c.bg};
          opacity:0.25;
          animation:pulse 2s infinite;
        "></div>` : ''}
        <div style="
          position:absolute;
          top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:${c.size}px; height:${c.size}px;
          border-radius:50%;
          background:${c.bg};
          border:3px solid ${c.border};
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>`,
    iconSize: [c.size * 2, c.size * 2],
    iconAnchor: [c.size, c.size],
    tooltipAnchor: [c.size, 0],
  });
}

function buildStopTooltip(
  stop: BusStop,
  routesAtStop: BusRoute[],
  busesAtStop: BusType[],
  forecasts: Record<string, RouteCrowdForecast>,
): string {
  const routeChips = routesAtStop
    .map(
      r => `<span style="
        display:inline-block; padding:1px 7px; border-radius:9999px;
        background:${r.color}; color:white; font-size:11px; font-weight:700;
        margin-right:4px;
      ">${r.route_number}</span>`,
    )
    .join('');

  const etaRows = busesAtStop
    .filter(b => b.next_stop_id === stop.id && b.eta_next_stop_minutes != null)
    .sort((a, b) => (a.eta_next_stop_minutes ?? 99) - (b.eta_next_stop_minutes ?? 99))
    .slice(0, 3)
    .map(b => {
      const eta = b.eta_next_stop_minutes! <= 1 ? 'Arriving' : `${b.eta_next_stop_minutes} min`;
      const crowd = CROWDING_INFO[b.crowding_level];
      return `
        <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
          <span style="font-size:11px; color:#64748b;">Bus ${b.bus_number}</span>
          <span style="font-size:12px; font-weight:600; color:#1e293b;">${eta}</span>
          <span style="
            padding:1px 6px; border-radius:4px;
            font-size:10px; font-weight:600;
          " class="${crowd.bgColor} ${crowd.color}">${crowd.icon} ${crowd.label}</span>
        </div>`;
    })
    .join('');

  const forecastRows = routesAtStop
    .map(r => {
      const f = forecasts[r.id];
      if (!f) return '';
      const c = CROWDING_INFO[f.current];
      return `
        <div style="display:flex; align-items:center; gap:6px; margin-top:3px;">
          <span style="font-size:10px; color:#94a3b8;">Route ${r.route_number} crowd:</span>
          <span style="font-size:11px; font-weight:600; color:${c.color.replace('text-','').includes('-') ? '#' + c.color : '#374151'};">${c.icon} ${c.label}</span>
        </div>`;
    })
    .filter(Boolean)
    .join('');

  return `
    <div style="
      font-family: ui-sans-serif, system-ui, sans-serif;
      min-width: 180px;
      max-width: 240px;
    ">
      <div style="
        font-size: 14px; font-weight: 700;
        color: #0f172a; margin-bottom: 6px;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 6px;
      ">${stop.name}</div>

      ${routeChips ? `<div style="margin-bottom:6px;">${routeChips}</div>` : ''}

      ${etaRows ? `
        <div style="font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px;">Upcoming buses</div>
        ${etaRows}
      ` : '<div style="font-size:11px; color:#94a3b8; margin-bottom:4px;">No buses approaching</div>'}

      ${forecastRows ? `
        <div style="margin-top:6px; padding-top:6px; border-top:1px solid #f1f5f9;">
          <div style="font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:2px;">Crowd forecast</div>
          ${forecastRows}
        </div>
      ` : ''}
    </div>`;
}

export function RouteMap({
  routes,
  stops,
  routeStops,
  buses,
  selectedRoute,
  originStop,
  destinationStop,
  forecasts,
  onStopClick,
  onBusClick,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  // Determine which routes to show
  const activeRoutes = useMemo(() => {
    if (selectedRoute) return routes.filter(r => r.id === selectedRoute.id);
    if (originStop && destinationStop) {
      // Find routes that pass through both stops in order
      return routes.filter(route => {
        const rs = routeStops
          .filter(s => s.route_id === route.id)
          .sort((a, b) => a.stop_order - b.stop_order);
        const oi = rs.findIndex(s => s.stop_id === originStop.id);
        const di = rs.findIndex(s => s.stop_id === destinationStop.id);
        return oi !== -1 && di !== -1 && oi < di;
      });
    }
    return routes;
  }, [routes, routeStops, selectedRoute, originStop, destinationStop]);

  // Which stops to show
  const visibleStopIds = useMemo(() => {
    const ids = new Set<string>();
    for (const route of activeRoutes) {
      routeStops
        .filter(rs => rs.route_id === route.id)
        .forEach(rs => ids.add(rs.stop_id));
    }
    return ids;
  }, [activeRoutes, routeStops]);

  const visibleStops = useMemo(
    () => stops.filter(s => visibleStopIds.has(s.id)),
    [stops, visibleStopIds],
  );

  // Initialise map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946], // Bengaluru city centre
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Redraw all layers whenever data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous layers
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    const add = (layer: L.Layer) => {
      layer.addTo(map);
      layersRef.current.push(layer);
    };

    // ── 1. Polylines per route ───────────────────────────────────────────────
    for (const route of activeRoutes) {
      const ordered = routeStops
        .filter(rs => rs.route_id === route.id)
        .sort((a, b) => a.stop_order - b.stop_order);

      const allCoords: [number, number][] = ordered
        .map(rs => stops.find(s => s.id === rs.stop_id))
        .filter((s): s is BusStop => !!s)
        .map(s => [Number(s.latitude), Number(s.longitude)]);

      if (allCoords.length < 2) continue;

      // Determine highlighted segment when origin+destination are set
      let highlightedSegmentCoords: [number, number][] = [];
      let dimmedStartCoords: [number, number][] = [];
      let dimmedEndCoords: [number, number][] = [];

      const isFilteredRoute =
        (originStop || destinationStop) &&
        activeRoutes.some(r => r.id === route.id);

      if (originStop && destinationStop && isFilteredRoute) {
        const oi = ordered.findIndex(rs => rs.stop_id === originStop.id);
        const di = ordered.findIndex(rs => rs.stop_id === destinationStop.id);
        if (oi !== -1 && di !== -1) {
          dimmedStartCoords = allCoords.slice(0, oi + 1);
          highlightedSegmentCoords = allCoords.slice(oi, di + 1);
          dimmedEndCoords = allCoords.slice(di);
        }
      }

      if (highlightedSegmentCoords.length >= 2) {
        // Dim before/after
        if (dimmedStartCoords.length >= 2) {
          add(L.polyline(dimmedStartCoords, {
            color: route.color, weight: 4, opacity: 0.25, dashArray: '6 4',
          }));
        }
        if (dimmedEndCoords.length >= 2) {
          add(L.polyline(dimmedEndCoords, {
            color: route.color, weight: 4, opacity: 0.25, dashArray: '6 4',
          }));
        }
        // Highlighted segment — outer glow + inner line
        add(L.polyline(highlightedSegmentCoords, {
          color: 'white', weight: 10, opacity: 0.6,
        }));
        add(L.polyline(highlightedSegmentCoords, {
          color: route.color, weight: 6, opacity: 1,
        }));
      } else {
        // No segment filter — draw entire route, slight highlight if selected
        const isSelected = selectedRoute?.id === route.id;
        if (isSelected) {
          add(L.polyline(allCoords, { color: 'white', weight: 10, opacity: 0.5 }));
        }
        add(L.polyline(allCoords, {
          color: route.color,
          weight: isSelected ? 6 : 4,
          opacity: isSelected ? 1 : 0.75,
        }));
      }
    }

    // ── 2. Stop markers ──────────────────────────────────────────────────────
    for (const stop of visibleStops) {
      const isOrigin = stop.id === originStop?.id;
      const isDest = stop.id === destinationStop?.id;
      const isOnSelectedRoute = selectedRoute
        ? routeStops.some(rs => rs.route_id === selectedRoute.id && rs.stop_id === stop.id)
        : false;

      // Determine stop type for icon
      let iconType: 'origin' | 'destination' | 'intermediate' | 'default';
      if (isOrigin) iconType = 'origin';
      else if (isDest) iconType = 'destination';
      else if (originStop && destinationStop) {
        // Is this stop on the highlighted segment of any active route?
        const onSegment = activeRoutes.some(route => {
          const ordered = routeStops
            .filter(rs => rs.route_id === route.id)
            .sort((a, b) => a.stop_order - b.stop_order);
          const oi = ordered.findIndex(rs => rs.stop_id === originStop.id);
          const di = ordered.findIndex(rs => rs.stop_id === destinationStop.id);
          const si = ordered.findIndex(rs => rs.stop_id === stop.id);
          return oi !== -1 && di !== -1 && si > oi && si < di;
        });
        iconType = onSegment ? 'intermediate' : 'default';
      } else if (isOnSelectedRoute) {
        iconType = 'intermediate';
      } else {
        iconType = 'default';
      }

      // Build tooltip content
      const routesAtStop = activeRoutes.filter(route =>
        routeStops.some(rs => rs.route_id === route.id && rs.stop_id === stop.id),
      );

      const tooltipContent = buildStopTooltip(stop, routesAtStop, buses, forecasts);

      const marker = L.marker([Number(stop.latitude), Number(stop.longitude)], {
        icon: makeStopIcon(iconType),
        zIndexOffset: isOrigin || isDest ? 200 : 0,
      });

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -8],
        className: 'route-map-tooltip',
        opacity: 1,
        sticky: false,
      });

      marker.on('click', () => onStopClick?.(stop));

      add(marker);
    }

    // ── 3. Bus markers ───────────────────────────────────────────────────────
    const busesToShow = selectedRoute
      ? buses.filter(b => b.route_id === selectedRoute.id)
      : buses.filter(b => activeRoutes.some(r => r.id === b.route_id));

    for (const bus of busesToShow) {
      const route = routes.find(r => r.id === bus.route_id);
      if (!route) continue;

      const icon = makeBusIcon(route.color, bus.crowding_level);
      const crowd = CROWDING_INFO[bus.crowding_level];
      const eta = bus.eta_next_stop_minutes != null
        ? bus.eta_next_stop_minutes <= 1 ? 'Arriving now' : `${bus.eta_next_stop_minutes} min to next stop`
        : '';
      const nextStop = bus.next_stop?.name ?? '';

      const busMarker = L.marker([Number(bus.latitude), Number(bus.longitude)], {
        icon,
        zIndexOffset: 400,
      });

      busMarker.bindTooltip(`
        <div style="
          font-family: ui-sans-serif, system-ui, sans-serif;
          min-width:160px;
        ">
          <div style="font-size:14px; font-weight:700; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:6px;">
            Bus ${bus.bus_number}
          </div>
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <span style="padding:2px 8px; border-radius:9999px; background:${route.color}; color:white; font-size:11px; font-weight:700;">
              ${route.route_number}
            </span>
            <span style="padding:2px 8px; border-radius:9999px; font-size:11px; font-weight:600; background:${BUS_TYPE_INFO[bus.bus_type].bgColor.replace('bg-', '#').replace('-50', '-100')}; color:#0f172a;">
              ${BUS_TYPE_INFO[bus.bus_type].icon} ${BUS_TYPE_INFO[bus.bus_type].label}
            </span>
          </div>
          ${nextStop ? `<div style="font-size:11px; color:#64748b; margin-bottom:3px;">Next: <b style="color:#0f172a;">${nextStop}</b></div>` : ''}
          ${eta ? `<div style="font-size:11px; color:#64748b; margin-bottom:3px;">ETA: <b style="color:#0f172a;">${eta}</b></div>` : ''}
          <div style="display:flex; align-items:center; gap:4px; margin-top:4px;">
            <span style="font-size:11px; color:#64748b;">Crowd:</span>
            <span style="font-size:12px; font-weight:600;">${crowd.icon} ${crowd.label}</span>
          </div>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">
            ${bus.seats_available} seats free of ${bus.total_capacity}
          </div>
        </div>`, {
        direction: 'top',
        offset: [0, -38],
        className: 'route-map-tooltip',
        opacity: 1,
      });

      busMarker.on('click', () => onBusClick?.(bus.id));

      add(busMarker);
    }

    // ── 4. Fit bounds ────────────────────────────────────────────────────────
    if (visibleStops.length > 0) {
      const bounds = L.latLngBounds(
        visibleStops.map(s => [Number(s.latitude), Number(s.longitude)]),
      );
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    }
  }, [
    activeRoutes,
    visibleStops,
    stops,
    routeStops,
    buses,
    routes,
    selectedRoute,
    originStop,
    destinationStop,
    forecasts,
    onStopClick,
    onBusClick,
  ]);

  return (
    <>
      {/* Pulse animation + tooltip styles injected once */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50%       { transform: scale(1.8); opacity: 0; }
        }
        .route-map-tooltip {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
          padding: 10px 12px !important;
          font-size: 12px;
          pointer-events: none;
        }
        .route-map-tooltip::before {
          display: none !important;
        }
        .leaflet-tooltip-top.route-map-tooltip:before {
          display: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
        }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          color: #374151 !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f8fafc !important;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.7) !important;
          border-radius: 4px 0 0 0 !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full" />
    </>
  );
}
