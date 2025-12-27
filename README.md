# MatinaCloset

A full‑stack e‑commerce web app for selling clothing, antiperspirants, and gummies.

Stack
- Frontend: HTML, Bootstrap 5, Vanilla JS
- Backend: Node.js + Express
- DB/ORM: SQLite (default) with Sequelize (MySQL compatible)
- Auth: JWT (bcrypt hashed passwords)
- Payments: Stripe Checkout (optional in dev; simulated if no key)

Quick start
1) Copy environment file
```
cp .env.example .env
```

2) Install dependencies
```
npm install
```

3) Seed database (creates admin and sample products)
```
npm run seed
```

4) Start the server
```
# Dev with auto-restart
npm run dev
# or production
npm start
```

App will be available at http://localhost:4000

Default admin
- Email: admin@matinacloset.com (configurable via .env)
- Password: Admin123! (configurable via .env)

Environment variables (.env)
- PORT=4000
- DATABASE_URL=sqlite:./server/data/matinacloset.sqlite
- JWT_SECRET=your_secret
- STRIPE_SECRET_KEY=sk_test_xxx (optional; leave empty to simulate payments)
- STRIPE_WEBHOOK_SECRET=whsec_xxx (required if using webhooks)
- CLIENT_URL=http://localhost:4000
- ADMIN_EMAIL=admin@matinacloset.com
- ADMIN_PASSWORD=Admin123!

Stripe (optional)
- If STRIPE_SECRET_KEY is set, checkout will redirect to Stripe.
- Configure a webhook to http://localhost:4000/api/webhooks/stripe with STRIPE_WEBHOOK_SECRET to auto‑mark orders paid and clear the cart.
- Without Stripe keys, the app simulates payment success immediately for development.

Folder structure
- server/
  - server.js (Express app)
  - models/ (Sequelize models and associations)
  - routes/ (auth, products, reviews, cart, orders, admin)
  - middleware/ (auth)
  - seed/ (seed script)
- client/
  - index.html (catalog with filters/search)
  - product.html (details, add to cart, reviews)
  - cart.html (cart, update/remove, total)
  - checkout.html (collects customer details, starts checkout)
  - account.html (order history)
  - admin/ (overview, products CRUD, orders, categories)
  - assets/js (api, app session helpers, cart utils, ui helpers)
  - assets/css (styles)

Key endpoints
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- Products: GET /api/products, GET /api/products/:id, GET /api/products/:id/reviews, GET /api/products/filters/categories
- Reviews: POST /api/reviews/:productId (auth required)
- Cart: GET/POST /api/cart, PUT/DELETE /api/cart/:productId, POST /api/cart/merge (auth required)
- Orders: GET /api/orders/mine, GET /api/orders/:id, POST /api/orders/checkout (auth required)
- Admin: GET /api/admin/overview, GET /api/admin/orders, GET /api/admin/categories, POST /api/admin/categories/rename (admin only)

Notes
- SQLite data lives in server/data/matinacloset.sqlite. The folder is created automatically.
- Switch to MySQL by setting DATABASE_URL to a MySQL connection URI.
- Frontend is served statically from /client by Express.
