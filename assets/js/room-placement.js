/* Mount against each room's existing artwork container; never resize the room. */
(() => {
    'use strict';
    const script = document.querySelector('script[data-room-editorial]');
    if (!script) return;
    const core = window.ArchIvoryPlacementCore;
    const ns = 'http://www.w3.org/2000/svg';
    const legacyTriggers = new Map();
    const nativeWrappers = new Map();
    const element = (tag, text) => {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        return node;
    };
    const localUrl = path => path.startsWith('/') ? (script.dataset.baseurl || '') + path : path;
    function modal(title, opener = document.activeElement) {
        const dialog = element('dialog'); dialog.className = 'room-modal';
        const close = element('button', 'Close'); close.className = 'room-modal-close'; close.type = 'button';
        const heading = element('h2', title); heading.id = 'room-dialog-' + (++modal.count);
        dialog.setAttribute('aria-labelledby', heading.id);
        const body = element('div');
        close.addEventListener('click', () => dialog.close());
        dialog.addEventListener('cancel', e => { e.preventDefault(); e.stopPropagation(); dialog.close(); });
        dialog.addEventListener('keydown', e => { if (e.key === 'Escape') e.stopPropagation(); });
        dialog.addEventListener('close', () => { opener?.isConnected && opener.focus(); });
        // Closing requires an explicit button or Escape. A released drag never clicks through.
        const header=element('header'); header.className='room-modal-header'; header.append(heading,close);
        dialog.append(header, body); document.body.append(dialog);
        return { dialog, body };
    }
    modal.count = 0;
    function showLegacy(overlay, opener) {
        if (!overlay) return false;
        let wrapper = nativeWrappers.get(overlay);
        if (wrapper?.dialog.open) return true;
        if (!wrapper) {
            wrapper = modal(overlay.querySelector('h2,h3')?.textContent || 'Exhibit information', opener);
            wrapper.body.append(overlay);
            overlay.querySelectorAll('button[id$="-close"]').forEach(button => button.addEventListener('click', () => { overlay.hidden = true; }));
            overlay.querySelectorAll('[role="dialog"]').forEach(panel => { panel.removeAttribute('role'); panel.removeAttribute('aria-modal'); });
            wrapper.dialog.addEventListener('close', () => {
                overlay.hidden = true;
                if (![...nativeWrappers.values()].some(w => w.dialog.open)) document.body.classList.remove('welcome-sequence-open');
                if(wrapper.returnFocus?.isConnected) wrapper.returnFocus.focus();
            });
            nativeWrappers.set(overlay, wrapper);
        }
        wrapper.returnFocus = opener;
        overlay.hidden = false;
        if (!wrapper.dialog.open) wrapper.dialog.showModal();
        return true;
    }
    // Existing legacy close buttons and evidence-image listeners remain on their original nodes.
    document.querySelectorAll('.collection-sequence, #welcome-sequence').forEach(overlay => {
        new MutationObserver(() => {
            if (!overlay.hidden) showLegacy(overlay, document.activeElement);
            else nativeWrappers.get(overlay)?.dialog.close();
        }).observe(overlay, { attributes: true, attributeFilter: ['hidden'] });
    });
    const inquiry=document.getElementById('archivory-inquiry');
    if(inquiry) {
        let view;
        new MutationObserver(()=>{
            if(inquiry.getAttribute('aria-hidden')==='false') {
                if(!view) {
                    view=modal('Ivory Inquiry Terminal',document.activeElement);
                    view.dialog.classList.add('room-inquiry-dialog');
                    inquiry.removeAttribute('role'); inquiry.removeAttribute('aria-modal');
                    view.body.append(inquiry);
                    view.dialog.addEventListener('close',()=>window.ArchIvoryInquiry?.close());
                }
                if(!view.dialog.open) view.dialog.showModal();
            } else if(view?.dialog.open) view.dialog.close();
        }).observe(inquiry,{attributes:true,attributeFilter:['aria-hidden']});
    }
    fetch(script.dataset.roomEditorial).then(response => {
        if (!response.ok) throw new Error(`Editorial data: ${response.status}`);
        return response.json();
    }).then(data => {
        const requested = script.dataset.roomId;
        // Reuse the CollectionBuilder content record instead of duplicating its research.
        for(const object of data.objects || []) {
            const record=data.content.find(item=>item.content_id===object.objectid);
            if(record) { record.description=object.description || record.description; record.citation=object.source || record.citation; }
        }
        const resolved = core.resolve(data, requested);
        const development = script.dataset.development === 'true';
        if (development) resolved.diagnostics.forEach(message => console.warn('[ArchIvory editorial]', message));
        if (!resolved.room) return;
        const contentIndex = new Map(data.content.map(record => [record.content_id, record]));
        function openContent(record, opener) {
            const adapter = record.adapter || '';
            if (adapter.startsWith('route:')) { window.location.href = localUrl(adapter.slice(6)); return; }
            if (adapter.startsWith('trigger:')) {
                const selector = adapter.slice(8);
                const target = legacyTriggers.get(selector) || document.querySelector(selector);
                if (target) {
                    target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
                    document.querySelectorAll('.collection-sequence:not([hidden]), #welcome-sequence:not([hidden])').forEach(overlay => showLegacy(overlay, opener));
                }
                return;
            }
            if (adapter && showLegacy(document.getElementById(adapter), opener)) return;
            const view = modal(record.title, opener);
            view.body.append(element('p', record.description));
            if (record.image && /^(\/|https:\/\/)/.test(record.image)) {
                const image = element('img'); image.src = localUrl(record.image); image.alt = record.title;
                image.style.maxWidth = '100%'; view.body.append(image);
            }
            if (record.citation) view.body.append(element('p', 'Source: '+record.citation));
            const intro = contentIndex.get(resolved.room.room_id+'_intro');
            if (intro && intro.content_id !== record.content_id) { const details=element('details'); details.append(element('summary','About this room'),element('p',intro.description)); view.body.append(details); }
            view.dialog.addEventListener('close', () => view.dialog.remove(), { once:true });
            view.dialog.showModal();
        }
        function openSlot(binding, opener) {
            const { slot, items } = binding;
            if (slot.slot_type === 'timeline') {
                const record = items[0].content;
                const view = modal(slot.editor_label, opener);
                window.ArchIvoryChronology.mount(view.body, record, data.events);
                view.dialog.addEventListener('close', () => view.dialog.remove(), { once:true });
                view.dialog.showModal();
            } else if (slot.slot_type === 'collection') {
                const view = modal(slot.editor_label, opener);
                if (slot.display_description) view.body.append(element('p', slot.display_description));
                view.body.append(element('p', `${items.length} research record${items.length===1?'':'s'} available. Related research does not identify an illustrated object unless the evidence establishes the connection.`));
                const list = element('ul'); list.className = 'room-collection-list';
                items.forEach(({content}) => {
                    const row=element('li'); const button=element('button',content.title);
                    button.type='button'; button.addEventListener('click',()=>openContent(content,button)); row.append(button); list.append(row);
                });
                view.body.append(list);
                const intro = contentIndex.get(slot.room_id+'_intro');
                if (intro) { const details=element('details'); details.append(element('summary','About this room'),element('p',intro.description)); view.body.append(details); }
                view.dialog.addEventListener('close', () => view.dialog.remove(), {once:true}); view.dialog.showModal();
            } else openContent(items[0].content, opener);
        }
        const layers = new Map();
        const debug = development && new URLSearchParams(location.search).get('anchors') === '1';
        // Empty, disabled or invalid placements must not leave a legacy control active.
        const activeSlots=new Set(resolved.slots.map(binding=>binding.slot.slot_id));
        for(const anchor of data.anchors.filter(a=>a.room_id===resolved.room.room_id && a.selector && !activeSlots.has(a.slot_id))) {
            const old=document.querySelector(anchor.selector);
            if(!old) continue;
            const inert=old.cloneNode(true); old.replaceWith(inert);
            inert.removeAttribute('href'); inert.removeAttributeNS('http://www.w3.org/1999/xlink','href');
            inert.removeAttribute('tabindex'); inert.removeAttribute('role'); inert.setAttribute('aria-hidden','true');
            inert.style.pointerEvents='none';
            if(inert.ownerSVGElement) inert.replaceChildren();
            if(inert.tagName==='BUTTON') inert.disabled=true;
        }
        for (const binding of resolved.slots) {
            const { slot, anchor, items } = binding;
            let trigger = anchor.selector && document.querySelector(anchor.selector);
            if (trigger) {
                if (!legacyTriggers.has(anchor.selector)) legacyTriggers.set(anchor.selector, trigger);
                const clone = trigger.cloneNode(true);
                trigger.replaceWith(clone); trigger = clone;
                // Div furnishings have no legacy behavior. Leave them visible as authored.
                trigger.removeAttribute('aria-hidden');
                trigger.setAttribute('tabindex','0'); trigger.setAttribute('role','button');
                const svg=trigger.ownerSVGElement;
                if(svg) {
                    const box=svg.viewBox.baseVal;
                    const points=anchor.polygon.map(([x,y])=>[x*box.width/anchor.coordinate_system.width,y*box.height/anchor.coordinate_system.height]);
                    trigger.replaceChildren();
                    const polygon=document.createElementNS(ns,'polygon'); polygon.classList.add('room-placement-target');
                    polygon.setAttribute('points',points.map(p=>p.join(',')).join(' ')); trigger.append(polygon);
                    trigger.classList.add('room-existing-target');
                    const legacyMedia = core.resolveMedia(anchor, items);
                    if(legacyMedia) {
                        const b=anchor.content_bounds;
                        const image=document.createElementNS(ns,'image'); image.setAttribute('x',b.x*box.width/anchor.coordinate_system.width); image.setAttribute('y',b.y*box.height/anchor.coordinate_system.height);
                        image.setAttribute('width',b.width*box.width/anchor.coordinate_system.width); image.setAttribute('height',b.height*box.height/anchor.coordinate_system.height);
                        image.setAttribute('href',localUrl(legacyMedia.image)); image.setAttribute('preserveAspectRatio',legacyMedia.preserveAspectRatio); image.style.pointerEvents='none';
                        // A missing/broken asset must not leave a broken-image glyph over the room artwork.
                        image.addEventListener('error', () => { if(development) console.warn('[ArchIvory editorial] Media failed to load',slot.slot_id,legacyMedia.image); image.remove(); }, { once:true });
                        trigger.prepend(image);
                    }
                    if(slot.slot_id==='natural_history_inquiry_01') {
                        const text=document.createElementNS(ns,'text'); text.setAttribute('x','700'); text.setAttribute('y','716'); text.setAttribute('text-anchor','middle'); text.setAttribute('font-size','12'); text.setAttribute('fill','#51402b'); text.textContent='Ask a question'; text.style.pointerEvents='none'; trigger.prepend(text);
                    }
                }
            } else if (anchor.component_mount) continue;
            else {
                const mount = document.querySelector(anchor.mount);
                if (!mount) { if(development) console.warn('[ArchIvory editorial] Missing mount',slot.slot_id); continue; }
                if (!layers.has(anchor.mount)) {
                    const layer = document.createElementNS(ns,'svg');
                    layer.classList.add('room-placement-layer');
                    if (debug) layer.classList.add('room-placement-debug');
                    layer.setAttribute('viewBox',`0 0 ${anchor.coordinate_system.width} ${anchor.coordinate_system.height}`);
                    layer.setAttribute('preserveAspectRatio','none'); layer.setAttribute('aria-label',resolved.room.editor_label+' exhibits');
                    layer.style.zIndex=anchor.layer; mount.append(layer); layers.set(anchor.mount,layer);
                }
                trigger = document.createElementNS(ns,'a'); trigger.setAttribute('role','button'); trigger.setAttribute('tabindex','0');
                const polygon = document.createElementNS(ns,'polygon'); polygon.setAttribute('points',anchor.polygon.map(p=>p.join(',')).join(' ')); polygon.classList.add('room-placement-target');
                const bounds = anchor.content_bounds;
                const media = core.resolveMedia(anchor, items);
                if (media) {
                    const image = document.createElementNS(ns,'image');
                    for (const [key,value] of Object.entries(bounds)) image.setAttribute(key,value);
                    image.setAttribute('href',localUrl(media.image)); image.setAttribute('preserveAspectRatio',media.preserveAspectRatio);
                    // A missing/broken asset must not leave a broken-image glyph over the room artwork.
                    image.addEventListener('error', () => { if(development) console.warn('[ArchIvory editorial] Media failed to load',slot.slot_id,media.image); image.remove(); }, { once:true });
                    trigger.append(image);
                }
                // The lower central panel is already a recessed furnishing in Natural History.
                if (slot.slot_id === 'natural_history_timeline_02') {
                    const title=document.createElementNS(ns,'text'); title.setAttribute('x',bounds.x+bounds.width/2); title.setAttribute('y',bounds.y+bounds.height/2); title.setAttribute('text-anchor','middle'); title.setAttribute('fill','#51402b'); title.setAttribute('font-size','16'); title.setAttribute('font-family','Georgia,serif'); title.textContent='Arrange the evidence'; trigger.append(title);
                }
                trigger.append(polygon); layers.get(anchor.mount).append(trigger);
                if(slot.slot_id==='natural_history_specimen_01_label') {
                    const text=document.createElementNS(ns,'text'); text.setAttribute('x','700'); text.setAttribute('y','677'); text.setAttribute('text-anchor','middle'); text.setAttribute('font-size','12'); text.setAttribute('fill','#51402b'); text.textContent='Specimen'; trigger.prepend(text);
                }
                if(debug) { const text=document.createElementNS(ns,'text'); text.setAttribute('x',bounds.x); text.setAttribute('y',bounds.y); text.textContent=slot.slot_id; layers.get(anchor.mount).append(text); }
            }
            // A swapped placement must not award evidence for the former object.
            if (trigger.dataset.notebookId && !items.some(item => item.content.content_id === trigger.dataset.notebookId)) {
                [...trigger.attributes].filter(attribute => attribute.name.startsWith('data-notebook-')).forEach(attribute => trigger.removeAttribute(attribute.name));
            }
            trigger.dataset.slotId=slot.slot_id;
            trigger.setAttribute('aria-label',slot.editor_label);
            trigger.setAttribute('aria-haspopup','dialog');
            const activate = event => { event.preventDefault(); openSlot(binding,trigger); };
            trigger.addEventListener('click',activate);
            trigger.addEventListener('keydown',event=> { if(event.key==='Enter'||event.key===' ') activate(event); });
        }
        // Development outlines include empty furnishings; never ship debug UI in production.
        if(debug) for(const anchor of data.anchors.filter(a=>a.room_id===resolved.room.room_id&&!a.component_mount)) {
            const mount=document.querySelector(anchor.mount); if(!mount) continue;
            const svg=document.createElementNS(ns,'svg'); svg.classList.add('room-placement-layer','room-placement-debug');
            svg.setAttribute('viewBox',`0 0 ${anchor.coordinate_system.width} ${anchor.coordinate_system.height}`); svg.setAttribute('preserveAspectRatio','none'); svg.setAttribute('aria-hidden','true');
            const p=document.createElementNS(ns,'polygon'); p.setAttribute('points',anchor.polygon.map(point=>point.join(',')).join(' ')); p.classList.add('room-placement-target');
            const label=document.createElementNS(ns,'text'); label.setAttribute('x',anchor.content_bounds.x); label.setAttribute('y',anchor.content_bounds.y); label.textContent=anchor.slot_id; svg.append(p,label); mount.append(svg);
        }
    }).catch(error => { if(script.dataset.development==='true') console.warn('[ArchIvory editorial]',error); });
})();
