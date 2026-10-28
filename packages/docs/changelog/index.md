# v3.0.1

Released on October 28, 2026

## ✏️ Changed

- The default `VPdfSelect` now opens a custom listbox.` v-model` and the default slots of `<option>` and `<optgroup>` remain supported, with their content also populating a visually hidden native `<select>`. The zoom control and the page-layout plugin's mode selector use this component. Styles targeting `.vpdf-field-control select` should now target `.vpdf-select-trigger`, and option row styles should target `.vpdf-select-option`. Hosts that replace the select UI slot are unaffected.

## 🐛 Bug Fixes

- Fixed select menu options displaying a white background in dark themes.
  - ([#10](https://github.com/whykhamist/vpdf/issues/10)) ([8905b02](https://github.com/whykhamist/vpdf/commit/8905b02140a67f139f008afadd6d57b9356e9840))
  - The select menu now respects the active theme's colors, improving text contrast and readability.
- Fixed free-draw highlight annotations connecting to previous strokes.
  - ([#11](https://github.com/whykhamist/vpdf/issues/11)) ([80049b1](https://github.com/whykhamist/vpdf/commit/80049b1280010ae61406467b838a26e9f4259684))
  - Each new drawing gesture now starts an independent annotation, including when drawing highlights across different PDF pages.
  - Fixed highlight color handling by passing `annotationEditorHighlightColors` to the PDF.js viewer using the existing presets: Yellow (`#FFFF98`), Green (`#53FFBC`), Blue (`#80EBFF`), Pink (`#FFCBE6`), and Red (`#FF4F5F`). This allows PDF.js to resolve the color names correctly when applying highlights.
