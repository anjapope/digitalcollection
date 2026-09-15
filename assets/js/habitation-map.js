(() => {
"use strict";
const panel=document.querySelector("[data-ahm-panel]"); if(!panel)return;
const interpretationWorkspace=panel.closest(".apt-instrument")?.querySelector(".apt-state-panel");
const mapWorkspace=panel.closest("[data-apt-workspace='map']");
const STATES_URL=window.ARCHIVORY_MAP_STATES_URL||"/digitalcollection/assets/data/habitation-map/map-states.json";
const GEO_BASE=window.ARCHIVORY_MAP_GEOJSON_BASE_URL||"/digitalcollection/assets/data/habitation-map/geojson/";
let map=null,states=null,currentMapState=null,currentMode="combined",initialized=false;
const q=s=>panel.querySelector(s), qAll=s=>[...panel.querySelectorAll(s)];
const emit=(n,d)=>window.dispatchEvent(new CustomEvent(n,{detail:d}));
const fetchJson=async u=>{const r=await fetch(u);if(!r.ok)throw new Error(`Request failed (${r.status}): ${u}`);return r.json();};
const empty=()=>({type:"FeatureCollection",features:[]});
function showMapWorkspace(){if(interpretationWorkspace)interpretationWorkspace.hidden=true;if(mapWorkspace)mapWorkspace.hidden=false;panel.hidden=false;}
function showInterpretationWorkspace(){if(mapWorkspace)mapWorkspace.hidden=true;panel.hidden=true;if(interpretationWorkspace)interpretationWorkspace.hidden=false;}
async function ensureMap(){
 if(initialized)return;
 if(!window.maplibregl)throw new Error("MapLibre GL JS is not loaded.");
 map=new maplibregl.Map({
  container:"archivory-habitation-map",
  style:{version:8,sources:{base:{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"© OpenStreetMap contributors"}},layers:[{id:"base",type:"raster",source:"base",paint:{"raster-saturation":-0.85,"raster-contrast":-0.1}}]},
  center:[20,20],zoom:1.6,attributionControl:true
 });
 map.addControl(new maplibregl.NavigationControl({showCompass:false}),"top-right");
 await new Promise(resolve=>map.once("load",resolve));
 map.addSource("ahm-evidence",{type:"geojson",data:empty()});
 map.addSource("ahm-range",{type:"geojson",data:empty()});
 map.addSource("ahm-network",{type:"geojson",data:empty()});
 map.addLayer({id:"ahm-range-fill",type:"fill",source:"ahm-range",paint:{"fill-color":"#6f6252","fill-opacity":0.22}});
 map.addLayer({id:"ahm-range-outline",type:"line",source:"ahm-range",paint:{"line-color":"#4d3422","line-width":1.3,"line-dasharray":[2,2]}});
 map.addLayer({id:"ahm-network-line",type:"line",source:"ahm-network",paint:{"line-color":"#8b5f2b","line-width":2.2,"line-dasharray":[2,1]}});
 map.addLayer({id:"ahm-evidence-points",type:"circle",source:"ahm-evidence",paint:{"circle-radius":5,"circle-color":"#2d261e","circle-stroke-color":"#efe3c3","circle-stroke-width":1.5}});
 map.on("click","ahm-evidence-points",e=>{
  const f=e.features?.[0]; if(!f)return; const p=f.properties||{};
  const esc=v=>String(v??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const html=`<strong>${esc(p.label||"Evidence")}</strong>${p.date?`<div>${esc(p.date)}</div>`:""}${p.evidenceType?`<div>Evidence: ${esc(p.evidenceType)}</div>`:""}${p.note?`<p>${esc(p.note)}</p>`:""}`;
  new maplibregl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
 });
 initialized=true;
}
function vis(id,on){if(map?.getLayer(id))map.setLayoutProperty(id,"visibility",on?"visible":"none");}
function applyMode(mode){
 currentMode=mode;
 qAll("[data-ahm-mode]").forEach(b=>b.classList.toggle("is-active",b.dataset.ahmMode===mode));
 const ev=mode==="evidence"||mode==="combined", rr=mode==="reconstruction"||mode==="combined";
 vis("ahm-evidence-points",ev);vis("ahm-range-fill",rr);vis("ahm-range-outline",rr);vis("ahm-network-line",true);
 emit("archivory:map-mode-change",{source:"habitation-map",mapState:currentMapState,mode});
}
async function loadState(id){
 const s=states?.states?.[id]; if(!s)return false;
 currentMapState=id; await ensureMap();
 const [ev,rg,nw]=await Promise.all([fetchJson(GEO_BASE+s.evidenceSource),fetchJson(GEO_BASE+s.rangeSource),s.networkSource?fetchJson(GEO_BASE+s.networkSource):Promise.resolve(empty())]);
 map.getSource("ahm-evidence").setData(ev);map.getSource("ahm-range").setData(rg);map.getSource("ahm-network").setData(nw);
 q("[data-ahm-label]").textContent=s.label;q("[data-ahm-date]").textContent=s.displayDate;q("[data-ahm-summary]").textContent=s.summary;q("[data-ahm-question]").textContent=s.question;
 map.easeTo({center:s.center,zoom:s.zoom,duration:650});applyMode(currentMode);q("[data-ahm-status]").textContent=`${s.label} map loaded.`;
 emit("archivory:habitation-map-state-change",{source:"habitation-map",mapState:id,label:s.label});
 return true;
}
async function open(id){showMapWorkspace();try{await loadState(id);setTimeout(()=>map?.resize(),0)}catch(e){console.error("ArchIvory habitation map error:",e);q("[data-ahm-status]").textContent="The habitation map could not be loaded.";}}
function close(){showInterpretationWorkspace();emit("archivory:habitation-map-close",{source:"habitation-map"});}
q("[data-ahm-close]").addEventListener("click",close);
qAll("[data-ahm-mode]").forEach(b=>b.addEventListener("click",()=>applyMode(b.dataset.ahmMode)));
window.addEventListener("archivory:open-map-state",e=>{if(e.detail?.mapState)open(e.detail.mapState);});
 window.addEventListener("archivory:timeline-state-change",e=>{if(mapWorkspace && !mapWorkspace.hidden && e.detail?.mapState)loadState(e.detail.mapState).catch(console.error);});
fetch(STATES_URL).then(r=>{if(!r.ok)throw new Error(`Map-state request failed (${r.status})`);return r.json()}).then(d=>{states=d; if(d?.defaultMode) applyMode(d.defaultMode);}).catch(e=>{console.error("ArchIvory map-state error:",e);q("[data-ahm-status]").textContent="Map configuration could not be loaded.";});
window.ArchIvoryHabitationMap={open,close,setState:loadState,setMode:applyMode,getState(){return currentMapState;}};
})();
