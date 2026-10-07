---
layout: home
hero:
  name: vpdf
  text: Vue 3 PDF viewer on PDF.js
  tagline: Viewer core, plugin hosts, and opt-in packages. @whykhamist/vpdf and extension packages are 3.0.0, pinned to pdfjs-dist 6.3.289.
  image:
    src: /favicon.svg
    alt: VPdf
  actions:
    - theme: brand
      text: Get started
      link: /guide/installation
    - theme: alt
      text: Quick start
      link: /guide/quick-start
    - theme: alt
      text: Plugin API
      link: /plugins/overview
features:
  - icon: 📄
    title: Viewer core
    details: URL, File, Blob, and binary sources; lazy page rendering; password flow; text layer; outline, thumbnails, and attachments.
  - icon: 🧩
    title: Plugin hosts
    details: Toolbar placements, sidebar panels, viewer regions, page overlays, shortcuts, a viewer-scoped modal, and icon/XFA hooks.
  - icon: 🎛️
    title: Built-in controls
    details: Navigation, zoom, rotate, search, annotations, download, sidebar, and document properties register as built-in plugins you can disable or replace.
  - icon: 📦
    title: Opt-in packages
    details: Open, print, page layout, Iconify, and XFA thumbnail raster live in separate packages so the core stays small.
  - icon: 🎨
    title: Theming
    details: Scoped Tailwind v4 tokens under .vpdf-root. Override --vpdf-* variables or pass a class on the viewer.
  - icon: 🛡️
    title: Safe defaults
    details: PDF scripting is off. External links open in a new tab with noopener noreferrer nofollow. Legacy PDF.js workers keep older browsers working.
---
