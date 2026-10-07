# Search

Search requires `features.search` and `toolbar.search` (both default true) and the built-in `vpdf.search` plugin.

The plugin registers a toolbar toggle, a `viewer-top` find bar, and Ctrl/Cmd+F.

## Find options

[`VPdfFindOptions`](/guide/types#vpdffindoptions) via `controller.find()`:

```ts
controller.find({
  query: "trace",
  caseSensitive: false,
  entireWord: false,
  highlightAll: true,
  findPrevious: false,
});
controller.findNext();
controller.findPrevious();
controller.clearFind();
```

Default flags at start: `highlightAll: true`, `caseSensitive: false`, `entireWord: false`.

## Search state

[`VPdfSearchState`](/guide/types#vpdfsearchstate) fields:

| Field | Meaning |
| --- | --- |
| `query` | Current string |
| `matchCount` / `currentMatch` | Totals |
| `caseSensitive` / `entireWord` / `highlightAll` | Flags |
| `findPrevious` | Direction |
| `status` | `idle \| pending \| found \| not-found \| wrapped` |

The find bar uses `role="search"` and a live region for match counts. Keep `features.textLayer` enabled so highlights appear.

Disable with `toolbar.search: false`, `features.search: false`, or `plugins.enabled['vpdf.search'] = false`. The last option deactivates the plugin; the flags only hide UI and skip the find engine.
