# @whykhamist/vpdf-plugin-print

Opt-in package. Register it to add a print toolbar control. It opens a print window synchronously, renders each PDF page with PDF.js `intent: 'print'` (including annotation storage), then calls `print()` after every page is ready. Disable with `plugins.enabled['vpdf.print'] = false`.

```bash
npm install @whykhamist/vpdf-plugin-print @whykhamist/vpdf
```

```ts
import { createPrintPlugin } from '@whykhamist/vpdf-plugin-print'

const plugins = {
  plugins: [createPrintPlugin({ dpi: 150 })],
}
```
