# blog_user_vite

The blog frontend as a plain **React + Vite SPA** (converted from the Next.js
app in `../blog_user`). It builds to static files in `dist/`, so it drops onto
S3/CloudFront with no server and no dynamic-route gymnastics.

## Scripts

```bash
npm install        # once
npm run dev        # local dev server (http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # serve the built dist/ locally
```

## Project layout

- `main.tsx` — entry; mounts the provider stack + router (was `app/layout.tsx`).
- `router.tsx` — all routes (replaces Next file-based routing).
- `layouts/` — public / auth / private layouts (were the route-group layouts).
- `pages/` — one file per screen (were the `page.tsx` files).
- `components/`, `lib/`, `hooks/`, `src/` — copied verbatim from the Next app.
- `lib/next-compat.tsx` — shim so copied code can still import `Link`,
  `useRouter`, `usePathname`, `useParams` without rewrites.

The `@/*` import alias points at the project root (same as the Next app), so
copied imports resolve unchanged.

## Environment variables

Vite only exposes `VITE_*` vars to the browser, and they're **baked in at build
time** (no runtime env on S3). Set them in:

- `.env` — local dev
- `.env.production` — used by `npm run build` / the deploy

These values are **public** — never put secrets there.

## Deploying to S3 + CloudFront

1. Put your real production URLs in `.env.production`.
2. Create a private S3 bucket and a CloudFront distribution in front of it
   (Origin Access Control, default root object `index.html`).
3. **SPA fallback** — in CloudFront → **Error pages**, add two custom error
   responses so client-side routes work on refresh/deep-link:
   - HTTP `403` → response page `/index.html`, response code `200`
   - HTTP `404` → response page `/index.html`, response code `200`

   That's all the routing config a Vite SPA needs — no rewrite function.
4. Deploy:

   ```bash
   S3_BUCKET=your-bucket CLOUDFRONT_DISTRIBUTION_ID=E123ABC ./infra/deploy.sh
   ```

> Your backend must be public + HTTPS, and its CORS must allow the CloudFront
> domain, or the deployed site can't reach the API / Reverb.
