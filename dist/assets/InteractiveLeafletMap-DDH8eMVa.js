import{r as i,j as n}from"./vendor-core-D3eya0eI.js";import{L as b}from"./vendor-maps-C-c7-Y8-.js";import{av as z,bY as G,g as R}from"./vendor-icons-DsS5cLVm.js";const M={destination:{color:"#8b5cf6",bgGradient:"linear-gradient(135deg, #8b5cf6, #5b21b6)",accentColor:"#c084fc",badgeLabel:"DESTINATION",shadowColor:"rgba(139, 92, 246, 0.55)"},homestay:{color:"#10b981",bgGradient:"linear-gradient(135deg, #10b981, #047857)",accentColor:"#34d399",badgeLabel:"HOMESTAY",shadowColor:"rgba(16, 185, 129, 0.55)"},attraction:{color:"#f59e0b",bgGradient:"linear-gradient(135deg, #f59e0b, #b45309)",accentColor:"#fbbf24",badgeLabel:"ATTRACTION",shadowColor:"rgba(245, 158, 11, 0.55)"},taxi_stand:{color:"#eab308",bgGradient:"linear-gradient(135deg, #eab308, #a16207)",accentColor:"#fde047",badgeLabel:"TAXI HUB",shadowColor:"rgba(234, 179, 8, 0.55)"},taxi_operator:{color:"#ca8a04",bgGradient:"linear-gradient(135deg, #ca8a04, #854d0e)",accentColor:"#fef08a",badgeLabel:"TAXI OPERATOR",shadowColor:"rgba(202, 138, 4, 0.55)"},business:{color:"#6366f1",bgGradient:"linear-gradient(135deg, #6366f1, #3730a3)",accentColor:"#818cf8",badgeLabel:"BUSINESS",shadowColor:"rgba(99, 102, 241, 0.55)"},guide:{color:"#ec4899",bgGradient:"linear-gradient(135deg, #ec4899, #9d174d)",accentColor:"#f472b6",badgeLabel:"GUIDE",shadowColor:"rgba(236, 72, 153, 0.55)"},activity:{color:"#14b8a6",bgGradient:"linear-gradient(135deg, #14b8a6, #0f766e)",accentColor:"#2dd4bf",badgeLabel:"ACTIVITY",shadowColor:"rgba(20, 184, 166, 0.55)"},route:{color:"#f43f5e",bgGradient:"linear-gradient(135deg, #f43f5e, #9f1239)",accentColor:"#fb7185",badgeLabel:"ROUTE",shadowColor:"rgba(244, 63, 94, 0.55)"},hub:{color:"#3b82f6",bgGradient:"linear-gradient(135deg, #3b82f6, #1d4ed8)",accentColor:"#60a5fa",badgeLabel:"TRANSPORT HUB",shadowColor:"rgba(59, 130, 246, 0.55)"},hospital:{color:"#ef4444",bgGradient:"linear-gradient(135deg, #ef4444, #991b1b)",accentColor:"#f87171",badgeLabel:"HOSPITAL",shadowColor:"rgba(239, 68, 68, 0.55)"},restaurant:{color:"#f97316",bgGradient:"linear-gradient(135deg, #f97316, #c2410c)",accentColor:"#fb923c",badgeLabel:"DINING / TEA",shadowColor:"rgba(249, 115, 22, 0.55)"},viewpoint:{color:"#06b6d4",bgGradient:"linear-gradient(135deg, #06b6d4, #0e7490)",accentColor:"#67e8f9",badgeLabel:"VIEWPOINT",shadowColor:"rgba(6, 182, 212, 0.55)"}};function A(c){switch(c){case"destination":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.15 13.8 9 10l3 3 4.35-4.35"/></svg>';case"homestay":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10 12 3l9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z"/><path d="M9 22V12h6v10"/><path d="M18 4v3.5"/></svg>';case"attraction":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';case"taxi_stand":case"taxi_operator":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H8c-.7 0-1.3.3-1.8.7C5.3 8.6 4 10 4 10s-2.7.6-4.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>';case"viewpoint":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';case"guide":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>';case"business":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>';case"restaurant":return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>';default:return'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'}}function B(c,o){const a=c.entityType,s=M[a]||M.destination,h=A(a),u=c.rating?c.rating.toFixed(1):"4.8",l=o?42:34,f=o?42:34,w=o?50:40,k=o?62:50,j=s.color;let p=`
    width: ${l}px;
    height: ${f}px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  `;return a==="destination"?p=`
      width: ${l}px;
      height: ${f+2}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    `:a==="homestay"?p=`
      width: ${l+2}px;
      height: ${f}px;
      border-radius: 14px 14px 6px 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    `:a==="attraction"&&(p=`
      width: ${l}px;
      height: ${f}px;
      border-radius: 12px;
      transform: rotate(45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    `),{html:`
    <div className="hilly-branded-marker" style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    ">
      ${o?`<div style="
        position: absolute;
        top: -10px; left: -10px; right: -10px; bottom: -10px;
        border-radius: 50%;
        border: 2px solid ${s.accentColor};
        animation: hillyPulse 1.8s infinite ease-out;
        pointer-events: none;
      "></div>`:""}

      <!-- Main Badge -->
      <div style="
        position: relative;
        background: ${s.bgGradient};
        border: ${o?"2.5px solid #ffffff":"2px solid #ffffff"};
        outline: ${o?`2px solid ${s.accentColor}`:"none"};
        box-shadow: 0 6px 18px ${s.shadowColor}, 0 2px 5px rgba(0,0,0,0.35);
        color: #ffffff;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        ${p}
      ">
        <div style="${a==="destination"||a==="attraction"?"transform: rotate("+(a==="destination"?"45deg":"-45deg")+");":""} display:flex; align-items:center; justify-content:center;">
          ${h}
        </div>

        ${a==="homestay"?`
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
        `:""}

        ${a==="destination"?`
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
        `:""}
      </div>

      <!-- Pointing Pin Pointer Tail -->
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${j};
        margin-top: ${a==="destination"?"-2px":"-1px"};
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
      "></div>

      <!-- Floating Title Label Pill on Hover / Selected -->
      ${o?`
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
          border: 1px solid ${s.accentColor};
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>${s.badgeLabel}</span>
          <span style="color:${s.accentColor}; font-weight:900;">•</span>
          <span style="color:#fbbf24;">★ ${u}</span>
        </div>
      `:""}
    </div>
  `,size:[w,k],anchor:[w/2,k]}}const P=({locations:c,selectedLocation:o,onSelectLocation:a,activeLayers:s={},userCoords:h,routeWaypoints:u=[],center:l={lat:27.0428,lng:88.2663},zoom:f=10,height:w="550px",className:k="",onDirectionsRequest:j})=>{const p=i.useRef(null),r=i.useRef(null),m=i.useRef({}),C=i.useRef(null),y=i.useRef(null),[x,T]=i.useState("standard");return i.useEffect(()=>{if(p.current){if(!r.current){const t=b.map(p.current,{center:[l.lat,l.lng],zoom:f,zoomControl:!1});r.current=t}return()=>{r.current&&(r.current.remove(),r.current=null)}}},[]),i.useEffect(()=>{const t=r.current;if(!t)return;t.eachLayer(d=>{d instanceof b.TileLayer&&t.removeLayer(d)});let e="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",g='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';x==="satellite"?(e="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",g="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"):x==="terrain"&&(e="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",g="Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap"),b.tileLayer(e,{attribution:g,maxZoom:18}).addTo(t)},[x]),i.useEffect(()=>{if(document.getElementById("hilly-branded-marker-styles"))return;const t=document.createElement("style");t.id="hilly-branded-marker-styles",t.innerHTML=`
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
    `,document.head.appendChild(t)},[]),i.useEffect(()=>{const t=r.current;t&&(Object.values(m.current).forEach(e=>e.remove()),m.current={},c.forEach(e=>{if(s&&s[e.entityType]===!1)return;const g=o?.id===e.id,d=B(e,g),E=b.divIcon({className:"custom-hilly-marker",html:d.html,iconSize:d.size,iconAnchor:d.anchor}),$=b.marker([e.lat,e.lng],{icon:E}).addTo(t),v=M[e.entityType]||M.destination,N=`
        <div style="font-family: system-ui, -apple-system, sans-serif; width: 230px; padding: 2px;">
          ${e.imageUrl?`
            <div style="position:relative; width:100%; height:115px; border-radius:10px; overflow:hidden; margin-bottom:8px; border:1px solid rgba(0,0,0,0.1);">
              <img src="${e.imageUrl}" alt="${e.name}" style="width:100%; height:100%; object-fit:cover;" />
              <div style="position:absolute; top:6px; left:6px; background:${v.color}; color:#fff; font-size:9px; font-weight:800; padding:2px 7px; border-radius:999px; text-transform:uppercase; letter-spacing:0.5px; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
                ${v.badgeLabel}
              </div>
            </div>
          `:""}
          <div style="font-size: 10px; font-weight:800; text-transform:uppercase; color:${v.color}; margin-bottom:2px; tracking-wider:0.5px;">
            ${e.district} • ${e.state||"Sikkim"}
          </div>
          <h4 style="margin:0 0 4px 0; font-size:14px; font-weight:800; color:#0f172a; line-height:1.2;">${e.name}</h4>
          <p style="margin:0 0 8px 0; font-size:11px; color:#475569; line-clamp:2; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.35;">
            ${e.description||""}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:600; color:#475569; padding-top:6px; margin-bottom:8px; border-top:1px solid #e2e8f0;">
            <span>⛰️ ${e.elevation?`${e.elevation}m`:"Hills"}</span>
            <span style="color:#d97706; font-weight:700;">★ ${e.rating||4.8} <span style="font-weight:400; color:#94a3b8;">(${e.reviewCount||120})</span></span>
          </div>
          <div style="display:flex; gap:6px;">
            <button id="btn-select-${e.id}" style="flex:1; background:${v.bgGradient}; color:#fff; border:none; padding:7px 10px; border-radius:8px; font-weight:700; font-size:11px; cursor:pointer; box-shadow:0 3px 8px ${v.shadowColor}; transition:all 0.15s ease;">
              Inspect Location
            </button>
          </div>
        </div>
      `;$.bindPopup(N,{className:"hilly-popup-card",maxWidth:260}),$.on("popupopen",()=>{const I=document.getElementById(`btn-select-${e.id}`);I&&a&&(I.onclick=()=>a(e))}),$.on("click",()=>{a&&a(e)}),m.current[e.id]=$}))},[c,s,o]),i.useEffect(()=>{const t=r.current;if(!t||!o)return;t.flyTo([o.lat,o.lng],13,{duration:1.2});const e=m.current[o.id];e&&e.openPopup()},[o]),i.useEffect(()=>{const t=r.current;if(t&&(y.current&&(y.current.remove(),y.current=null),h)){const e=b.divIcon({className:"user-pulse-marker",html:`
          <div style="
            width:24px; height:24px; background:#2563eb; border:3px solid #ffffff;
            border-radius:50%; box-shadow:0 0 15px rgba(37,99,235,0.8);
          "></div>
        `,iconSize:[24,24],iconAnchor:[12,12]});y.current=b.marker([h.lat,h.lng],{icon:e}).addTo(t),y.current.bindTooltip("Your Location",{permanent:!1})}},[h]),i.useEffect(()=>{const t=r.current;if(t&&(C.current&&(C.current.remove(),C.current=null),u&&u.length>1)){const e=u.map(d=>[d.lat,d.lng]),g=b.polyline(e,{color:"#f43f5e",weight:5,opacity:.85,dashArray:"8, 8"}).addTo(t);C.current=g,t.fitBounds(g.getBounds(),{padding:[50,50]})}},[u]),n.jsxs("div",{className:`relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 ${k}`,style:{height:w},children:[n.jsxs("div",{className:"absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex gap-1 text-xs font-semibold",children:[n.jsx("button",{onClick:()=>T("standard"),className:`px-3 py-1.5 rounded-lg transition ${x==="standard"?"bg-indigo-600 text-white shadow-sm":"text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,children:"Map"}),n.jsx("button",{onClick:()=>T("terrain"),className:`px-3 py-1.5 rounded-lg transition ${x==="terrain"?"bg-indigo-600 text-white shadow-sm":"text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,children:"Terrain ⛰️"}),n.jsx("button",{onClick:()=>T("satellite"),className:`px-3 py-1.5 rounded-lg transition ${x==="satellite"?"bg-indigo-600 text-white shadow-sm":"text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`,children:"Satellite 🛰️"})]}),n.jsxs("div",{className:"absolute bottom-6 right-4 z-[1000] flex flex-col gap-2",children:[n.jsx("button",{type:"button",onClick:()=>{r.current&&r.current.zoomIn()},className:"w-11 h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center justify-center font-bold touch-manipulation cursor-pointer",title:"Zoom In","aria-label":"Zoom In",children:n.jsx(z,{className:"w-5 h-5 text-indigo-600 dark:text-indigo-400"})}),n.jsx("button",{type:"button",onClick:()=>{r.current&&r.current.zoomOut()},className:"w-11 h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center justify-center font-bold touch-manipulation cursor-pointer",title:"Zoom Out","aria-label":"Zoom Out",children:n.jsx(G,{className:"w-5 h-5 text-indigo-600 dark:text-indigo-400"})}),n.jsx("button",{type:"button",onClick:()=>{r.current&&r.current.flyTo([l.lat,l.lng],f,{duration:1})},className:"w-11 h-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-white rounded-xl shadow-xl border border-slate-200/90 dark:border-slate-700/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition flex items-center justify-center font-bold touch-manipulation cursor-pointer",title:"Recenter Map","aria-label":"Recenter Map",children:n.jsx(R,{className:"w-5 h-5 text-indigo-600 dark:text-indigo-400"})})]}),n.jsx("div",{ref:p,className:"w-full h-full z-0"})]})};export{P as InteractiveLeafletMap};
