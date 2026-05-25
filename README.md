# Folio

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)

E-commerce platform for selling and buying digital products — PDFs, templates, courses, and other digital files.

Authors upload products and set prices. Buyers browse the catalog, purchase, and download files instantly. Access is controlled — only verified buyers can download a file.

---

## Stack

**Frontend** — React, TypeScript, Vite, Tailwind CSS, React Router, Axios

**Backend** — Node.js, Express, PostgreSQL, JWT, bcrypt, Multer, Zod

---

## Features

- Registration with role selection — buyer or author
- JWT authentication with bcrypt password hashing
- Product catalog with search and categories
- File upload for digital products (PDF, ZIP, DOCX)
- Purchase flow with instant access after payment
- Protected file download — server verifies purchase before serving the file
- Author dashboard with sales statistics
- Buyer dashboard with purchased products
- Light / dark theme

---

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL 14+

### 1. Clone

\`\`\`bash
git clone https://github.com/codebybohdana/digital_products_platform.git
cd digital_products_platform
\`\`\`

### 2. Database

\`\`\`bash
psql -U postgres -c "CREATE DATABASE marketplace_db;"
psql -U postgres -d marketplace_db -f server/src/db/schema.sql
\`\`\`

### 3. Backend

\`\`\`bash
cd server
cp .env.example .env
npm install
npm run dev
\`\`\`

### 4. Frontend

\`\`\`bash
cd client
cp .env.example .env
npm install
npm run dev
\`\`\`

---

## API

### Auth

\`\`\`
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
\`\`\`

### Products

\`\`\`
GET /api/products
GET /api/products/:id
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id
GET /api/products/my
PATCH /api/products/:id/toggle
\`\`\`

### Orders

\`\`\`
POST /api/orders
GET /api/orders/my
\`\`\`

### Files

\`\`\`
GET /api/files/download/:productId
\`\`\`

---

## Database

\`\`\`sql
users — id, name, email, password_hash, role, created_at
products — id, author_id, title, description, price, category,
file_path, file_name, cover_path, is_active, created_at
orders — id, user_id, product_id, price_paid, purchased_at
\`\`\`

---

## Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens, 7-day expiration
- Parameterized SQL queries — no SQL injection
- Files served only through authenticated endpoint
- Rate limiting on auth routes (5 requests / 15 min)
- CORS restricted to frontend origin

---

## Author

Bohdana Yablinchuk
