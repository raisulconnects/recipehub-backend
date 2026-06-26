# RecipeHub — Backend API

Express REST API that powers the RecipeHub recipe sharing platform. Handles recipe management, user administration, favorites, content reporting, and Stripe payments. Integrates with Better Auth (running on the Next.js client) for JWT-based authentication.

The backend is designed as a modular Express application following standard MVC patterns — Mongoose models define the schemas, controllers contain business logic, and Express routers expose RESTful endpoints.

## Purpose

The API serves as the data and business logic layer for RecipeHub. It handles:

- **Persistence** — All recipes, users, favorites, reports, and payments stored in MongoDB
- **Authorization** — Route-level guards using JWT verification (for authenticated actions) and role checks (for admin-only actions)
- **Payments** — Stripe Checkout session creation and server-side payment verification
- **Content Moderation** — Reporting system with admin tools to dismiss reports or remove violating content
- **Community Features** — Like toggling with email-based deduplication, favorites collection per user

## Tech Stack

| Layer | Choice | Role |
|---|---|---|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express | HTTP server, routing, middleware |
| Database | MongoDB + Mongoose | Document storage, schemas, population |
| Auth | JWKS-based JWT verification | `jose-cjs` verifies tokens issued by client-side Better Auth |
| Payments | Stripe SDK | Checkout session creation and verification |
| Dev | Nodemon | Auto-restart on file changes |

## Features

### Recipe Management
- **Full CRUD** — Create, read, update, soft-delete recipes
- **Server-side Pagination** — `page`, `limit` query params; response includes `data`, `total`, `page`, `totalPages`
- **Category Filter** — Comma-separated `categories` param using MongoDB `$in`
- **Search** — Case-insensitive regex across `recipeName`, `cuisineType`, and `category`
- **Like Toggle** — Email-based deduplication via `likedBy` array; increments/decrements `likesCount`
- **Featured Toggle** — Admin-only endpoint to mark/unmark recipes as featured
- **Author Scoping** — Users can only update or delete their own recipes (authorEmail match)
- **Upload Limit** — Free users capped at 2 recipes; premium users have no limit
- **Soft Delete** — Sets status to `"deleted"`; public queries filter out deleted recipes

### User Management
- **Admin Listing** — All users with role, blocked status, premium status
- **Block/Unblock** — Toggle `isBlocked`; blocked users are rejected by `resolveUser` middleware at the middleware level
- **Profile Update** — Authenticated users can update their name and image
- **Stats Endpoint** — Returns recipe count, total likes received, and favorite count per user

### Favorites
- **Email-Scoped** — Each user's favorites keyed by email
- **Duplicate-Protected** — Checks for existing entry before adding
- **Populated Response** — Returns full recipe data via Mongoose `populate("recipeId")`

### Reports
- **Reason Enum** — Spam, Offensive Content, Copyright Issue
- **Note Field** — Optional text up to 200 characters
- **Admin Moderation** — Dismiss (mark as dismissed) or Remove Recipe (hard-delete the recipe and dismiss the report)

### Payments (Stripe)
- **Recipe Purchase** — $2.99 one-time; saves to payments collection with recipeId
- **Premium Membership** — $9.99 one-time; saves to payments + sets `user.isPremium = true`
- **Server-Side Verification** — Retrieves Stripe session, checks `payment_status === "paid"`, idempotency check via `transactionId`
- **Customer Email** — Session created with `customer_email` set to the user's email
- **Metadata** — Stores `userId`, `userEmail`, `type`, and `recipeId` on Stripe sessions for verification

## Authentication Flow

The backend does not issue its own tokens. Authentication is a three-layer system:

```
FE (Next.js)                     Backend (Express)
────────────                     ────────────────
Better Auth creates              verifyToken.js
session + JWT                    ───────────────
│  Signs JWT with private key     Reads Authorization: Bearer <jwt>
│  Stores session in MongoDB      Fetches JWKS from AUTH_URL/api/auth/jwks
│  Sets HTTPOnly cookie           Verifies JWT signature via jose-cjs
         │                        Sets req.userId = payload.sub
         ▼
                              resolveUser.js
                              ─────────────
                               Reads cookie → session token
                                OR fallback to req.userId
                               Queries MongoDB for full user
                               Sets req.user with name, email, role, isPremium
```

