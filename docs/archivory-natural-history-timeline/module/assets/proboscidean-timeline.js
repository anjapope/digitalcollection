(() => {
"use strict";
const module=document.getElementById("archivory-proboscidean-timeline"); if(!module)return;
const DATA_URL=window.ARCHIVORY_TIMELINE_DATA_URL||"/digitalcollection/assets/data/proboscidean-timeline.json";
const track=module.querySelector("[data-apt-track]"),status=module.querySelector("[data-apt-status]");
const prev=module.querySelector("[data-apt-prev]"),next=module.querySelector("[data-apt-next]");
const mapButton=module.querySelector("[data-apt-map-action]"),questionButton=module.querySelector("[data-apt-question-action]");
let data=null,activeIndex=0;
const emit=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));
const currentState=()=>data.states[activeIndex];
function renderMarkers(){track.replaceChildren();data.states.forEach((state,index)=>{const b=document.createElement("button");b.type="button";b.className="apt-marker";b.dataset.stateId=state.id;b.innerHTML=`<strong>${state.label}</strong><span>${state.displayDate}</span>`;b.addEventListener("click",()=>setState(index,true));track.appendChild(b);});}
function renderState(){const s=currentState();module.querySelector("[data-apt-intro]").textContent=data.intro;module.querySelector("[data-apt-date]").textContent=s.displayDate;module.querySelector("[data-apt-era]").textContent=s.era;module.querySelector("[data-apt-label]").textContent=s.label;module.querySelector("[data-apt-summary]").textContent=s.summary;module.querySelector("[data-apt-interpretation]").textContent=s.interpretation;module.querySelector("[data-apt-question]").textContent=s.question;const ul=module.querySelector("[data-apt-species]");ul.replaceChildren();s.species.forEach(name=>{const li=document.createElement("li");li.textContent=name;ul.appendChild(li)});module.querySelectorAll(".apt-marker").forEach((b,i)=>{const a=i===activeIndex;b.classList.toggle("is-active",a);b.setAttribute("aria-current",a?"step":"false")});prev.disabled=activeIndex===0;next.disabled=activeIndex===data.states.length-1;status.textContent=`${s.label} selected.`;emit("archivory:timeline-state-change",{source:"proboscidean-timeline",moduleId:data.moduleId,stateId:s.id,mapState:s.mapState,questionIds:s.questionIds});}
function setState(index,updateHash=false){if(!data||index<0||index>=data.states.length)return;activeIndex=index;if(updateHash)history.replaceState(null,"",`#apt-${data.states[index].id}`);renderState();}
function findInitialState(){const m=location.hash.match(/^#apt-(.+)$/);if(!m)return 0;const i=data.states.findIndex(s=>s.id===m[1]);return i>=0?i:0;}
prev.addEventListener("click",()=>setState(activeIndex-1,true));next.addEventListener("click",()=>setState(activeIndex+1,true));
mapButton.addEventListener("click",()=>{const s=currentState();emit("archivory:open-map-state",{source:"proboscidean-timeline",moduleId:data.moduleId,stateId:s.id,mapState:s.mapState});});
questionButton.addEventListener("click",()=>{const s=currentState();emit("archivory:open-question",{source:"proboscidean-timeline",moduleId:data.moduleId,stateId:s.id,questionIds:s.questionIds,question:s.question,points:s.points});});
window.addEventListener("hashchange",()=>{if(!data)return;const i=findInitialState();if(i!==activeIndex)setState(i,false)});
fetch(DATA_URL).then(r=>{if(!r.ok)throw new Error(`Timeline data request failed (${r.status})`);return r.json()}).then(payload=>{data=payload;activeIndex=findInitialState();renderMarkers();renderState();}).catch(error=>{console.error("ArchIvory timeline error:",error);status.textContent="The proboscidean timeline could not be loaded.";});
window.ArchIvoryTimeline={setStateById(id){if(!data)return false;const i=data.states.findIndex(s=>s.id===id);if(i<0)return false;setState(i,true);return true;},getState(){return data?currentState():null;}};
})();