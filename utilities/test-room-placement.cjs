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

// In-room media rendering (core.resolveMedia): resolves which image, if any, should be
// rendered inline at a resolved slot's anchor. Purely data-driven; DOM rendering in
// room-placement.js reuses this same function, so it is exercised here without a browser.
test('image-bearing placement resolves the assigned media at its anchor',()=>{
    const resolved=core.resolve(data,'gallery');
    const binding=resolved.slots.find(b=>b.slot.slot_id==='gallery_wall_03');
    assert.ok(binding,'gallery_wall_03 (the replaceable sconce frame) should resolve as an active slot');
    assert.equal(binding.anchor.slot_id,'gallery_wall_03');
    assert.equal(binding.slot.room_id,'gallery');
    const media=core.resolveMedia(binding.anchor,binding.items);
    assert.ok(media,'an inline_content anchor with an image-bearing placement should resolve media');
    assert.equal(media.image,binding.items[0].content.image);
    assert.equal(media.preserveAspectRatio,'xMidYMid meet');
});
test('a placement without an image does not resolve media (no image element should be created)',()=>{
    const d=copy();
    const binding=core.resolve(d,'gallery').slots.find(b=>b.slot.slot_id==='gallery_wall_03');
    binding.items[0].content.image='';
    assert.equal(core.resolveMedia(binding.anchor,binding.items),null);
});
test('the Geib Flute resolves visibly at the enabled Natural History panel',()=>{
    const resolved=core.resolve(data,'natural_history');
    const binding=resolved.slots.find(b=>b.slot.slot_id==='natural_history_panel_02');
    assert.ok(binding,'natural_history_panel_02 should resolve as an active slot');
    assert.equal(binding.items[0].content.content_id,'geib-flute');
    assert.equal(binding.anchor.inline_content,true);
    assert.equal(core.resolveMedia(binding.anchor,binding.items).image,'/assets/img/editorial/geib-flute-3ec90b3a3ce8.jpeg');
});
test('unpublishing the Geib Flute removes its visual panel binding',()=>{
    const d=copy();
    d.placements.find(p=>p.placement_id==='geib-flute').published='false';
    const resolved=core.resolve(d,'natural_history');
    assert.ok(!resolved.slots.some(b=>b.slot.slot_id==='natural_history_panel_02'));
});
test('interaction-only anchors never resolve media, even with an image and an active placement',()=>{
    const d=copy();
    const anchor=d.anchors.find(a=>a.slot_id==='gallery_wall_01');
    const placement=d.placements.find(p=>p.placement_id==='geib-flute');
    placement.slot_id='gallery_wall_01';
    const binding=core.resolve(d,'gallery').slots.find(b=>b.slot.slot_id==='gallery_wall_01');
    assert.equal(anchor.inline_content,false);
    assert.equal(core.resolveMedia(binding.anchor,binding.items),null);
});
test('unpublished placements never reach a resolved slot, so they cannot resolve media',()=>{
    const d=copy();
    d.placements.filter(p=>p.slot_id==='gallery_wall_03').forEach(p=>p.published='false');
    const resolved=core.resolve(d,'gallery');
    assert.ok(!resolved.slots.some(b=>b.slot.slot_id==='gallery_wall_03'));
});
test('a placement only resolves media in the room it belongs to',()=>{
    assert.ok(core.resolve(data,'gallery').slots.some(b=>b.slot.slot_id==='gallery_wall_03'));
    assert.ok(!core.resolve(data,'conservation_lab').slots.some(b=>b.slot.slot_id==='gallery_wall_03'));
});
test('resolveMedia honors an anchor fit override, defaulting unknown/missing fit to contain',()=>{
    const binding=core.resolve(data,'gallery').slots.find(b=>b.slot.slot_id==='gallery_wall_03');
    assert.equal(core.resolveMedia(binding.anchor,binding.items).preserveAspectRatio,'xMidYMid meet');
    assert.equal(core.resolveMedia({...binding.anchor,fit:'cover'},binding.items).preserveAspectRatio,'xMidYMid slice');
    assert.equal(core.resolveMedia({...binding.anchor,fit:undefined},binding.items).preserveAspectRatio,'xMidYMid meet');
});
test('resolveMedia is defensive against missing anchors, items or content',()=>{
    assert.equal(core.resolveMedia(null,[]),null);
    assert.equal(core.resolveMedia(undefined,[{content:{image:'/x.jpg'}}]),null);
    assert.equal(core.resolveMedia({inline_content:true},[]),null);
    assert.equal(core.resolveMedia({inline_content:true},[{content:{}}]),null);
    assert.equal(core.resolveMedia({inline_content:false},[{content:{image:'/x.jpg'}}]),null);
    assert.equal(core.resolveMedia({inline_content:'false'},[{content:{image:'/x.jpg'}}]),null);
});
test('multi-item slots resolve only the lowest sort_order item\'s image, matching existing collection anchors (no carousel)',()=>{
    const d=copy();
    const anchor=d.anchors.find(a=>a.slot_id==='gallery_wall_01');
    anchor.inline_content=true; // exercised only in this isolated copy; the real data leaves it false (see audit test above)
    d.content.push(
        {content_id:'test-multi-a',content_type:'detail',image:'/assets/img/editorial/test-a.jpg'},
        {content_id:'test-multi-b',content_type:'detail',image:'/assets/img/editorial/test-b.jpg'}
    );
    d.placements=d.placements.filter(p=>p.slot_id!=='gallery_wall_01');
    d.placements.push(
        {placement_id:'test-multi-1',slot_id:'gallery_wall_01',content_id:'test-multi-b',content_type:'detail',sort_order:2,published:'true'},
        {placement_id:'test-multi-2',slot_id:'gallery_wall_01',content_id:'test-multi-a',content_type:'detail',sort_order:1,published:'true'}
    );
    const binding=core.resolve(d,'gallery').slots.find(b=>b.slot.slot_id==='gallery_wall_01');
    assert.equal(binding.items.length,2);
    assert.equal(core.resolveMedia(binding.anchor,binding.items).image,'/assets/img/editorial/test-a.jpg');
});
test('shuffle preserves records and avoids an initially solved distinct sequence',()=>{
    const events=[{id:'a',sortKey:-100},{id:'b',sortKey:10},{id:'c',sortKey:20}];
    const before=JSON.stringify(events);
    for(const random of [()=>0,()=>.5,()=>.999]) {const shuffled=core.shuffle(events,random);assert.deepEqual(shuffled.map(e=>e.id).sort(),['a','b','c']);assert.equal(core.checkTimeline(shuffled).correct,false);}
    assert.equal(JSON.stringify(events),before);
    assert.equal(core.checkTimeline([]).correct,false);
    assert.equal(core.checkTimeline([{sortKey:'unknown'}]).correct,false);
});