- **verifyToken** — Required on all write routes (POST, PATCH, DELETE). Returns 401 if missing or invalid JWT.
- **resolveUser** — Enriches `req.user` with the full user document. Cookie-first, JWT fallback. Never blocks — silently passes if no user found (controllers handle missing user gracefully).
- **verifyAdmin** — Applied after `resolveUser`, checks `req.user.role === "admin"`. Returns 403 if not admin.

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas connection string (shared with the client — both use the same database)
- Stripe account (test mode)
- RecipeHub client running on `http://localhost:3000` (provides the JWKS endpoint for token verification)

### Environment Variables

Create `.env` in the project root:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/recipehub
CLIENT_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
STRIPE_SECRET_KEY=sk_test_xxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

**Variable Details:**

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No (default 5000) | Server port |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CLIENT_URL` | Yes | CORS origin — must match the client URL |
| `AUTH_URL` | Yes | Client URL where JWKS endpoint lives (for JWT verification) |
| `BETTER_AUTH_SECRET` | Yes | Must match the client's `BETTER_AUTH_SECRET` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (starts with `sk_test_` in dev) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret (for webhook verification) |

### Install & Run

```bash
npm install
npm run dev
```

Server starts at [http://localhost:5000](http://localhost:5000).

### Seed Data

```bash
node seed.js
```

Inserts 9 sample recipes across 3 authors and multiple cuisines into the database. Recipes are owned by three users (Sophia Carter, Ayaan Malik, Nadia Rahman) with varying likes.

## API Routes

### Recipes — `/api/recipes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Paginated recipe list. Query: `page`, `limit`, `categories` (comma-sep), `search`, `authorEmail`, `showAll` |
| GET | `/featured` | Public | All featured recipes |
| GET | `/popular` | Public | Top 3 most liked recipes |
| GET | `/:id` | Public | Single recipe by ID (404 if deleted) |
| POST | `/` | JWT | Create recipe (enforces 2-recipe limit for free users) |
| PATCH | `/:id` | JWT | Update own recipe (authorEmail match required) |
| DELETE | `/:id` | JWT | Soft delete own recipe (sets `status: "deleted"`) |
| PATCH | `/:id/like` | JWT | Toggle like (adds/removes email from `likedBy` array) |
| PATCH | `/:id/feature` | Admin | Toggle `isFeatured` flag |

**Query Parameters for `GET /`:**

```
page=1          (default: 1)
limit=10        (default: 10)
categories=Dinner,Lunch   (comma-separated, uses $in)
search=pasta    (regex matches recipeName, cuisineType, category)
authorEmail=user@example.com
showAll=true    (includes non-active recipes; admin use)
```

**Response shape:**
```json
{
  "data": [{ "recipeName": "...", ... }],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users (excludes password field) |
| GET | `/stats` | JWT | User stats: recipe count, total likes, favorite count |
| PATCH | `/:id/block` | Admin | Toggle `isBlocked` on a user |
| PATCH | `/profile` | JWT | Update own name and/or image |

### Favorites — `/api/favorites`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | List current user's favorites (populated with full recipe data) |
| POST | `/` | JWT | Add recipe to favorites. Body: `{ recipeId }`. Duplicate check applied |
| DELETE | `/:recipeId` | JWT | Remove recipe from favorites |

### Reports — `/api/reports`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Create report. Body: `{ recipeId, reason, note }`. Reason must be one of: Spam, Offensive Content, Copyright Issue |
| GET | `/` | Admin | List all reports (populated with recipe data) |
| PATCH | `/:id/dismiss` | Admin | Set report status to `"dismissed"` |
| DELETE | `/:id/remove-recipe` | Admin | Hard-delete the reported recipe and mark report as dismissed |

### Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-checkout-session` | JWT | Create Stripe Checkout session. Body: `{ type, recipeId }`. Type: `"recipe"` ($2.99) or `"premium"` ($9.99) |
| GET | `/verify` | Public | Verify payment by session_id query param. Creates Payment record. Sets `isPremium` for premium purchases |
| GET | `/purchased` | JWT | List current user's purchased recipes (populated) |
| GET | `/transactions` | Admin | List all payment transactions |

## Key Business Logic

### Recipe Upload Limit

```js
const recipeCount = await Recipe.countDocuments({ authorEmail: req.user.email });
if (recipeCount >= 2 && !req.user.isPremium)
  return res.status(403).json({ message: "Upgrade to premium to add more recipes" });
```

### Like Toggle (No Double Likes)

