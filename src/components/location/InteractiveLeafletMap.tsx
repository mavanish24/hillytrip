import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationItem, EntityType, RouteWaypoint } from '../../types/location';
import { Map, Layers, Navigation, Compass, Sparkles, Phone, Star, Mountain, Eye, Plus, Minus } from 'lucide-react';

interface InteractiveLeafletMapProps {
  locations: LocationItem[];
  selectedLocation?: LocationItem | null;
  onSelectLocation?: (location: LocationItem) => void;
  activeLayers?: Record<string, boolean>;
  userCoords?: { lat: number; lng: number } | null;
  routeWaypoints?: RouteWaypoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  onDirectionsRequest?: (destination: LocationItem) => void;
}

// Marker Color Map & Gradients for different HillyTrip Entity Types
const ENTITY_MARKER_CONFIGS: Record<EntityType, {
  color: string;
  bgGradient: string;
  accentColor: string;
  badgeLabel: string;
  shadowColor: string;
}> = {
  destination: {
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #5b21b6)',
    accentColor: '#c084fc',
    badgeLabel: 'DESTINATION',
    shadowColor: 'rgba(139, 92, 246, 0.55)'
  },
  homestay: {
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #10b981, #047857)',
    accentColor: '#34d399',
    badgeLabel: 'HOMESTAY',
    shadowColor: 'rgba(16, 185, 129, 0.55)'
  },
  attraction: {
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    accentColor: '#fbbf24',
    badgeLabel: 'ATTRACTION',
    shadowColor: 'rgba(245, 158, 11, 0.55)'
  },
  taxi_stand: {
    color: '#eab308',
    bgGradient: 'linear-gradient(135deg, #eab308, #a16207)',
    accentColor: '#fde047',
    badgeLabel: 'TAXI HUB',
    shadowColor: 'rgba(234, 179, 8, 0.55)'
  },
  taxi_operator: {
    color: '#ca8a04',
    bgGradient: 'linear-gradient(135deg, #ca8a04, #854d0e)',
    accentColor: '#fef08a',
    badgeLabel: 'TAXI OPERATOR',
    shadowColor: 'rgba(202, 138, 4, 0.55)'
  },
  business: {
    color: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #6366f1, #3730a3)',
    accentColor: '#818cf8',
    badgeLabel: 'BUSINESS',
    shadowColor: 'rgba(99, 102, 241, 0.55)'
  },
  guide: {
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #ec4899, #9d174d)',
    accentColor: '#f472b6',
    badgeLabel: 'GUIDE',
    shadowColor: 'rgba(236, 72, 153, 0.55)'
  },
  activity: {
    color: '#14b8a6',
    bgGradient: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    accentColor: '#2dd4bf',
    badgeLabel: 'ACTIVITY',
    shadowColor: 'rgba(20, 184, 166, 0.55)'
  },
  route: {
    color: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, #f43f5e, #9f1239)',
    accentColor: '#fb7185',
    badgeLabel: 'ROUTE',
    shadowColor: 'rgba(244, 63, 94, 0.55)'
  },
  hub: {
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    accentColor: '#60a5fa',
    badgeLabel: 'TRANSPORT HUB',
    shadowColor: 'rgba(59, 130, 246, 0.55)'
  },
  hospital: {
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #ef4444, #991b1b)',
    accentColor: '#f87171',
    badgeLabel: 'HOSPITAL',
    shadowColor: 'rgba(239, 68, 68, 0.55)'
  },
  restaurant: {
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, #f97316, #c2410c)',
    accentColor: '#fb923c',
    badgeLabel: 'DINING / TEA',
    shadowColor: 'rgba(249, 115, 22, 0.55)'
  },
  viewpoint: {
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, #06b6d4, #0e7490)',
    accentColor: '#67e8f9',
    badgeLabel: 'VIEWPOINT',
    shadowColor: 'rgba(6, 182, 212, 0.55)'
  }
};

