# Folio - Digital Products Marketplace

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?logo=supabase&logoColor=white&style=flat-square)

**Live demo:** https://digital-products-platform-zeta.vercel.app

E-commerce platform for selling and buying digital products — PDFs, templates, courses, and other digital files.

Authors upload products and set prices. Buyers browse the catalog, purchase, and download files instantly. Access is controlled — only verified buyers can download a file.

---

## Stack

**Frontend** — React 19, TypeScript 6, Vite, Tailwind CSS v4, React Router v7, Axios

**Backend** — Node.js, Express 5, PostgreSQL, JWT, bcrypt, Multer, Zod

**Infrastructure** — Vercel (frontend), Railway (backend + PostgreSQL), Supabase Storage (files)

---

## Features

- Registration with role selection — buyer or author
- JWT authentication with bcrypt password hashing
- Product catalog with search and category filters
- Sort by newest, oldest, price high/low
- Adjustable column grid (3 / 4 / 5 columns)
- Hide purchased toggle for buyers
- File upload for digital products (PDF, ZIP, DOCX) via Supabase Storage
- Simulated purchase flow with instant access
- Protected file download — server verifies purchase, returns a signed URL from Supabase
- Toast notifications after purchase
- Wishlist and cart with multi-product checkout
- Author dashboard with product management and per-product sales stats
- Buyer dashboard with purchase history
- Public author profile pages
- Role-awareness messages with cross-role CTAs
- Light / dark theme

---

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Supabase project with two storage buckets:
  - `covers` — set visibility to **Public**
  - `files` — leave as **Private**

### 1. Clone

```bash
git clone https://github.com/codebybohdana/digital_products_platform.git
cd digital_products_platform
```

### 2. Database

```bash
psql -U postgres -c "CREATE DATABASE marketplace_db;"
psql -U postgres -d marketplace_db -f server/src/db/schema.sql
```

### 3. Backend

```bash
cd server
cp .env.example .env
# fill in .env values (see below)
npm install
npm run dev
```

**`server/.env`**

```
PORT=3001
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/marketplace_db
JWT_SECRET=long_random_string_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-service-role-key
```

### 4. Frontend

```bash
cd client
cp .env.example .env
# fill in .env values (see below)
npm install
npm run dev
```

**`client/.env`**

```
VITE_API_URL=http://localhost:3001/api
```

---

## Database Schema

```sql
users       — id, name, email, password_hash, role, created_at
products    — id, author_id, title, description, price, category,
              file_path, file_name, file_size, cover_path, is_active,
              created_at, updated_at
orders      — id, user_id, product_id, price_paid, purchased_at
wishlists   — id, user_id, product_id, created_at
cart_items  — id, user_id, product_id, added_at
```

---

## Infrastructure

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting, auto-deploy from `main` |
| Railway | Backend API + PostgreSQL database |
| Supabase Storage | `covers` bucket (public CDN), `files` bucket (private, signed URLs) |