The `likedBy` array stores user emails. Toggling checks for existing entries:

```js
const alreadyLiked = recipe.likedBy.includes(req.user.email);
if (alreadyLiked) {
  recipe.likedBy.pull(req.user.email);
  recipe.likesCount -= 1;
} else {
  recipe.likedBy.push(req.user.email);
  recipe.likesCount += 1;
}
```

### Payment Idempotency

The verify endpoint checks for existing Payments with the same `transactionId` before creating a new one. This prevents double-crediting if the user hits the verify endpoint multiple times.

```js
const existing = await Payment.findOne({ transactionId: session_id });
if (existing) return res.json({ message: "Payment already verified" });
```

## Middleware

| Middleware | File | Applied To | Behavior |
|---|---|---|---|
| **verifyToken** | `middleware/verifyToken.js` | All write routes, admin routes | Reads JWT from `Authorization` header, verifies via JWKS from client, sets `req.userId` |
| **resolveUser** | `middleware/resolveUser.js` | Routes needing `req.user` | Cookie-first lookup in MongoDB session collection, fallback to `req.userId`, sets full `req.user` |
| **verifyAdmin** | `middleware/verifyAdmin.js` | Admin-only routes | Checks `req.user.role === "admin"`, returns 403 if not |

## Project Structure

```
├── index.js                        # Express app — middleware, route mounting, server start
├── seed.js                         # Database seeder — 9 sample recipes
│
├── config/
│   └── db.js                       # MongoDB connection via Mongoose
│
├── models/
│   ├── User.js                     # Mongoose schema for user collection
│   ├── Recipe.js                   # Recipe schema with all fields + timestamps
│   ├── Favorite.js                 # User + recipeId mapping
│   ├── Report.js                   # Recipe report with reason + note
│   └── Payment.js                  # Stripe payment record
│
├── controllers/
│   ├── recipe.controller.js        # getAll, getById, create, update, remove, toggleLike, toggleFeature, getFeatured, getPopular
│   ├── user.controller.js          # getAll, toggleBlock, updateProfile, getStats
│   ├── favorite.controller.js      # getAll, add, remove
│   ├── report.controller.js        # create, getAll, dismiss, removeRecipe
│   └── payment.controller.js       # createCheckoutSession, verify, getPurchased, getTransactions
│
├── routes/
│   ├── recipe.routes.js            # All /api/recipes endpoints
│   ├── user.routes.js              # All /api/users endpoints
│   ├── favorite.routes.js          # All /api/favorites endpoints
│   ├── report.routes.js            # All /api/reports endpoints
│   └── payment.routes.js           # All /api/payments endpoints
│
├── middleware/
│   ├── verifyToken.js              # JWT verification via JWKS
│   ├── resolveUser.js              # User enrichment from cookie/JWT
│   └── verifyAdmin.js              # Admin role check
│
└── .env                            # Environment variables
```

## Database

All collections are stored in a single MongoDB database. The `user` and `session` collections are managed by Better Auth (running on the client). The backend reads from the same `user` collection for user enrichment and writes to it for premium status updates.

| Collection | Managed By | Purpose |
|---|---|---|
| `user` | Better Auth + Backend | User profiles, role, isBlocked, isPremium |
| `session` | Better Auth | Auth sessions (read-only by backend via resolveUser) |
| `recipes` | Backend | All recipe data |
| `favorites` | Backend | User-recipe favorite mappings |
| `reports` | Backend | Content reports |
| `payments` | Backend | Stripe payment records |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with nodemon (auto-restart on changes) |
| `npm start` | Start production server |
| `node seed.js` | Seed 9 sample recipes into the database |

## Design Decisions

| Decision | Rationale |
|---|---|
| JWKS verification over shared secret | Backend fetches public keys from the client's `.well-known/jwks` endpoint — no shared secret to rotate |
| Cookie-first user resolution | Preserves Better Auth session cookies as primary auth mechanism; JWT is the fallback for API calls that can't send cookies |
| `resolveUser` never blocks | If auth resolution fails, the request still passes through — controllers handle missing users gracefully. This prevents accidentally breaking public endpoints |
| Soft delete for recipes | Recipes are marked `status: "deleted"` instead of being removed. Admin hard-delete is available via the report moderation flow |
| Metadata on Stripe sessions | User identity is embedded in Stripe session metadata so the verify endpoint can identify the user without needing auth headers (important for Stripe redirect flows) |
