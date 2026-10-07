# Plugin state

Three different “state” objects show up in plugins. They are not interchangeable.

| Name | What it is | Lifetime |
| --- | --- | --- |
| [`VPdfViewerState`](/guide/types#vpdfviewerstate) (`ctx.state`) | Viewer state: page, scale, load, sidebar, … | Viewer instance |
| `definition.options` / `setup` `options` | Your factory config | Definition |
| Plugin state bag | `createState` / `getPluginState` / `setPluginState` | Registry entry (survives disable) |

## Viewer state vs plugin state

`ctx.state` is the viewer. Use it to **read** page count, `loadState`, attachments, and so on. Change the viewer through `ctx.controller`.

The plugin state bag is **yours**. Use it for marks, layout mode, caches, or anything that should not live on [`VPdfViewerState`](/guide/types#vpdfviewerstate).

The bag is a plain value on the registry entry. It is **not** a Vue `ref`. Replacing it with `setPluginState` does not by itself re-render a panel. Keep Vue `ref` / `computed` in `setup` for UI, and write snapshots into the bag when you care about surviving disable/re-enable.

## `createState`

Runs **once** at `register()`, with `definition.options`. It does not run again on `setEnabled(true)`.

```ts
createState: (options) => ({
  count: 0,
  color: options?.color ?? "#2563eb",
}),
```

Omit `createState` if you do not need a bag. `getPluginState()` then returns `undefined` until you `setPluginState`.

## `getPluginState` / `setPluginState`

```ts
export function CounterPlugin(): VPdfPluginDefinition<
  undefined,
  { count: number }
> {
  return {
    id: "counter",
    name: "Counter",
    createState: () => ({ count: 0 }),
    setup(ctx) {
      ctx.registerToolbarItem({
        id: "bump",
        label: "Count",
        onClick() {
          const current = ctx.getPluginState<{ count: number }>();
          ctx.setPluginState({ count: (current?.count ?? 0) + 1 });
        },
      });
    },
  };
}
```

`setPluginState` **replaces** the bag. It does not merge:

```ts
ctx.setPluginState({ count: 1 });
// { count: 1, color: "#2563eb" } from createState is gone unless you spread it
```

## Reactive UI

Drive components with Vue refs, and persist:

```ts
setup(ctx) {
  const marks = ref(ctx.getPluginState<{ marks: number }>()?.marks ?? 0);

  const bump = () => {
    marks.value += 1;
    ctx.setPluginState({ marks: marks.value });
  };

  ctx.registerPanel({
    id: "demo",
    label: "Demo",
    component: DemoPanel,
    props: computed(() => ({ marks: marks.value, onBump: bump })),
  });
}
```

On re-enable, `setup` runs again. Read the bag to restore `marks` as above. `createState` will not reset that count unless you `setPluginState` back to the initial value yourself.

The page-layout extension stores `{ mode }` this way and reapplies it on `onReady`.

## What belongs where

| Put it in... | When |
| --- | --- |
| Viewer state / controller | Page, zoom, sidebar, search, annotations — already modeled |
| Plugin `options` | Fixed factory config (`dpi`, `defaultMode`, `editorComponent`) |
| Vue refs in `setup` | UI that must update while the plugin is active |
| Plugin state bag | Values you want after disable/re-enable, or to inspect from a custom shell via the registry |

There is no public `PluginManager.getPluginState(id)` helper. Another plugin cannot read your bag through context. Share data with `ctx.emit`, viewer state, or a callback in `options`.
