# Backend — Express API spine

Layered Express. Request flow: `app.js → middleware → routes → controller → (lib/config) → errorHandler`.

## Run

```bash
npm install
cp .env.example .env   # then fill in values
npm run dev            # nodemon on http://localhost:5000
```

Health check: `GET http://localhost:5000/` → `{ "message": "API running successfully!" }`
Example resource: `GET http://localhost:5000/api/examples`

## Add a new resource (e.g. "products")

1. `controllers/productController.js` — copy `exampleController.js`, rename the collection + handlers.
2. `routes/product.routes.js` — copy `example.routes.js`, map paths to the new controller.
3. Register it in `routes/index.js`: `router.use("/", require("./product.routes"))`.

That's the whole loop. Guards (`verifyJWT`, `verifyAdmin`/`verifyRole(...)`) come from `middlewares/auth.js`.

## Folders

| Folder | Holds |
|---|---|
| `config/` | the single DB connection (`connectDB` + `getDB`) |
| `middlewares/` | auth/role guards + the 404 & error handler |
| `routes/` | path → guard → controller wiring (one line per endpoint) |
| `controllers/` | request handlers — most logic lives here |
| `lib/` | reusable services/integrations (email, stripe, firebase) |
| `utils/` | tiny pure helpers (`asyncHandler`, `ApiError`) |
| `seed/` | one-off DB seeding scripts |
