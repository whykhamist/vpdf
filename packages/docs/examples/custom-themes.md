# Custom themes

Add a class to `<VPdfViewer>` and override the `--vpdf-*` variables you need.

<CustomThemesDemo />

```vue
<VPdfViewer class="vpdf-dark" :src="src" :options="options" />
```

The live demo wraps the viewer in `DocsViewer`, which also applies `vpdf-auto`. Host apps only need the theme class they define.

For example, this palette changes the main surfaces and text colors:

```css
.vpdf-dark {
  --vpdf-primary: #a8b1ff;
  --vpdf-error: #f87171;
  --vpdf-text: rgba(255, 255, 255, 0.87);
  --vpdf-text-muted: rgba(235, 235, 245, 0.6);
  --vpdf-text-toned: rgba(235, 235, 245, 0.75);
  --vpdf-text-dimmed: rgba(235, 235, 245, 0.38);
  --vpdf-text-inverted: #1e1e20;
  --vpdf-text-highlighted: #a8b1ff;
  --vpdf-bg: #1e1e20;
  --vpdf-bg-muted: #18181a;
  --vpdf-bg-elevated: #252529;
  --vpdf-bg-accented: #2a2a2f;
  --vpdf-bg-inverted: #ffffff;
  --vpdf-border: #3c3c3f;
  --vpdf-border-muted: #2e2e32;
  --vpdf-border-accented: #4c5190;
  --vpdf-border-inverted: #e2e2e3;
}
```

The demo includes more palettes, but applications only need to define the themes they use. See [Theming](/guide/theming) for the token reference and forced-color behavior.
