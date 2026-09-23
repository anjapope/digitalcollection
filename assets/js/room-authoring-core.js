/* Pure structural helpers shared by the local authoring bridge and focused tests. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ArchIvoryRoomAuthoring = api;
})(typeof window === 'object' ? window : this, function () {
    'use strict';
    const TYPES = new Set(['detail', 'collection', 'timeline', 'tool', 'inline']);
    const MINIMUM = 16;
    const number = value => Number.isFinite(Number(value));
    const round = value => Math.round(Number(value) * 1000) / 1000;
    function bounds(anchor) {
        const source = anchor.content_bounds || {};
        return ['x', 'y', 'width', 'height'].every(key => number(source[key]))
            ? { x: Number(source.x), y: Number(source.y), width: Number(source.width), height: Number(source.height) }
            : null;
    }
    function normalizeBounds(next, coordinateSystem, minimum = MINIMUM) {
        if (!coordinateSystem || !number(coordinateSystem.width) || !number(coordinateSystem.height)) throw new Error('A coordinate system is required.');
        const input = bounds({ content_bounds: next });
        if (!input || input.width <= 0 || input.height <= 0) throw new Error('Bounds must have positive numeric dimensions.');
        const width = Math.max(minimum, Math.min(input.width, Number(coordinateSystem.width)));
        const height = Math.max(minimum, Math.min(input.height, Number(coordinateSystem.height)));
        const x = Math.max(0, Math.min(input.x, Number(coordinateSystem.width) - width));
        const y = Math.max(0, Math.min(input.y, Number(coordinateSystem.height) - height));
        return { x: round(x), y: round(y), width: round(width), height: round(height) };
    }
    function polygonFor(rect) {
        return [[rect.x, rect.y], [rect.x + rect.width, rect.y], [rect.x + rect.width, rect.y + rect.height], [rect.x, rect.y + rect.height]];
    }
    function nextSlotId(roomId, type, slots) {
        const base = `${roomId}_${type}`.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
        let candidate, index = 1;
        const ids = new Set(slots.map(slot => slot.slot_id));
        do candidate = `${base}_${String(index++).padStart(2, '0')}`; while (ids.has(candidate));
        return candidate;
    }
    function validateStructure({ rooms = [], slots = [], anchors = [], placements = [] }) {
        const errors = [];
        const roomIds = new Set(rooms.map(room => room.room_id));
        const slotIds = new Set();
        const anchorIds = new Set();
        for (const slot of slots) {
            if (!slot.slot_id || slotIds.has(slot.slot_id)) errors.push(`Duplicate slot ID: ${slot.slot_id || '(blank)'}`);
            slotIds.add(slot.slot_id);
            if (!roomIds.has(slot.room_id)) errors.push(`Unknown room for ${slot.slot_id}`);
            if (!TYPES.has(slot.slot_type)) errors.push(`Unsupported type for ${slot.slot_id}`);
            if (!Number.isInteger(Number(slot.capacity)) || Number(slot.capacity) < 1) errors.push(`Invalid capacity for ${slot.slot_id}`);
        }
        for (const anchor of anchors) {
            if (!anchor.anchor_id || anchorIds.has(anchor.anchor_id)) errors.push(`Duplicate anchor ID: ${anchor.anchor_id || '(blank)'}`);
            anchorIds.add(anchor.anchor_id);
            const slot = slots.find(candidate => candidate.slot_id === anchor.slot_id);
            if (!slot || slot.room_id !== anchor.room_id) errors.push(`Anchor ${anchor.anchor_id} does not match a slot.`);
            if (!anchor.component_mount) {
                try { const rect = normalizeBounds(anchor.content_bounds, anchor.coordinate_system, 1); if (rect.width !== Number(anchor.content_bounds.width) || rect.height !== Number(anchor.content_bounds.height) || rect.x !== Number(anchor.content_bounds.x) || rect.y !== Number(anchor.content_bounds.y)) errors.push(`Anchor ${anchor.anchor_id} is outside its room.`); }
                catch (error) { errors.push(`Invalid geometry for ${anchor.anchor_id}`); }
            }
        }
        for (const placement of placements) if (!slotIds.has(placement.slot_id)) errors.push(`Placement ${placement.placement_id} references an unknown slot.`);
        return errors;
    }
    function dependencies(slotId, placements) {
        return placements.filter(placement => placement.slot_id === slotId).map(placement => ({
            placement_id: placement.placement_id, content_id: placement.content_id, published: placement.published
        }));
    }
    return { TYPES, MINIMUM, bounds, normalizeBounds, polygonFor, nextSlotId, validateStructure, dependencies };
});
