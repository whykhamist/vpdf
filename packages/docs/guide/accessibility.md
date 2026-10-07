# Accessibility

The default shell uses semantic roles and keyboard paths. Hosts should still give the viewer a labeled region and a bounded height.

## Roles

| Surface | Pattern |
| --- | --- |
| Toolbar | `role="toolbar"`; overflow is `menu` / `menuitem` |
| Sidebar | `tablist` / `tab` / `tabpanel` |
| Search | `role="search"` with live match counts |
| Modal | `role="dialog"`, `aria-modal`, focus trap, Escape, backdrop, restore focus |
| Status | `role="status"` or `alert` |
| Annotation tools | toolbars, listbox swatches, keyboard nav on highlight presets |

## Keyboard

Built-in shortcuts (paging, zoom, find) skip typing surfaces: input, select, textarea, contenteditable.

Plugin shortcuts use the same matcher. Set `when` on `registerShortcut` if a binding should only run in a specific state.

Toolbar controls use `--spacing-vpdf-control`. The theme token is `2.75rem`; `.vpdf-root` sets it to `2rem` for a compact shell (32px, below the 44px WCAG 2.1 AA touch-target guideline). Hosts that need larger targets can override `--spacing-vpdf-control` on `.vpdf-root`.

## Motion and contrast

`prefers-reduced-motion` disables viewer transitions and smooth jumps.

Forced-colors mode remaps viewer UI tokens to system colors.

Focus rings use a mix of `--vpdf-primary`. Do not remove outlines in host CSS without providing another visible focus style.
