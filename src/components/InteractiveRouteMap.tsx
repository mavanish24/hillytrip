// src/components/InteractiveRouteMap.tsx
import React, { useState } from 'react';
import { 
  Map, ZoomIn, ZoomOut, Check, Info, Shield, Radio,
  Compass, MapPin, Fuel, Coffee, Navigation, HelpCircle,
  Activity, AlertTriangle, AlertCircle
} from 'lucide-react';
import { TimelineNode } from '../utils/routeHelpers';

interface InteractiveRouteMapProps {
  fromName: string;
  toName: string;
  timelineStops: TimelineNode[];
  distanceKm: number;
}

// Points of interest scattered dynamically along the corridor nodes
interface POI {
  id: string;
  name: string;
  category: 'taxi' | 'attraction' | 'parking' | 'fuel' | 'food' | 'toilet' | 'medical' | 'police' | 'atm' | 'network';
  description: string;
  x: number; // percentage coordinate inside SVG
  y: number;
  icon: React.ReactNode;
  color: string;
}

export default function InteractiveRouteMap({
  fromName,
  toName,
  timelineStops,
  distanceKm
}: InteractiveRouteMapProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeLayer, setActiveLayer] = useState<string>('stops');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  // Generate deterministic coordinates and features based on stops
  const pointsOfInterest: POI[] = React.useMemo(() => {
    const list: POI[] = [];

    // Add Stops
    timelineStops.forEach((stop, idx) => {
      const fraction = idx / (timelineStops.length - 1);
      // Map x across 10% to 90%
      const x = 10 + fraction * 80;
      // Winding y (sine curve for mountain feel)
      const y = 50 + Math.sin(fraction * Math.PI * 2) * 20 + (idx % 2 === 0 ? 5 : -5);

      list.push({
        id: `stop-${idx}`,
        name: stop.name,
        category: idx === 0 || idx === timelineStops.length - 1 ? 'taxi' : 'attraction',
        description: stop.desc,
        x,
        y,
        icon: <MapPin className="w-3.5 h-3.5 text-emerald-400" />,
        color: idx === 0 ? '#f59e0b' : idx === timelineStops.length - 1 ? '#10b981' : '#a855f7'
      });

      // Add adjacent utilities
      if (idx > 0 && idx < timelineStops.length - 1) {
        // Fuel near center
        if (idx === 2) {
          list.push({
            id: 'fuel-1',
            name: "NH-31A High Altitude Fuel Outpost",
            category: 'fuel',
            description: "24/7 diesel and premium petrol station with basic repair shop.",
            x: x - 4,
            y: y + 12,
            icon: <Fuel className="w-3.5 h-3.5" />,
            color: '#ef4444'
          });
        }
        // Food
        if (idx === 3) {
          list.push({
            id: 'food-1',
            name: "Himalayan Ridge Momos & Teahouse",
            category: 'food',
            description: "Famous local pitstop. Heated seating space serving fresh ginger tea and butter buns.",
            x: x + 5,
            y: y - 10,
            icon: <Coffee className="w-3.5 h-3.5" />,
            color: '#f59e0b'
          });
        }
        // Hospital / Medical
        if (idx === 4) {
          list.push({
            id: 'medical-1',
            name: "Army Medical Response Camp",
            category: 'medical',
            description: "High-altitude clinic with basic emergency support and oxygen cylinders.",
            x: x - 2,
            y: y - 14,
            icon: <Activity className="w-3.5 h-3.5" />,
            color: '#ec4899'
          });
        }
        // Police Guard Post
        if (idx === 1) {
          list.push({
            id: 'police-1',
            name: "Sikkim State Police Transit Post",
            category: 'police',
            description: "Tourist permits checking post and local route status reporting line.",
            x: x + 3,
            y: y + 10,
            icon: <Shield className="w-3.5 h-3.5" />,
            color: '#3b82f6'
          });
        }
      }
    });

    return list;
  }, [timelineStops]);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 280;

  // Filtered Points based on selected layer
  const filteredPois = pointsOfInterest.filter(poi => {
    if (activeLayer === 'all') return true;
    if (activeLayer === 'stops') return poi.category === 'taxi' || poi.category === 'attraction';
    return poi.category === activeLayer;
  });

  return (
    <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(3,10,6,0.5)] overflow-hidden text-left relative flex flex-col gap-6 select-none">
      
      {/* Top Controller Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-emerald-400 tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" /> Custom Corridor Vector Map
          </h3>
          <p className="text-xs text-slate-400 font-medium">Toggle satellite intelligence, emergency clinics, fuel outlets, and local networks along NH-31A.</p>
        </div>

        {/* Zoom Button Array */}
        <div className="flex items-center gap-1.5 bg-slate-950/65 backdrop-blur-md px-2 py-1 rounded-xl border border-emerald-500/10 self-stretch md:self-auto justify-center md:justify-start">
          <button 
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
            className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-emerald-400 font-black px-1.5">{Math.round(zoomLevel * 100)}%</span>
          <button 
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
            className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer Filters Strip */}
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {[
          { id: 'stops', label: '🏔 Station Nodes' },
          { id: 'all', label: '🌐 All Features' },
          { id: 'fuel', label: '⛽ Fuel Stations' },
          { id: 'food', label: '🍜 Local Eateries' },
          { id: 'medical', label: '🏥 Medical Camps' },
          { id: 'police', label: '👮 Police Posts' },
          { id: 'network', label: '📶 Network Signals' }
        ].map(layer => (
          <button
            key={layer.id}
            onClick={() => {
              setActiveLayer(layer.id);
              setSelectedPoi(null);
            }}
            className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-wider rounded-lg border transition shrink-0 cursor-pointer ${
              activeLayer === layer.id 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35 shadow-xs font-black' 
                : 'bg-slate-950/30 text-slate-400 border-slate-900 hover:text-slate-200 hover:bg-slate-950/60'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Core Map Grid & Drawing Area */}
      <div className="relative bg-[#020a06] border border-emerald-500/15 rounded-2xl overflow-hidden h-[300px] flex items-center justify-center">
        
        {/* Dynamic Coordinate Ticks for topographic feel */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-2 left-4 text-[8px] font-mono text-slate-500">LAT 27°36' N</div>
          <div className="absolute bottom-2 left-4 text-[8px] font-mono text-slate-500">LON 88°37' E</div>
          <div className="absolute top-2 right-4 text-[8px] font-mono text-slate-500">ALT {timelineStops[0]?.elevation || 1500}M</div>
          
          {/* Faint crosshairs */}
          <div className="absolute top-1/2 left-4 right-4 h-[0.5px] border-b border-dashed border-emerald-500/20"></div>
          <div className="absolute left-1/2 top-4 bottom-4 w-[0.5px] border-l border-dashed border-emerald-500/20"></div>
        </div>

        {/* Network Signal Signal Ring overlays when network toggled */}
        {activeLayer === 'network' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-around">
            <div className="w-56 h-56 rounded-full border border-dashed border-emerald-500/10 animate-ping absolute left-1/4"></div>
            <div className="w-72 h-72 rounded-full border border-dashed border-sky-500/5 animate-ping absolute right-1/4"></div>
          </div>
        )}

        {/* Zoomable Inner Canvas Container */}
        <div 
          className="w-full h-full relative transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* 1. Draw glowing neon path behind */}
            <path 
              d={`M 80 140 C 240 60, 320 220, 480 120 C 560 60, 640 180, 720 140`}
              fill="none" 
              stroke="#064e3b" 
              strokeWidth="6" 
              strokeLinecap="round"
              className="opacity-40"
            />
            {/* Active pulsing neon corridor line */}
            <path 
              d={`M 80 140 C 240 60, 320 220, 480 120 C 560 60, 640 180, 720 140`}
              fill="none" 
              stroke="#10b981" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              strokeDasharray="8 4"
              className="animate-dash"
            />

            {/* 2. Plot POIs and Stops */}
            {filteredPois.map((poi, idx) => {
              const xPos = (poi.x / 100) * svgWidth;
              const yPos = (poi.y / 100) * svgHeight;
              const isSelected = selectedPoi?.id === poi.id;

              return (
                <g 
                  key={poi.id}
                  className="cursor-pointer group/node"
                  onClick={() => setSelectedPoi(poi)}
                >
                  {/* Outer glow aura on select or hover */}
                  <circle 
                    cx={xPos} 
                    cy={yPos} 
                    r={isSelected ? "14" : "9"} 
                    fill={`${poi.color}30`} 
                    className="transition-all duration-300 group-hover/node:scale-125"
                  />
                  
                  {/* Center pin circle */}
                  <circle 
                    cx={xPos} 
                    cy={yPos} 
                    r="5" 
                    fill={poi.color} 
                    className="transition-all duration-300"
                  />

                  {/* Icon container */}
                  <foreignObject 
                    x={xPos - 8} 
                    y={yPos - 22} 
                    width="16" 
                    height="16"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full w-4.5 h-4.5 shadow-md">
                      {poi.icon}
                    </div>
                  </foreignObject>

                  {/* Label Text below node */}
                  <text 
                    x={xPos} 
                    y={yPos + 18} 
                    textAnchor="middle" 
                    fill={isSelected ? "#10b981" : "#cbd5e1"} 
                    fontSize="8.5" 
                    fontWeight={isSelected ? "bold" : "medium"}
                    fontFamily="monospace"
                    className="select-none pointer-events-none transition-colors duration-200"
                  >
                    {poi.name.length > 15 ? poi.name.slice(0, 13) + '..' : poi.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details HUD overlay (Awwwards design) */}
        {selectedPoi && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md border border-emerald-500/20 p-4 rounded-xl shadow-xl flex items-start gap-3 animate-slide-up z-20">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              {selectedPoi.icon}
            </div>
            <div className="min-w-0 flex-grow text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest font-mono">
                  {selectedPoi.category.toUpperCase()} • NH-31A Node
                </span>
                <button 
                  onClick={() => setSelectedPoi(null)}
                  className="text-slate-400 hover:text-white font-extrabold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h4 className="text-xs font-black text-white truncate mt-0.5">{selectedPoi.name}</h4>
              <p className="text-[10.5px] text-slate-300 font-medium leading-relaxed mt-1">
                {selectedPoi.description}
              </p>
            </div>
          </div>
        )}

        {/* Floating Instructions Banner */}
        {!selectedPoi && (
          <div className="absolute top-4 left-4 bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-900 text-[10px] text-slate-400 flex items-center gap-1.5 pointer-events-none">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Click any node or utility pin along the corridor to explore local intel.</span>
          </div>
        )}
      </div>

      {/* Network Signals Grid Indicators (Only when Signal layer is on) */}
      {activeLayer === 'network' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#020a06] border border-emerald-500/10 p-3 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 font-mono block">JIO SATELLITE RANGE</span>
            <span className="text-xs font-black text-emerald-400 mt-1 block">📶 Good Coverage (LTE)</span>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Stable network across major canyon passes. Temporary dropouts near deep gorges.</p>
          </div>
          <div className="bg-[#020a06] border border-emerald-500/10 p-3 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 font-mono block">AIRTEL HILLS LINK</span>
            <span className="text-xs font-black text-emerald-400 mt-1 block">📶 Good Coverage (4G)</span>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Strong reception near base stations. Occasional network switches to local valley relays.</p>
          </div>
          <div className="bg-[#020a06] border border-emerald-500/10 p-3 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 font-mono block">BSNL DEEP FRONTIER</span>
            <span className="text-xs font-black text-emerald-400 mt-1 block">📶 Full Signal (3G/Voice)</span>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">Most reliable service for emergency cell voice calls inside remote high-altitude stretches.</p>
          </div>
        </div>
      )}
    </div>
  );
}
