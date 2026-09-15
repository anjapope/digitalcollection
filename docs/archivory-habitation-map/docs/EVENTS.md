# Habitation Map event contracts

Listens for:
- `archivory:open-map-state`
- `archivory:timeline-state-change`

Emits:
- `archivory:habitation-map-state-change`
- `archivory:map-mode-change`
- `archivory:habitation-map-close`

Public API:
```js
window.ArchIvoryHabitationMap.open("miocene-range");
window.ArchIvoryHabitationMap.setState("east-africa-ivory-1850");
window.ArchIvoryHabitationMap.setMode("evidence");
window.ArchIvoryHabitationMap.close();
```
