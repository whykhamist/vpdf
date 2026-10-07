# Password and loading

## Status UI

`VPdfStatus` shows loading, error, and unsupported messages (`role="status"` / `alert`). Password uses the shared modal (`role="dialog"`, focus trap, Escape, backdrop).

## Password flow

Encrypted files set `loadState` to `'password'` and fill `state.password`:

```ts
state.password.submit(secret);
state.password.cancel();
```

`reason` is `'need'` or `'incorrect'`. The built-in form retries until PDF.js accepts the password or the user cancels.

Pass an initial password through `options.password` or `controller.load(src, password)`.

The password modal preempts plugin modals.

## Progress

`state.progress` is `{ loaded, total }` from PDF.js. Plugins can subscribe with `ctx.on('onProgress', …)`.

## Errors

On failure, `loadState` is `'error'` and `state.error` has `{ code, message, cause? }`. The viewer emits `error`.

Pure XFA with `features.xfa: false` uses `loadState: 'unsupported'` and code `XFA_UNSUPPORTED` after the document is attached, not as a pre-load rejection.
