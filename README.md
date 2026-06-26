# RecipeHub — Backend API

Express REST API for the RecipeHub recipe sharing platform. Handles recipe CRUD, user management, favorites, reports, and Stripe payments.

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB + Mongoose |
| Auth | JWT validation via JWKS (Better Auth integration) |
| Payments | Stripe Checkout |

## Features

- **Recipes** — Full CRUD, pagination, category filter (`$in`), search (regex on name/cuisine/category), like toggle (email-based dedup), soft delete, featured toggle
- **Users** — List all (admin), block/unblock, profile update, stats
- **Favorites** — Add/remove/list per user, duplicate-protected, populated with recipe data
- **Reports** — Create (users), list/dismiss/remove-recipe (admin), 200-char note
- **Payments** — Stripe Checkout session creation (recipe purchase + premium), server-side verification, transaction list (admin)

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas connection string
- Stripe account (test mode)
- RecipeHub client running on `http://localhost:3000`

### Environment Variables

Create `.env` in the project root:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
CLIENT_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

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

Inserts 9 sample recipes into the database.

## API Routes

### Recipes — `/api/recipes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List recipes (pagination, categories, search) |
| GET | `/featured` | Public | Featured recipes |
| GET | `/popular` | Public | Top 3 most liked |
| GET | `/:id` | Public | Single recipe |
| POST | `/` | JWT | Create recipe (checks 2-recipe limit) |
| PATCH | `/:id` | JWT | Update own recipe |
| DELETE | `/:id` | JWT | Soft delete own recipe |
| PATCH | `/:id/like` | JWT | Toggle like |
| PATCH | `/:id/feature` | Admin | Toggle featured |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users |
| GET | `/stats` | JWT | User stats (recipe count, total likes, favorites) |
| PATCH | `/:id/block` | Admin | Block/unblock user |
| PATCH | `/profile` | JWT | Update name/image |

### Favorites — `/api/favorites`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | User's favorites |
| POST | `/` | JWT | Add favorite |
| DELETE | `/:recipeId` | JWT | Remove favorite |

### Reports — `/api/reports`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Report a recipe |
| GET | `/` | Admin | List all reports |
| PATCH | `/:id/dismiss` | Admin | Dismiss report |
| DELETE | `/:id/remove-recipe` | Admin | Delete reported recipe |

### Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-checkout-session` | JWT | Create Stripe session |
| GET | `/verify` | Public | Verify payment + save to DB |
| GET | `/purchased` | JWT | User's purchased recipes |
| GET | `/transactions` | Admin | All transactions |

## Auth Middleware

- **`verifyToken.js`** — Validates JWT via JWKS from `AUTH_URL/api/auth/jwks`. Sets `req.userId`.
- **`resolveUser.js`** — Enriches `req.user` with full DB data. Cookie-first, fallback to JWT.
- **`verifyAdmin.js`** — Checks `req.user.role === "admin"`.

## Project Structure

```
├── index.js                        # Express app entry
├── seed.js                         # Database seeder
├── config/db.js                    # MongoDB connection
├── models/                         # Mongoose schemas
├── controllers/                    # Route handlers
├── routes/                         # Express routers
├── middleware/                      # Auth middlewares
└── .env                            # Environment variables
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start production server |
| `node seed.js` | Seed sample data |
