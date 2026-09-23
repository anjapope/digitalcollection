/* Pure editorial resolver. Used by the browser and the focused Node tests. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ArchIvoryPlacementCore = api;
})(typeof window === 'object' ? window : this, function () {
    'use strict';
    const enabled = value => value === true || value === 'true';
    const canonicalRoom = id => id === 'art' ? 'conservation_lab' : id;
    const validSortKey = value => value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value));
    const FIT_PRESERVE_ASPECT_RATIO = { contain: 'xMidYMid meet', cover: 'xMidYMid slice' };
    // Single source of truth for "should this resolved slot show an inline image, and which one?"
    // Reused by both the legacy-artwork and mount-based rendering paths in room-placement.js.
    function resolveMedia(anchor, items) {
        if (!anchor || !enabled(anchor.inline_content) || !Array.isArray(items) || !items.length) return null;
        const image = items[0].content && items[0].content.image;
        if (typeof image !== 'string' || !image.trim()) return null;
        const presentation = ['flat', 'mounted', 'soft-edge'].includes(anchor.media_presentation) ? anchor.media_presentation : 'mounted';
        return { image, preserveAspectRatio: FIT_PRESERVE_ASPECT_RATIO[anchor.fit] || FIT_PRESERVE_ASPECT_RATIO.contain, presentation };
    }
    const validGeometry = anchor => anchor && (anchor.component_mount ? typeof anchor.selector==='string' && anchor.selector.length>0 : anchor.coordinate_system?.width > 0 && anchor.coordinate_system?.height > 0 && Array.isArray(anchor.polygon) && anchor.polygon.length >= 3 && anchor.polygon.every(p => Array.isArray(p) && p.length===2 && p.every(Number.isFinite)) && anchor.content_bounds && ['x','y','width','height'].every(key=>Number.isFinite(anchor.content_bounds[key])) && anchor.content_bounds.width>0 && anchor.content_bounds.height>0);
    function index(rows, key, diagnostics) {
        const result = new Map();
        const duplicates = new Set();
        for (const row of rows || []) {
            const id = row[key];
            if (!id) diagnostics.push(`Missing ${key}`);
            else if (result.has(id)) { diagnostics.push(`Duplicate ${key}: ${id}`); duplicates.add(id); }
            else result.set(id, row);
        }
        duplicates.forEach(id => result.delete(id));
        return result;
    }
    function resolve(data, requestedRoom) {
        const diagnostics = [];
        const rooms = index(data.rooms, 'room_id', diagnostics);
        const slots = index(data.slots, 'slot_id', diagnostics);
        const placements = index(data.placements, 'placement_id', diagnostics);
        const contents = index(data.content, 'content_id', diagnostics);
        const timelines = index(data.timelines, 'timeline_id', diagnostics);
        const anchors = index(data.anchors, 'anchor_id', diagnostics);
        for (const event of data.events || []) {
            if (!timelines.has(event.timeline_id)) diagnostics.push(`Unknown timeline for event: ${event.id}`);
        }
        for (const timeline of timelines.values()) {
            if (!rooms.has(timeline.room_id)) diagnostics.push(`Unknown timeline room: ${timeline.timeline_id}`);
            const events=(data.events || []).filter(e=>e.timeline_id===timeline.timeline_id);
            index(events,'id',diagnostics);
            if(events.length<2 || events.some(e=>!validSortKey(e.sortKey))) diagnostics.push(`Invalid timeline events: ${timeline.timeline_id}`);
        }
        const supported = new Set(['detail', 'collection', 'timeline', 'tool', 'inline']);
        const roomId = canonicalRoom(requestedRoom);
        const room = rooms.get(roomId);
        const resolved = [];
        for (const slot of slots.values()) {
            if (!rooms.has(slot.room_id)) diagnostics.push(`Unknown room for ${slot.slot_id}`);
            const anchor = anchors.get(slot.anchor_id);
            if (!anchor || anchor.slot_id !== slot.slot_id || anchor.room_id !== slot.room_id) diagnostics.push(`Invalid anchor for ${slot.slot_id}`);
            else if (!validGeometry(anchor)) diagnostics.push(`Invalid geometry: ${slot.slot_id}`);
            else if (!supported.has(anchor.presentation_mode) || anchor.presentation_mode !== slot.slot_type) diagnostics.push(`Invalid presentation mode: ${slot.slot_id}`);
            if (!supported.has(slot.slot_type)) diagnostics.push(`Unsupported slot type: ${slot.slot_id}`);
            if (!Number.isInteger(Number(slot.capacity)) || Number(slot.capacity) < 1) diagnostics.push(`Invalid capacity: ${slot.slot_id}`);
        }
        const grouped = new Map();
        for (const placement of placements.values()) {
            const slot = slots.get(placement.slot_id);
            if (!slot) { diagnostics.push(`Unknown slot: ${placement.placement_id}`); continue; }
            const content = placement.content_type === 'timeline' ? timelines.get(placement.content_id) : contents.get(placement.content_id);
            if (!content) { diagnostics.push(`Unknown content: ${placement.placement_id}`); continue; }
            if (!supported.has(placement.content_type) || (placement.content_type !== slot.slot_type && slot.slot_type !== 'collection') || (slot.slot_type==='collection' && placement.content_type==='timeline')) {
                diagnostics.push(`Unsupported content type for ${placement.placement_id}`); continue;
            }
            if (placement.content_type !== 'timeline' && content.content_type !== placement.content_type) {
                diagnostics.push(`Content type mismatch: ${placement.placement_id}`); continue;
            }
            if (!Number.isFinite(Number(placement.sort_order))) { diagnostics.push(`Invalid sort order: ${placement.placement_id}`); continue; }
            if (!enabled(placement.published)) continue;
            if (!grouped.has(slot.slot_id)) grouped.set(slot.slot_id, []);
            grouped.get(slot.slot_id).push({ placement, content });
        }
        for (const [id, items] of grouped) {
            const slot = slots.get(id);
            const anchor = anchors.get(slot.anchor_id);
            items.sort((a, b) => Number(a.placement.sort_order) - Number(b.placement.sort_order));
            if (items.length > Number(slot.capacity)) { diagnostics.push(`Excess capacity: ${id}`); continue; }
            if (!room || !enabled(room.enabled) || slot.room_id !== roomId || !enabled(slot.enabled)) continue;
            if (!validGeometry(anchor) || anchor.slot_id !== id || anchor.room_id !== roomId || !supported.has(slot.slot_type) || !supported.has(anchor.presentation_mode) || anchor.presentation_mode !== slot.slot_type || !Number.isInteger(Number(slot.capacity)) || !(Number(slot.capacity) >= 1)) continue;
            resolved.push({ slot, anchor, items });
        }
        return { room, slots: resolved, diagnostics };
    }
    function checkTimeline(events) {
        if (!events.length || events.some(e => !validSortKey(e.sortKey))) return { correct: false, positions: [] };
        const expected = events.map(e => Number(e.sortKey)).sort((a, b) => a - b);
        const positions = events.map((e, i) => Number(e.sortKey) === expected[i]);
        return { correct: positions.every(Boolean), positions };
    }
    function shuffle(events, random = Math.random) {
        const shuffled = events.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // Start as an activity even when the random permutation happens to be solved.
        if (checkTimeline(shuffled).correct) {
            const last = shuffled.findIndex(e => Number(e.sortKey) !== Number(shuffled[0].sortKey));
            if (last > 0) [shuffled[0], shuffled[last]] = [shuffled[last], shuffled[0]];
        }
        return shuffled;
    }
    function scaleConfig(value) {
        if (!value || typeof value === 'object') return value || {};
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    }
    function timelineRange(events, config = {}) {
        const values = events.map(event => Number(event.sortKey)).filter(Number.isFinite);
        const configuredStart = Number(config.start_date);
        const configuredEnd = Number(config.end_date);
        const start = Number.isFinite(configuredStart) ? configuredStart : Math.min(...values);
        const end = Number.isFinite(configuredEnd) ? configuredEnd : Math.max(...values);
        return { start, end: end > start ? end : start + 1 };
    }
    function timelinePosition(value, config = {}, events = []) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) return null;
        const range = timelineRange(events, config);
        const scaleMode = config.scale_mode || 'linear';
        const options = scaleConfig(config.scale_config);
        const segments = Array.isArray(options.segments) ? options.segments
            .map(segment => ({ start: Number(segment.start), end: Number(segment.end), weight: Number(segment.weight) }))
            .filter(segment => Number.isFinite(segment.start) && Number.isFinite(segment.end) && segment.end > segment.start && Number.isFinite(segment.weight) && segment.weight > 0)
            .sort((a, b) => a.start - b.start) : [];
        if ((scaleMode === 'segmented' || scaleMode === 'guided') && segments.length) {
            const totalWeight = segments.reduce((total, segment) => total + segment.weight, 0);
            let priorWeight = 0;
            for (const segment of segments) {
                if (numericValue <= segment.end) {
                    const local = Math.max(0, Math.min(1, (numericValue - segment.start) / (segment.end - segment.start)));
                    return Math.max(0, Math.min(1, (priorWeight + local * segment.weight) / totalWeight));
                }
                priorWeight += segment.weight;
            }
            return 1;
        }
        return Math.max(0, Math.min(1, (numericValue - range.start) / (range.end - range.start)));
    }
    function timelinePositions(events, config = {}) {
        return events.map(event => ({ id: event.id, position: timelinePosition(event.sortKey, config, events) }));
    }
    return { enabled, canonicalRoom, validSortKey, resolve, checkTimeline, shuffle, resolveMedia, scaleConfig, timelineRange, timelinePosition, timelinePositions };
});
