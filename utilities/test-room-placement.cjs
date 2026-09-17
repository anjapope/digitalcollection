const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const core = require('../assets/js/room-placement-core.js');
const data = JSON.parse(fs.readFileSync('_site/assets/data/room-editorial.json','utf8'));
const copy = () => structuredClone(data);
test('missing date keys and incomplete geometry fail gracefully',()=>{
    for(const sortKey of [null,undefined,'','  ','unknown']) assert.equal(core.checkTimeline([{sortKey}]).correct,false);
    const d=copy(); delete d.anchors.find(a=>a.slot_id==='gallery_wall_03').content_bounds;
    const result=core.resolve(d,'gallery');
    assert.ok(result.diagnostics.some(message=>message.includes('Invalid geometry')));
    assert.ok(!result.slots.some(binding=>binding.slot.slot_id==='gallery_wall_03'));
});
test('all eight rooms resolve without diagnostics; no Library', () => {
    assert.equal(data.rooms.length,8);
    assert.ok(!data.slots.some(s=>s.room_id==='library'));
    for(const r of data.rooms) assert.deepEqual(core.resolve(data,r.room_id).diagnostics,[]);
    assert.equal(core.resolve(data,'art').room.room_id,'conservation_lab');
});
test('every agreed slot has unique stable geometry and matching artwork version',()=>{
    assert.equal(data.slots.length,45);
    assert.equal(new Set(data.slots.map(s=>s.slot_id)).size,45);
    for(const slot of data.slots) {
        const a=data.anchors.find(a=>a.anchor_id===slot.anchor_id);
        assert.equal(a.slot_id,slot.slot_id);
        assert.equal(a.background_asset || '',data.rooms.find(r=>r.room_id===slot.room_id).background_asset || '');
    }
});
test('nested habitation map is a component mount',()=>{
    assert.ok(data.anchors.find(a=>a.slot_id==='natural_history_map_02').component_mount);
});
test('published placement changes content without changing slot geometry',()=>{
    const d=copy(),p=d.placements.find(p=>p.slot_id==='gallery_wall_03');
    const original=JSON.stringify(d.anchors);
    p.content_id='art-relief-sequence';
    const slot=core.resolve(d,'gallery').slots.find(s=>s.slot.slot_id==='gallery_wall_03');
    assert.equal(slot.items[0].content.content_id,'art-relief-sequence');
    assert.equal(JSON.stringify(d.anchors),original);
});
test('empty and unpublished locations have no active control',()=>{
    const d=copy(); d.placements.forEach(p=>p.published='false');
    assert.equal(core.resolve(d,'gallery').slots.length,0);
});
test('disabled rooms and slots do not render',()=>{
    const d=copy();d.rooms.find(r=>r.room_id==='gallery').enabled='false';
    assert.equal(core.resolve(d,'gallery').slots.length,0);
    d.rooms.find(r=>r.room_id==='gallery').enabled='true';d.slots.filter(s=>s.room_id==='gallery').forEach(s=>s.enabled='false');
    assert.equal(core.resolve(d,'gallery').slots.length,0);
});
test('duplicate IDs fail closed',()=>{
    const d=copy();d.placements.push({...d.placements[0]});
    const r=core.resolve(d,'gallery');assert.ok(r.diagnostics.some(x=>x.startsWith('Duplicate')));
});
test('unknown references, unsupported types and overflow produce diagnostics',()=>{
    for(const change of [p=>p.slot_id='missing',p=>p.content_id='missing',p=>p.content_type='video-unknown']) {
        const d=copy();change(d.placements[0]);assert.ok(core.resolve(d,'gallery').diagnostics.length);
    }
    const d=copy();const p=d.placements.find(p=>p.slot_id==='gallery_wall_03');d.placements.push({...p,placement_id:'overflow'});
    const result=core.resolve(d,'gallery');assert.ok(result.diagnostics.some(x=>x.includes('Excess capacity')));
    assert.ok(!result.slots.some(s=>s.slot.slot_id==='gallery_wall_03'));
});
test('equivalent dates are accepted in either order',()=>{
    const events=[{id:'a',sortKey:-10},{id:'c',sortKey:20},{id:'b',sortKey:20},{id:'d',sortKey:100}];
    assert.ok(core.checkTimeline(events).correct);
    [events[1],events[2]]=[events[2],events[1]];assert.ok(core.checkTimeline(events).correct);
    [events[0],events[3]]=[events[3],events[0]];assert.equal(core.checkTimeline(events).correct,false);
    assert.deepEqual(core.checkTimeline(events).positions,[false,true,true,false]);
});
test('uncertain attic papers remain equivalent',()=>{
    const events=data.events.filter(e=>e.timeline_id==='family_traces').sort((a,b)=>+a.sortKey-+b.sortKey);
    assert.equal(events[1].sortKey,events[2].sortKey);
    [events[1],events[2]]=[events[2],events[1]];assert.ok(core.checkTimeline(events).correct);
});
test('shuffle preserves records and avoids an initially solved distinct sequence',()=>{
    const events=[{id:'a',sortKey:-100},{id:'b',sortKey:10},{id:'c',sortKey:20}];
    const before=JSON.stringify(events);
    for(const random of [()=>0,()=>.5,()=>.999]) {const shuffled=core.shuffle(events,random);assert.deepEqual(shuffled.map(e=>e.id).sort(),['a','b','c']);assert.equal(core.checkTimeline(shuffled).correct,false);}
    assert.equal(JSON.stringify(events),before);
    assert.equal(core.checkTimeline([]).correct,false);
    assert.equal(core.checkTimeline([{sortKey:'unknown'}]).correct,false);
});
