# Deploying the Backend (Express API) to Vercel

This folder is a self-contained repository. Push it on its own:

```bash
cd little-bird-tour-travels-backend
git init
git add .
git commit -m "Initial backend"
git branch -M main
git remote add origin <YOUR_BACKEND_REPO_URL>
git push -u origin main
```

`node_modules/` and `.env` are git-ignored — only `.env.example` is committed.

## Vercel setup

1. **Vercel → Add New → Project → import this repo.**
2. Framework preset: **Other** (the included `vercel.json` routes every request to `index.js`, which exports a serverless handler).
3. Add **Environment Variables** (Project → Settings → Environment Variables) — values come from `.env.example`:

| Variable | Value |
|---|---|
| `MONGODB_URI` | your MongoDB Atlas SRV string |
| `DB_NAME` | `littlebird` |
| `JWT_SECRET` | a long random string |
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | your deployed **frontend** URL, e.g. `https://little-bird-client.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from Cloudinary |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | for the seed script |

4. **Deploy.** Health check: `https://<your-backend>.vercel.app/` → `{"message":"API running successfully!"}`.

## Seed the production database (once)

Run locally against the production DB:

```bash
MONGODB_URI="<prod-uri>" DB_NAME=littlebird npm run seed
```

## Notes
- `NODE_ENV=production` makes the auth cookie `secure` + `sameSite=none` (required for HTTPS).
- `CORS_ORIGINS` is comma-separated; add every frontend origin that calls the API.
- The frontend calls the API same-origin via Next.js rewrites, so the cookie stays first-party.
