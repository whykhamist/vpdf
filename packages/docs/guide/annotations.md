# Annotations

Native PDF.js editors: highlight, free text, ink, stamp. Core themes the editor UI; PDF.js still owns resize handles, undo, and persistence.

Enable with `features.annotations` and `toolbar.annotations` (defaults true). Built-in id: `vpdf.annotations`.

## Tools

Highlight, free text, and draw use Firefox-style toolbar dropdowns. Selecting an annotation keeps that tool’s dropdown open. A Vue toolbar is teleported into PDF.js `.editToolbar` for the selected annotation.

| Tool | Toolbar dropdown | Inline editor |
| --- | --- | --- |
| Highlight | preset colors, thickness | same presets, delete |
| Free text | color picker, size | color picker, delete |
| Draw (ink) | color picker, thickness, opacity | color picker, delete |
| Stamp | — | delete |

Highlight presets: Yellow (`#FFFF98`), Green (`#53FFBC`), Blue (`#80EBFF`), Pink (`#FFCBE6`), Red (`#FF4F5F`). Free text and draw use native color inputs.

Delete uses the `editorDelete` icon slot (Lucide `trash-2` with the Iconify plugin).

## Modes

[`VPdfAnnotationEditorMode`](/guide/types#vpdfannotationeditormode):

```ts
type VPdfAnnotationEditorMode =
  | "none"
  | "freetext"
  | "highlight"
  | "ink"
  | "stamp";

controller.setAnnotationEditorMode("highlight");
controller.updateAnnotationEditor({ color: "#FFFF98", thickness: 8 });
controller.deleteSelectedAnnotation();
```

Initial mode: `options.annotationEditorMode`.

`updateAnnotationEditor({ color })` accepts any CSS color. The highlight toolbar only lists the presets above.

## Custom inline editor

Pass a component implementing [`VPdfAnnotationEditorProps`](/guide/types#vpdfannotationeditorprops) to `VpdfAnnotationsPlugin({ editorComponent })`. It replaces the built-in plugin because both use the `vpdf.annotations` id. See the [custom annotation editor example](/examples/custom-editor).

## Persistence

Core does not invent annotation storage. Subscribe with `plugins.on('onAnnotationChange', …)` on the template ref or headless API, or `ctx.on('onAnnotationChange', …)` inside a plugin (see [VPdfViewer events](/guide/viewer#annotation-and-password-plugin-event-bus)), and persist with your backend, or call `controller.saveModified()` to export a PDF through PDF.js `saveDocument`. `saveModified` also triggers a browser download; see [Download and save](/guide/download).

Not supported in core: arbitrary annotation JSON import/export, comment/popup authoring beyond these editors, cryptographic signatures, XFA editing.
