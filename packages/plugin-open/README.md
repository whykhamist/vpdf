# @whykhamist/vpdf-plugin-open

Opt-in package. Register it to add a toolbar control that loads a local PDF through `controller.load`. Disable with `plugins.enabled['vpdf.open'] = false`.

```bash
npm install @whykhamist/vpdf-plugin-open @whykhamist/vpdf
```

```ts
import { createOpenPlugin } from '@whykhamist/vpdf-plugin-open'

const plugins = {
  plugins: [createOpenPlugin()],
}
```
