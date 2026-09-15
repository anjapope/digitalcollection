# Event examples

```js
window.addEventListener("archivory:timeline-state-change", e => console.log(e.detail));
window.addEventListener("archivory:open-map-state", e => console.log(e.detail.mapState));
window.addEventListener("archivory:open-question", e => console.log(e.detail));
```

External navigation:
```js
window.ArchIvoryTimeline.setStateById("2000-bc");
```
