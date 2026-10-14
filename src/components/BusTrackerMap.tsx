import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface TrackerStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface BusTrackerMapProps {
  stops: TrackerStop[];
  currentIndex: number;
  selectedDestIndex: number | null;
  busLat: number;
  busLng: number;
  busNumber: string;
  centerLat: number;
  centerLng: number;
}

export function BusTrackerMap({
  stops,
  currentIndex,
  selectedDestIndex,
  busLat,
  busLng,
  busNumber,
  centerLat,
  centerLng,
}: BusTrackerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const busMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [centerLat, centerLng]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || stops.length < 2) return;

    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    const add = (layer: L.Layer) => {
      layer.addTo(map);
      layersRef.current.push(layer);
    };

    const coords: [number, number][] = stops.map(s => [s.lat, s.lng]);

    add(L.polyline(coords, { color: '#0ea5e9', weight: 5, opacity: 0.8 }));

    stops.forEach((stop, i) => {
      const isCompleted = i < currentIndex;
      const isCurrent = i === currentIndex;
      const isDestination = selectedDestIndex === i;

      let bg = '#3b82f6';
      let size = 12;
      if (isCompleted) { bg = '#10b981'; size = 10; }
      if (isCurrent) { bg = '#f59e0b'; size = 16; }
      if (isDestination) { bg = '#ef4444'; size = 16; }

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:${size * 2}px;height:${size * 2}px;">
            ${isCurrent ? `<div style="position:absolute;top:0;left:0;width:${size * 2}px;height:${size * 2}px;border-radius:50%;background:${bg};opacity:0.25;animation:busPulse 2s infinite;"></div>` : ''}
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>`,
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon, zIndexOffset: isDestination ? 200 : isCurrent ? 150 : 0 });
      const statusLabel = isCompleted ? 'Completed' : isCurrent ? 'Bus is here' : isDestination ? 'Your destination' : 'Upcoming';

      marker.bindTooltip(
        `<div style="font-family:ui-sans-serif,system-ui,sans-serif;min-width:120px;">
          <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:3px;">${stop.name}</div>
          <div style="font-size:11px;color:#64748b;">Stop ${i + 1} of ${stops.length} — ${statusLabel}</div>
        </div>`,
        { direction: 'top', offset: [0, -8], className: 'bus-tracker-tooltip', opacity: 1 },
      );

      add(marker);
    });

    if (busMarkerRef.current) map.removeLayer(busMarkerRef.current);

    const busIcon = L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:40px;height:40px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
          <div style="width:40px;height:40px;background:#0ea5e9;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
          <div style="position:absolute;top:6px;left:6px;width:22px;height:22px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;transform:rotate(45deg);">
            <span style="font-size:13px;">🚌</span>
          </div>
        </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -42],
    });

    const busMarker = L.marker([busLat, busLng], { icon: busIcon, zIndexOffset: 400 });
    busMarker.bindTooltip(
      `<div style="font-family:ui-sans-serif,system-ui,sans-serif;">
        <div style="font-size:13px;font-weight:700;color:#0f172a;">Bus ${busNumber}</div>
        <div style="font-size:11px;color:#64748b;">Electric Bus — Live tracking</div>
      </div>`,
      { direction: 'top', offset: [0, -42], className: 'bus-tracker-tooltip', opacity: 1 },
    );
    busMarker.addTo(map);
    busMarkerRef.current = busMarker;

    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [stops, currentIndex, selectedDestIndex, busLat, busLng, busNumber]);

  return (
    <>
      <style>{`
        @keyframes busPulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50%       { transform: scale(1.8); opacity: 0; }
        }
        .bus-tracker-tooltip {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
          padding: 10px 12px !important;
          font-size: 12px;
          pointer-events: none;
        }
        .bus-tracker-tooltip::before { display: none !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important; }
        .leaflet-control-zoom a { border-radius: 8px !important; border: 1px solid #e2e8f0 !important; color: #374151 !important; }
        .leaflet-control-attribution { font-size: 9px !important; background: rgba(255,255,255,0.7) !important; }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full" />
    </>
  );
}