// Custom SVG Icons for Location Types
function getBrandedMarkerSvg(type: EntityType): string {
  switch (type) {
    case 'destination':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.15 13.8 9 10l3 3 4.35-4.35"/></svg>`;
    case 'homestay':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 3l9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z"/><path d="M9 22V12h6v10"/><path d="M18 4v3.5"/></svg>`;
    case 'attraction':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    case 'taxi_stand':
    case 'taxi_operator':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H8c-.7 0-1.3.3-1.8.7C5.3 8.6 4 10 4 10s-2.7.6-4.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;
    case 'viewpoint':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
    case 'guide':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
    case 'business':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`;
    case 'restaurant':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }
}

// Generate Branded Marker HTML with custom shapes for Destinations vs Homestays vs Others
function createBrandedMarkerHtml(loc: LocationItem, isSelected: boolean) {
  const type = loc.entityType;
  const config = ENTITY_MARKER_CONFIGS[type] || ENTITY_MARKER_CONFIGS.destination;
  const svgIcon = getBrandedMarkerSvg(type);
  const rating = loc.rating ? loc.rating.toFixed(1) : '4.8';

  // Sizing
  const boxW = isSelected ? 42 : 34;
  const boxH = isSelected ? 42 : 34;
  const totalW = isSelected ? 50 : 40;
  const totalH = isSelected ? 62 : 50;

  // Tail color
  const tailColor = config.color;

  // Custom marker shapes
  let shapeCss = `
    width: ${boxW}px;
    height: ${boxH}px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  if (type === 'destination') {
    // Elegant Teardrop Crest Badge
    shapeCss = `
      width: ${boxW}px;
      height: ${boxH + 2}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
  } else if (type === 'homestay') {
    // Cozy Cottage Shield Badge with House-top rounding
    shapeCss = `
      width: ${boxW + 2}px;
      height: ${boxH}px;
      border-radius: 14px 14px 6px 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
  } else if (type === 'attraction') {
    // Diamond Crest Badge
    shapeCss = `
      width: ${boxW}px;
      height: ${boxH}px;
      border-radius: 12px;
      transform: rotate(45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    `;
  }

  // Pulse ring animation when selected
  const pulseRing = isSelected
    ? `<div style="
        position: absolute;
        top: -10px; left: -10px; right: -10px; bottom: -10px;
        border-radius: 50%;
        border: 2px solid ${config.accentColor};
        animation: hillyPulse 1.8s infinite ease-out;
        pointer-events: none;
      "></div>`
    : '';

  const html = `
    <div className="hilly-branded-marker" style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    ">
      ${pulseRing}

      <!-- Main Badge -->
      <div style="
        position: relative;
        background: ${config.bgGradient};
        border: ${isSelected ? '2.5px solid #ffffff' : '2px solid #ffffff'};
        outline: ${isSelected ? `2px solid ${config.accentColor}` : 'none'};
        box-shadow: 0 6px 18px ${config.shadowColor}, 0 2px 5px rgba(0,0,0,0.35);
        color: #ffffff;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        ${shapeCss}
      ">
        <div style="${type === 'destination' || type === 'attraction' ? 'transform: rotate(' + (type === 'destination' ? '45deg' : '-45deg') + ');' : ''} display:flex; align-items:center; justify-content:center;">
          ${svgIcon}
        </div>

        ${type === 'homestay' ? `
          <!-- Cozy Homestay Warm Lamp Dot -->
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 9px;
            height: 9px;
            background: #fbbf24;
            border: 1.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 8px #f59e0b;
          " title="Verified Homestay"></div>
        ` : ''}

        ${type === 'destination' ? `
          <!-- Major Destination Crest Dot -->
          <div style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            background: #a855f7;
            border: 1.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 8px #c084fc;
          " title="Major Destination"></div>
        ` : ''}
      </div>

      <!-- Pointing Pin Pointer Tail -->
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${tailColor};
        margin-top: ${type === 'destination' ? '-2px' : '-1px'};
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
      "></div>

      <!-- Floating Title Label Pill on Hover / Selected -->
      ${isSelected ? `
        <div style="
          position: absolute;
          bottom: -24px;
          background: rgba(15, 23, 42, 0.94);
          backdrop-filter: blur(6px);
          color: #ffffff;
          font-family: sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.3px;
          padding: 2.5px 8px;
          border-radius: 9999px;
          border: 1px solid ${config.accentColor};
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>${config.badgeLabel}</span>
          <span style="color:${config.accentColor}; font-weight:900;">•</span>
          <span style="color:#fbbf24;">★ ${rating}</span>
        </div>
      ` : ''}
    </div>
  `;

  return {
    html,
    size: [totalW, totalH] as [number, number],
    anchor: [totalW / 2, totalH] as [number, number]
  };
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  activeLayers = {},
  userCoords,
  routeWaypoints = [],
  center = { lat: 27.0428, lng: 88.2663 }, // Default Darjeeling
  zoom = 10,
  height = '550px',
  className = '',
  onDirectionsRequest
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapTile, setMapTile] = useState<'standard' | 'satellite' | 'terrain'>('standard');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: false
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    if (mapTile === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (mapTile === 'terrain') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap';
    }

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);
  }, [mapTile]);

  // Inject keyframe animation styles for custom branded markers once
  useEffect(() => {
    if (document.getElementById('hilly-branded-marker-styles')) return;
    const style = document.createElement('style');
    style.id = 'hilly-branded-marker-styles';
    style.innerHTML = `
      @keyframes hillyPulse {
        0% { transform: scale(0.8); opacity: 0.95; }
        100% { transform: scale(1.6); opacity: 0; }
      }
      .custom-hilly-marker {
        background: transparent !important;
        border: none !important;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 14px !important;
        padding: 4px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Update Markers for Locations
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    locations.forEach((loc) => {
      // Check layer visibility filter if layer provided
      if (activeLayers && activeLayers[loc.entityType] === false) {
        return;
      }

      const isSelected = selectedLocation?.id === loc.id;
      const markerData = createBrandedMarkerHtml(loc, isSelected);

      const customIcon = L.divIcon({
        className: 'custom-hilly-marker',
        html: markerData.html,
        iconSize: markerData.size,
        iconAnchor: markerData.anchor
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

      const config = ENTITY_MARKER_CONFIGS[loc.entityType] || ENTITY_MARKER_CONFIGS.destination;

      // Popup Content
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; width: 230px; padding: 2px;">
          ${loc.imageUrl ? `
            <div style="position:relative; width:100%; height:115px; border-radius:10px; overflow:hidden; margin-bottom:8px; border:1px solid rgba(0,0,0,0.1);">
              <img src="${loc.imageUrl}" alt="${loc.name}" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:6px; left:6px; background:${config.color}; color:#fff; font-size:9px; font-weight:800; padding:2px 7px; border-radius:999px; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
                ${config.badgeLabel}
              </div>
            </div>
          ` : ''}
          <div style="font-size: 10px; font-weight:800; text-transform:uppercase; color:${config.color}; margin-bottom:2px; tracking-wider:0.5px;">
            ${loc.district} • ${loc.state || 'Sikkim'}
          </div>
          <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:800; color:#0f172a; line-height:1.2;">${loc.name}</h4>
          <p style="margin:0 0 8px 0; font-size:11px; color:#475569; line-clamp:2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.35;">
            ${loc.description || ''}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:600; color:#475569; padding-top:6px; margin-bottom:8px; border-top:1px solid #e2e8f0;">
            <span>⛰️ ${loc.elevation ? `${loc.elevation}m` : 'Hills'}</span>
            <span style="color:#d97706; font-weight:700;">★ ${loc.rating || 4.8} <span style="font-weight:400; color:#94a3b8;">(${loc.reviewCount || 120})</span></span>
          </div>
          <div style="display:flex; gap:6px;">
            <button id="btn-select-${loc.id}" style="flex:1; background:${config.bgGradient}; color:#fff; border:none; padding:7px 10px; border-radius:8px; font-weight:700; font-size:11px; cursor:pointer; box-shadow:0 3px 8px ${config.shadowColor}; transition:all 0.15s ease;">
              Inspect Location
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'hilly-popup-card',
        maxWidth: 260
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${loc.id}`);
        if (btn && onSelectLocation) {
          btn.onclick = () => onSelectLocation(loc);
        }
      });

      marker.on('click', () => {
        if (onSelectLocation) onSelectLocation(loc);
      });

      markersRef.current[loc.id] = marker;
    });
  }, [locations, activeLayers, selectedLocation]);

  // Center on Selected Location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;

    map.flyTo([selectedLocation.lat, selectedLocation.lng], 13, {
      duration: 1.2
    });

    const activeMarker = markersRef.current[selectedLocation.id];
    if (activeMarker) {
      activeMarker.openPopup();
    }
  }, [selectedLocation]);

  // Handle User Location Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div style="
            width:24px; height:24px; background:#2563eb; border:3px solid #ffffff;
            border-radius:50%; box-shadow:0 0 15px rgba(37,99,235,0.8);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map);
      userMarkerRef.current.bindTooltip('Your Location', { permanent: false });
    }
  }, [userCoords]);

  // Draw Route Polyline if Waypoints provided
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeWaypoints && routeWaypoints.length > 1) {
      const latLngs = routeWaypoints.map((wp) => [wp.lat, wp.lng] as [number, number]);

      const polyline = L.polyline(latLngs, {
        color: '#f43f5e', // Rose line
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);

      polylineRef.current = polyline;

      // Fit map bounds to polyline
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
  }, [routeWaypoints]);

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 ${className}`} style={{ height }}>
      {/* Tile Switcher Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex gap-1 text-xs font-semibold">
        <button
          onClick={() => setMapTile('standard')}
          className={`px-3 py-1.5 rounded-lg transition ${
            mapTile === 'standard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapTile('terrain')}
          className={`px-3 py-1.5 rounded-lg transition ${
            mapTile === 'terrain' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Terrain ⛰️
        </button>
        <button
          onClick={() => setMapTile('satellite')}
          className={`px-3 py-1.5 rounded-lg transition ${
            mapTile === 'satellite' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Satellite 🛰️
        </button>
      </div>

      {/* Floating Touch Controls Stack (Zoom In, Zoom Out, Recenter) */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2">
        {/* Zoom In Button */}
        <button
          type="button"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomIn();
            }
          }}
          className="w-11 h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center justify-center font-bold touch-manipulation cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </button>

        {/* Zoom Out Button */}
        <button
          type="button"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomOut();
            }
          }}
          className="w-11 h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center justify-center font-bold touch-manipulation cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </button>

        {/* Recenter / Compass Button */}
        <button
          type="button"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo([center.lat, center.lng], zoom, { duration: 1 });
            }
          }}
          className="w-11 h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center justify-center font-bold touch-manipulation cursor-pointer"
          title="Recenter Map"
          aria-label="Recenter Map"
        >
          <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </button>
      </div>

      {/* Leaflet DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};

function getMarkerIconSymbol(type: EntityType): string {
  switch (type) {
    case 'destination': return '📍';
    case 'attraction': return '🏔️';
    case 'homestay': return '🏡';
    case 'taxi_stand': return '🚕';
    case 'business': return '🏢';
    case 'guide': return '🧭';
    case 'activity': return '🪂';
    case 'route': return '🥾';
    case 'restaurant': return '☕';
    case 'hospital': return '🏥';
    default: return '📍';
  }
}
