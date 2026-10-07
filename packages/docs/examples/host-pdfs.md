# Host PDFs

Pass a **URL source** for large files so PDF.js can fetch byte ranges and render pages before the whole PDF arrives:

```vue
<VPdfViewer src="/api/documents/report.pdf" />
```

```ts
await viewer.controller.load("/api/documents/report.pdf");
```

Viewer source types and `documentInit` are documented in [Sources](/guide/sources). The sections below cover HTTP range requests, CORS, and Laravel/S3 hosting.

## Server requirements

The PDF endpoint should:

- Support `GET` requests
- Support the `Range` request header
- Return `206 Partial Content` for valid range requests
- Return a correct `Content-Range` header
- Return `Accept-Ranges: bytes`
- Return the correct `Content-Length` for the response
- Return `Content-Type: application/pdf`

A typical range request:

```
GET /api/documents/report.pdf HTTP/1.1
Range: bytes=0-1023
```

Expected response:

```
HTTP/1.1 206 Partial Content
Accept-Ranges: bytes
Content-Range: bytes 0-1023/52428800
Content-Length: 1024
Content-Type: application/pdf
```

Range requests improve progressive loading. They do not guarantee that every PDF will render immediately; PDF.js may still need bytes from several parts of the file.

## Do not fetch into a Blob first

Avoid this for large PDFs if you want PDF.js to use range loading:

```ts
const response = await fetch("/api/documents/report.pdf");
const blob = await response.blob();

await viewer.controller.load(blob);
```

The `Blob` is already fully downloaded. PDF.js cannot use the original HTTP connection to request byte ranges. Pass the URL instead.

## Laravel

Laravel can stream a file, but a streamed response is not the same as HTTP range support. `response()->stream()` or `response()->streamDownload()` sends bytes incrementally; PDF.js still needs `Range` / `206 Partial Content`.

Prefer letting the web server or object storage handle range requests.

### Local files

If the PDFs are public, serve them as files:

```php
Route::get('/documents/{filename}', function (string $filename) {
    return response()->file(
        storage_path("app/public/pdfs/{$filename}"),
        [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline',
        ]
    );
});
```

```vue
<VPdfViewer src="/documents/report.pdf" />
```

Whether range requests work depends on the web server. In production, serving large static PDFs through Nginx, Apache, or object storage is usually better than routing every byte through PHP.

### S3 and object storage

If the store supports HTTP range requests, give the browser a URL to the object rather than downloading it through Laravel into a `Blob`.

```php
use Illuminate\Support\Facades\Storage;

public function pdfUrl(string $filename)
{
    return response()->json([
        'url' => Storage::disk('s3')->temporaryUrl(
            "pdfs/{$filename}",
            now()->addMinutes(10),
        ),
    ]);
}
```

```ts
const response = await fetch("/api/documents/report-url");
const { url } = await response.json();

await viewer.controller.load(url);
```

PDF.js then talks to the storage endpoint, which can honor byte-range requests.

A public object URL also works:

```vue
<VPdfViewer src="https://example-bucket.s3.amazonaws.com/pdfs/report.pdf" />
```

For private documents, use a temporary signed URL.

### API proxy

If the browser must go through Laravel (authorization checks), the proxy must preserve range semantics.

This pattern is a bad fit for large PDFs:

```php
$data = Storage::disk('s3')->get($path);

return response($data)
    ->header('Content-Type', 'application/pdf');
```

Laravel downloads the complete object first.

A range-aware proxy needs to:

1. Read the incoming `Range` header.
2. Request that byte range from the storage backend.
3. Return `206 Partial Content`.
4. Forward `Content-Range` and `Content-Length`.
5. Return the full document when no range was requested.

```php
$range = request()->header('Range');

// Determine the requested byte range,
// retrieve only that portion from storage,
// then return 206 Partial Content.

return response($data, 206)
    ->header('Content-Type', 'application/pdf')
    ->header('Accept-Ranges', 'bytes')
    ->header('Content-Range', "bytes {$start}-{$end}/{$size}")
    ->header('Content-Length', $length);
```

The exact implementation depends on the storage driver. For S3, redirecting to a temporary signed URL is usually simpler than a PHP byte-range proxy.

## CORS

If the PDF is on a different origin, the endpoint must allow the browser requests:

```
Access-Control-Allow-Origin: https://your-app.example.com
Access-Control-Expose-Headers: Accept-Ranges, Content-Length, Content-Range
```

Credentialed cross-origin requests need `Access-Control-Allow-Credentials: true` and a specific origin (not `*`). Custom headers must be listed in `Access-Control-Allow-Headers`. See [Sources](/guide/sources#authentication-and-custom-headers).

## Verify range requests

1. Open **Network**.
2. Load the PDF using a URL source.
3. Select the PDF request.
4. Check the request and response headers for `Range`, `Content-Range`, and `206 Partial Content`.

For a large PDF you may see multiple range requests as PDF.js loads the document and pages.
