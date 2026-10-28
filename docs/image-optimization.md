# Image Optimization with Sharp

## Overview

All images uploaded to the platform are automatically processed by **Sharp** before being sent to Cloudinary. The processing is centralized in a single reusable utility so any controller can opt in with one line of code.

The goal is to ensure that regardless of the original format (JPG, PNG, HEIC, etc.) or device (iPhone, DSLR, Android), what gets stored in Cloudinary is always a lightweight, web-optimized WebP file of at most ~500 KB.

---

## How It Works

### Entry point

`backend/utils/imageProcessor.js`

```js
const { processImageIfNeeded } = require('../utils/imageProcessor');
```

### Logic

```
incoming buffer
       │
       ▼
  read metadata (Sharp)
       │
       ├─ size < 300 KB  AND  width ≤ 1800 px?
       │         │
       │       YES → return original buffer unchanged
       │
       └─ NO → resize + convert
                  │
                  ▼
            WebP, quality 85
            max width 1800 px
            withoutEnlargement: true  (never upscale)
                  │
                  ▼
            return processed buffer
```

### Activation threshold

Processing is skipped if **both** conditions are true:

| Condition | Value |
|---|---|
| File size | < 300 KB |
| Width | ≤ 1800 px |

If **either** threshold is exceeded the image is processed.

### Output parameters

| Parameter | Value |
|---|---|
| Format | WebP |
| Quality | 85 |
| Max width | 1800 px |
| Upscaling | Disabled (`withoutEnlargement: true`) |

### Error handling

If Sharp cannot parse the buffer (SVG, PDF, corrupted file, unsupported codec) the function silently returns the original buffer. The upload continues without crashing.

---

## Files Changed

### New file

| File | Description |
|---|---|
| `backend/utils/imageProcessor.js` | Centralized Sharp utility |

### Modified controllers

| Controller | Upload points updated | Folders affected |
|---|---|---|
| `backend/controllers/postController.js` | 1 (loop over `req.files`) | `posts/` |
| `backend/controllers/userController.js` | 6 | `profile_pictures/`, `profile_headers/` (×2), `creative_covers/`, `company_logos/`, `institution_logos/` |
| `backend/controllers/authController.js` | 1 | `profile_pictures/` |
| `backend/controllers/offerController.js` | 2 | `company_logos/`, `educational_offers/` |
| `backend/controllers/adminController.js` | 8 | `blog_posts/` (×2), `posts/` (×2), `magazines/` (×2), `industry/` (×2) |

**Not modified** (non-image uploads, intentionally skipped):

| Controller | Folder | Reason |
|---|---|---|
| `userController.js` | `cvs/` | `resource_type: 'raw'` — PDF |
| `userController.js` | `portfolios/` | `resource_type: 'raw'` — PDF |
| `userController.js` | `user_documents/` | `resource_type: 'auto'` — mixed documents |

### Modified routes (multer limits)

| Route file | Old limit | New limit |
|---|---|---|
| `backend/routes/posts.js` | 2 MB | 10 MB |
| `backend/routes/users.js` | 5 MB | 10 MB |
| `backend/routes/auth.js` | 5 MB | 10 MB |

The input limit was raised to 10 MB to accept uncompressed photos from iPhones and DSLRs. Sharp reduces them before they reach Cloudinary.

### Bug fixed

`authController.js` was calling `cloudinary.uploader.upload(req.file.path, ...)` while the route uses `multer.memoryStorage()`, which never writes a file to disk and therefore produces no `.path`. The call was silently failing. It has been replaced with the standard `upload_stream` + buffer pattern used by all other controllers.

---

## Usage Pattern

### Standard pattern (single file — `req.file`)

```js
const { processImageIfNeeded } = require('../utils/imageProcessor');

// Inside an async controller function:
const buf = await processImageIfNeeded(req.file.buffer);

const result = await new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { folder: 'your_folder' },
    (error, result) => (result ? resolve(result) : reject(error))
  );
  streamifier.createReadStream(buf).pipe(stream);
});

const imageUrl = result.secure_url;
```

### Loop pattern (multiple files — `req.files`)

```js
const imageUrls = [];

for (const file of req.files) {
  const buf = await processImageIfNeeded(file.buffer);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'your_folder' },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    streamifier.createReadStream(buf).pipe(stream);
  });

  imageUrls.push(result.secure_url);
}
```

### Async streamUpload helper pattern (used in adminController)

When a reusable `streamUpload` helper is defined inside the controller, make it `async` and process the buffer inside it:

```js
const streamUpload = async (file) => {
  const buf = await processImageIfNeeded(file.buffer);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'your_folder' },
      (error, result) => (result ? resolve(result) : reject(error))
    );
    streamifier.createReadStream(buf).pipe(stream);
  });
};

// Call site stays the same:
const result = await streamUpload(file);
```

---

## Adding Optimization to a New Controller

1. **Import the utility** at the top of the controller file:

   ```js
   const { processImageIfNeeded } = require('../utils/imageProcessor');
   ```

2. **Process the buffer** before passing it to `streamifier`. The function is async so it must be awaited inside an `async` function:

   ```js
   const buf = await processImageIfNeeded(req.file.buffer);
   ```

3. **Use `buf` instead of `req.file.buffer`** in the `streamifier.createReadStream()` call.

4. **Do not apply** the utility to uploads with `resource_type: 'raw'` or `'auto'` — those are document uploads (PDF, etc.) that Sharp cannot process meaningfully.

5. **Check the multer limit** for the route. If it is below 10 MB, raise it so large mobile photos are not rejected before Sharp can optimize them.

---

## Dependencies

```json
"sharp": "^0.33.x"
```

Install:

```bash
cd backend && npm install sharp
```

Sharp uses native binaries via `libvips`. On deployment (EC2 / Docker) no additional system packages are needed — the npm package bundles prebuilt binaries for Linux x64, Linux ARM64, macOS, and Windows.

If you are building a Docker image based on a minimal Linux distro (Alpine), use the `sharp` install flag:

```bash
npm install --platform=linux --arch=x64 sharp
```

---

## Cloudinary Transformations Removed

`postController.js` previously applied Cloudinary-side transformations on every upload:

```js
transformation: [
  { width: 2560, height: 2560, crop: 'limit' },
  { quality: 'auto:good' },
  { fetch_format: 'auto' },
]
```

These are now unnecessary because Sharp handles resizing and format conversion before the file reaches Cloudinary. Removing them reduces Cloudinary processing time and eliminates a redundant second pass over each image.
