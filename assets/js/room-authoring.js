/* Local visual authoring overlay. It is inert unless ?author=1 is present. */
(() => {
    'use strict';
    if (new URLSearchParams(location.search).get('author') !== '1') return;
    const script = document.querySelector('script[data-room-editorial]');
    const core = window.ArchIvoryRoomAuthoring;
    if (!script || !core) return;
    const bridge = 'http://127.0.0.1:3000/api/authoring';
    const el = (tag, text) => { const node = document.createElement(tag); if (text) node.textContent = text; return node; };
    let model, selected, dirty = false, dragging;
    const setDirty = value => { dirty = value; status.textContent = value ? 'Unsaved changes' : 'Saved'; save.disabled = !value; };
    const panel = el('aside'); panel.className = 'room-authoring-panel'; panel.setAttribute('aria-label', 'Room authoring');
    const title = el('h2', 'Room authoring');
    const roomSelect = el('select'); roomSelect.setAttribute('aria-label', 'Select room');
    const typeSelect = el('select'); typeSelect.setAttribute('aria-label', 'New access point type');
    for (const type of core.TYPES) { const option = el('option', type); option.value = type; typeSelect.append(option); }
    const status = el('p', 'Loading local authoring bridge…'); status.className = 'room-authoring-status';
    const add = el('button', 'Add access point'); add.type = 'button';
    const save = el('button', 'Save geometry'); save.type = 'button'; save.disabled = true;
    const preview = el('button', 'Preview visitor room'); preview.type = 'button';
    const details = el('div'); details.className = 'room-authoring-details';
    panel.append(title, roomSelect, typeSelect, status, add, save, preview, details); document.body.append(panel);
    const roomId = () => script.dataset.roomId === 'art' ? 'conservation_lab' : script.dataset.roomId;
    function currentAnchors() { return model.anchors.filter(anchor => anchor.room_id === roomId() && !anchor.component_mount); }
    function draw() {
        document.querySelectorAll('.room-authoring-layer').forEach(node => node.remove());
        for (const anchor of currentAnchors()) {
            const mount = document.querySelector(anchor.mount); if (!mount) continue;
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('room-placement-layer', 'room-authoring-layer'); svg.setAttribute('viewBox', `0 0 ${anchor.coordinate_system.width} ${anchor.coordinate_system.height}`); svg.setAttribute('preserveAspectRatio', 'none');
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); const box = anchor.content_bounds;
            rect.setAttribute('x', box.x); rect.setAttribute('y', box.y); rect.setAttribute('width', box.width); rect.setAttribute('height', box.height); rect.dataset.anchorId = anchor.anchor_id; rect.classList.add('room-authoring-target');
            if (selected === anchor.anchor_id) rect.classList.add('is-selected');
            rect.setAttribute('tabindex', '0'); rect.setAttribute('role', 'button'); rect.setAttribute('aria-label', `${model.slots.find(slot => slot.slot_id === anchor.slot_id)?.editor_label || anchor.slot_id}, ${anchor.slot_id}`);
            const choose = event => { event.preventDefault(); selected = anchor.anchor_id; inspect(); draw(); };
            rect.addEventListener('click', choose); rect.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') choose(event); });
            rect.addEventListener('pointerdown', event => { if (event.button !== 0) return; dragging = { anchor, startX: event.clientX, startY: event.clientY, box: { ...box }, mount: mount.getBoundingClientRect(), mode: event.shiftKey ? 'resize' : 'move' }; if (event.isTrusted) rect.setPointerCapture(event.pointerId); });
            rect.addEventListener('pointermove', event => {
                if (!dragging || dragging.anchor !== anchor) return;
                const dx = (event.clientX - dragging.startX) * anchor.coordinate_system.width / dragging.mount.width;
                const dy = (event.clientY - dragging.startY) * anchor.coordinate_system.height / dragging.mount.height;
                const proposed = dragging.mode === 'resize' ? { ...dragging.box, width: dragging.box.width + dx, height: dragging.box.height + dy } : { ...dragging.box, x: dragging.box.x + dx, y: dragging.box.y + dy };
                anchor.content_bounds = core.normalizeBounds(proposed, anchor.coordinate_system, dragging.mode === 'resize' ? core.MINIMUM : 1); anchor.polygon = core.polygonFor(anchor.content_bounds); setDirty(true); draw(); inspect();
            });
            svg.append(rect); mount.append(svg);
        }
    }
    function inspect() {
        details.replaceChildren();
        const anchor = model?.anchors.find(item => item.anchor_id === selected); if (!anchor) return;
        const slot = model.slots.find(item => item.slot_id === anchor.slot_id);
        const heading = el('h3', slot.editor_label); const id = el('p', `ID: ${slot.slot_id} · ${slot.slot_type} · capacity ${slot.capacity}`);
        const input = el('input'); input.value = slot.editor_label; input.setAttribute('aria-label', 'Access point label');
        input.addEventListener('input', () => { slot.editor_label = input.value; setDirty(true); heading.textContent = slot.editor_label; });
        const note = el('p', `x ${anchor.content_bounds.x}, y ${anchor.content_bounds.y}, width ${anchor.content_bounds.width}, height ${anchor.content_bounds.height}. Drag to move; Shift+drag to resize.`);
        const remove = el('button', 'Remove unused access point'); remove.type = 'button';
        remove.addEventListener('click', () => {
            const used = core.dependencies(slot.slot_id, model.placements);
            if (used.length) { status.textContent = `Cannot remove ${slot.slot_id}: used by ${used.map(item => item.placement_id).join(', ')}.`; return; }
            model.slots = model.slots.filter(item => item !== slot); model.anchors = model.anchors.filter(item => item !== anchor); selected = null; setDirty(true); inspect(); draw();
        });
        details.append(heading, id, input, note, remove);
    }
    function addPoint() {
        const type = typeSelect.value;
        const reference = currentAnchors()[0]; if (!reference) { status.textContent = 'This room has no editable coordinate mount.'; return; }
        const slotId = core.nextSlotId(roomId(), type, model.slots);
        const bounds = core.normalizeBounds({ x: reference.coordinate_system.width * .45, y: reference.coordinate_system.height * .45, width: 120, height: 80 }, reference.coordinate_system);
        const anchorId = `${slotId}_anchor`;
        model.slots.push({ slot_id: slotId, room_id: roomId(), zone_id: 'authoring', editor_label: 'New access point', slot_type: type, capacity: '1', anchor_id: anchorId, enabled: 'true', notes: 'Prepared by visual room authoring.', display_description: '' });
        model.anchors.push({ anchor_id: anchorId, slot_id: slotId, room_id: roomId(), background_asset: model.rooms.find(room => room.room_id === roomId()).background_asset, background_version: reference.background_version, coordinate_system: reference.coordinate_system, mount: reference.mount, polygon: core.polygonFor(bounds), content_bounds: bounds, label_bounds: null, layer: reference.layer, presentation_mode: type, selector: '', fit: 'contain', inline_content: false, component_mount: false });
        selected = anchorId; setDirty(true); inspect(); draw();
    }
    add.addEventListener('click', addPoint);
    save.addEventListener('click', async () => {
        const errors = core.validateStructure(model); if (errors.length) { status.textContent = errors.join(' '); return; }
        status.textContent = 'Saving…';
        try { const response = await fetch(`${bridge}/structure`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slots: model.slots, anchors: model.anchors }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Save failed.'); setDirty(false); status.textContent = 'Saved. Regenerate the workbook, then reload to preview.'; }
        catch (error) { status.textContent = `Save failed: ${error.message}`; }
    });
    preview.addEventListener('click', () => { if (dirty) { status.textContent = 'Save or discard changes before previewing.'; return; } location.href = location.pathname; });
    roomSelect.addEventListener('change', () => { if (dirty && !window.confirm('Discard unsaved geometry changes?')) { roomSelect.value = roomId(); return; } const room = model.rooms.find(item => item.room_id === roomSelect.value); location.href = `${room.route}?author=1`; });
    fetch(`${bridge}/structure`).then(response => { if (!response.ok) throw new Error(`bridge returned ${response.status}`); return response.json(); }).then(data => {
        model = data; for (const room of model.rooms.filter(item => item.enabled === 'true')) { const option = el('option', room.editor_label); option.value = room.room_id; option.selected = room.room_id === roomId(); roomSelect.append(option); }
        status.textContent = 'Saved geometry'; draw();
    }).catch(error => { status.textContent = `Local authoring bridge unavailable: ${error.message}`; add.disabled = save.disabled = true; });
})();
