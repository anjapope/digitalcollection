/* A separate instance per opening makes future side-by-side comparisons possible. */
(() => {
    'use strict';
    const core = window.ArchIvoryPlacementCore;
    const el = (tag, text, className) => {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    };
    function mount(host, config, records) {
        const events = records.filter(e => e.timeline_id === config.timeline_id);
        const valid = events.length > 1 && new Set(events.map(e => e.id)).size === events.length && events.every(e => core.validSortKey(e.sortKey));
        if (!valid) { host.append(el('p', 'This chronology is not available yet.')); return; }
        host.classList.add('room-chronology');
        host.append(el('p', `${config.roomName} · ${config.temporalScale}`, 'room-chronology-scale'));
        host.append(el('p', config.introduction));
        host.append(el('p', 'Arrange earliest to latest. Drag a handle, or use Earlier and Later. Events with equivalent dates may appear in either order; uncertain sequences are explained in the evidence.'));
        let order = core.shuffle(events);
        const list = el('ol');
        const status = el('p', '', 'room-chronology-status');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        let drag = null;
        let suppressClick = false;
        function move(id, delta) {
            const from = order.findIndex(e => e.id === id);
            const to = from + delta;
            if (to < 0 || to >= order.length) return;
            [order[from], order[to]] = [order[to], order[from]];
            render();
            [...list.querySelectorAll('li')][to].querySelector('[data-drag-handle]').focus();
            status.textContent = `${order[to].title} moved to position ${to + 1} of ${order.length}. Check the timeline again when ready.`;
        }
        function render() {
            list.replaceChildren();
            order.forEach((event, position) => {
                const row = el('li');
                row.dataset.eventId = event.id;
                const handle = el('button', '↕', 'room-chronology-handle');
                handle.type = 'button';
                handle.dataset.dragHandle = '';
                handle.setAttribute('aria-label', `Move ${event.title}; use arrow up or down`);
                handle.addEventListener('keydown', e => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); move(event.id, e.key === 'ArrowUp' ? -1 : 1); }
                });
                handle.addEventListener('pointerdown', e => {
                    if (e.button !== 0) return;
                    drag = { id: event.id, y: e.clientY, pointer: e.pointerId, handle };
                    handle.setPointerCapture(e.pointerId);
                    row.classList.add('is-dragging');
                });
                handle.addEventListener('pointerup', e => {
                    if (!drag) return;
                    const rows = [...list.children];
                    const closest = rows.reduce((best, candidate) => {
                        const rect = candidate.getBoundingClientRect();
                        const distance = Math.abs(e.clientY - (rect.top + rect.height / 2));
                        return distance < best.distance ? { row: candidate, distance } : best;
                    }, { row, distance: Infinity }).row;
                    const destination = rows.indexOf(closest);
                    const from = order.findIndex(item => item.id === drag.id);
                    suppressClick = Math.abs(e.clientY - drag.y) > 5;
                    drag = null;
                    if (destination !== from) move(event.id, destination - from);
                    else row.classList.remove('is-dragging');
                });
                handle.addEventListener('pointercancel', () => { drag = null; row.classList.remove('is-dragging'); });
                handle.addEventListener('click', e => { if (suppressClick) { e.preventDefault(); suppressClick = false; } });
                const copy = el('div', '', 'room-chronology-copy');
                copy.append(el('strong', event.title), el('span', event.displayedDate, 'room-chronology-date'), el('p', event.description));
                if (event.image && /^(\/|https:\/\/)/.test(event.image)) {
                    const img = el('img'); img.src = event.image; img.alt = event.title; copy.append(img);
                }
                const details = el('details');
                details.append(el('summary', 'Evidence and chronology'), el('p', event.extendedExplanation || event.description));
                if (event.citation) details.append(el('p', `Source: ${event.citation}`));
                copy.append(details);
                const controls = el('div', '', 'room-chronology-moves');
                for (const [label, delta] of [['Earlier', -1], ['Later', 1]]) {
                    const button = el('button', label);
                    button.type = 'button'; button.setAttribute('aria-label', `${label}: ${event.title}`);
                    button.disabled = position + delta < 0 || position + delta >= order.length;
                    button.addEventListener('click', () => move(event.id, delta));
                    controls.append(button);
                }
                row.append(handle, copy, controls); list.append(row);
            });
        }
        const check = el('button', 'Check Timeline'); check.type = 'button';
        check.addEventListener('click', () => {
            const result = core.checkTimeline(order);
            [...list.children].forEach((row, i) => {
                row.classList.toggle('is-correct', result.positions[i]);
                row.querySelector('.room-chronology-position')?.remove();
                row.append(el('span', result.positions[i] ? 'Correct position' : 'Reconsider this position', 'room-chronology-position'));
            });
            status.textContent = result.correct ? `Change the scale, change the history. ${config.successText}` : `${result.positions.filter(Boolean).length} of ${order.length} positions fit the chronology. Compare the displayed dates and evidence, then move events and check again. Equivalent dates can appear in either order.`;
            if (result.correct) window.dispatchEvent(new CustomEvent('archivory:chronology-complete', { detail: { timeline_id: config.timeline_id, room_id: config.room_id, temporalScale: config.temporalScale } }));
        });
        const retry = el('button', 'Shuffle and retry'); retry.type = 'button';
        retry.addEventListener('click', () => { order = core.shuffle(events); render(); status.textContent = 'Events reshuffled. Arrange the evidence again.'; });
        const actions = el('div', '', 'room-chronology-actions'); actions.append(check, retry);
        host.append(list, actions, status); render();
    }
    window.ArchIvoryChronology = { mount };
})();
