# Zoom and gestures

Zoom is the built-in `vpdf.zoom` plugin.

`toolbar.zoom: false` hides the control and skips zoom gestures and shortcuts (the plugin checks `isToolbarFeatureEnabled`). `plugins.enabled['vpdf.zoom'] = false` deactivates the plugin so `setup` does not run.

## Limits

Scale is clamped to **0.25–8** (25%–800%).

The zoom menu lists Fit page, Fit width, Fit height, plus 25%–800% steps. `page-actual` and `auto` are valid `options.scale` / `controller.setScale()` values; they are not menu items.

## Gestures and shortcuts

| Input | Action |
| --- | --- |
| Ctrl/Cmd + mouse wheel | Zoom toward the pointer |
| Two-finger pinch | Zoom toward the pinch midpoint |
| Ctrl/Cmd + `+` or `=` | Zoom in |
| Ctrl/Cmd + `-` | Zoom out |
| Ctrl/Cmd + `0` | Reset to 100% |

Plain wheel and one-finger drag still scroll.

## Controller

```ts
controller.setScale(1.25);
controller.setScale("page-width");
controller.zoomIn();
controller.zoomOut();
```

`state.scale` is numeric. `state.scalePreset` holds the active fit value when zoom is not a raw number.
