# @whykhamist/vpdf-plugin-page-layout

Opt-in package. It adds a toolbar dropdown that maps onto PDF.js `scrollMode` / `spreadMode`.

```bash
npm install @whykhamist/vpdf-plugin-page-layout @whykhamist/vpdf
```

Migration: import from `@whykhamist/vpdf-plugin-page-layout` instead of the core package.

| Mode | Behavior |
| --- | --- |
| `vertical` | Single column, top to bottom (default) |
| `single-page` | One page at a time, with a full-document vertical scrollbar |
| `horizontal` | Pages in a horizontal strip |
| `two-column` | Two pages side by side, paired 1–2, 3–4, … |
| `wrapped` | As many pages per row as the current scale and viewport width allow |

```ts
import { createPageLayoutPlugin } from '@whykhamist/vpdf-plugin-page-layout'

const plugins = {
  plugins: [createPageLayoutPlugin()],
}
```

PDF.js resets layout when a document loads, so the plugin reapplies the last selection on `onReady` and restores vertical layout when it is disabled.
