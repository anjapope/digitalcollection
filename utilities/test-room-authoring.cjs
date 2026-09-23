const assert = require('node:assert/strict');
const test = require('node:test');
const core = require('../assets/js/room-authoring-core.js');
const system = { width: 100, height: 80 };
test('new access point IDs are stable and collision safe', () => {
    assert.equal(core.nextSlotId('gallery', 'detail', [{ slot_id: 'gallery_detail_01' }]), 'gallery_detail_02');
});
test('geometry moves and resizes within room boundaries and minimum size', () => {
    assert.deepEqual(core.normalizeBounds({ x: -10, y: 70, width: 3, height: 5 }, system), { x: 0, y: 64, width: 16, height: 16 });
    assert.deepEqual(core.polygonFor({ x: 1, y: 2, width: 3, height: 4 }), [[1,2],[4,2],[4,6],[1,6]]);
});
test('structure rejects bad geometry and deletion dependencies are visible', () => {
    const slots = [{ slot_id: 'gallery_detail_01', room_id: 'gallery', slot_type: 'detail', capacity: '1', anchor_id: 'a' }];
    const anchors = [{ anchor_id: 'a', slot_id: 'gallery_detail_01', room_id: 'gallery', coordinate_system: system, content_bounds: { x: -1, y: 0, width: 20, height: 20 }, component_mount: false }];
    assert.ok(core.validateStructure({ rooms: [{ room_id: 'gallery' }], slots, anchors }).length);
    assert.deepEqual(core.dependencies('gallery_detail_01', [{ placement_id: 'p', slot_id: 'gallery_detail_01', content_id: 'c', published: 'true' }]), [{ placement_id: 'p', content_id: 'c', published: 'true' }]);
});
