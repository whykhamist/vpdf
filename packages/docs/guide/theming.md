# Theming

Styles are scoped under `.vpdf-root`. Core does not inject global Tailwind Preflight. The package ships a single light palette. Hosts add dark or sepia by setting CSS variables.

Override on `.vpdf-root`, or pass a class via Vue class fallthrough / `options.class`.

```css
.vpdf-root {
  --vpdf-primary: #2563eb;
  --vpdf-error: #dc2626;
  --vpdf-text: #334155;
  --vpdf-text-muted: #64748b;
  --vpdf-text-toned: #475569;
  --vpdf-text-dimmed: #94a3b8;
  --vpdf-text-highlighted: #0f172a;
  --vpdf-text-inverted: #ffffff;
  --vpdf-bg: #ffffff;
  --vpdf-bg-muted: #f8fafc;
  --vpdf-bg-elevated: #f1f5f9;
  --vpdf-bg-accented: #e2e8f0;
  --vpdf-bg-inverted: #0f172a;
  --vpdf-border: #e2e8f0;
  --vpdf-border-muted: #e2e8f0;
  --vpdf-border-accented: #cbd5e1;
  --vpdf-border-inverted: #0f172a;
  --vpdf-radius: 0.5rem;
}
```

Core does not cycle light/dark/auto. You choose the class.

## Semantic utilities

Tailwind v4 in the package uses prefix `vpdf:`. Component classes look like `vpdf:text-default`. The semantic names below are the unprefixed token names:

| Token | Utility | Purpose |
| --- | --- | --- |
| `--vpdf-text` | `text-default` | Body text |
| `--vpdf-text-muted` | `text-muted` | Secondary text |
| `--vpdf-bg` | `bg-default` | Shell background |
| `--vpdf-bg-elevated` | `bg-elevated` | Toolbar, sidebar, dialogs |
| `--vpdf-bg-muted` | `bg-muted` | Viewer canvas, hovers |
| `--vpdf-border` | `border-default` | Borders |
| `--vpdf-primary` | `text-primary` / `bg-primary` | Accent |
| `--vpdf-error` | `text-error` | Errors |

Dynamic layout variables: `--vpdf-page-gap`, `--vpdf-page-radius`, `--vpdf-thumb-cols`.

Text selection and search highlights:

| Token | Purpose | Default |
| --- | --- | --- |
| `--vpdf-text-selection-color` | PDF text `::selection` fill | `color-mix(in srgb, AccentColor, transparent 50%)` |
| `--vpdf-search-highlight-color` | Search match highlight | `rgb(180 0 170 / 0.25)` |
| `--vpdf-search-highlight-selected-color` | Active search match | `rgb(0 100 0 / 0.25)` |

Override them on `.vpdf-root`. Forced colors still make search highlights transparent and use the PDF.js highlight filters.

PDF.js editor UI is remapped to `--outline-color`, `--resizer-bg-color`, and `--editor-toolbar-*` from the same tokens.

## Forced colors

`@media (forced-colors: active)` remaps elevated background, text, and border to system button colors.

See [custom themes](/examples/custom-themes) for palette examples.
