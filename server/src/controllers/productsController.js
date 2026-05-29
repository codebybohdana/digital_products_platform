const { z } = require("zod");
const db = require("../db/pool");
const path = require("path");
const jwt = require("jsonwebtoken");

const productSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  category: z.enum([
    "Education", "Design", "Business", "Programming", "Marketing",
    "Finance", "Photography", "Music", "Writing", "Health & Fitness",
    "Personal Development", "Templates", "Other",
  ]),
});

async function getProducts(req, res, next) {
  try {
    const { search } = req.query;
    let query = `
      SELECT p.id, p.title, p.description, p.price, p.category,
             p.cover_path, p.created_at, p.author_id,
             u.name as author_name
      FROM products p
      JOIN users u ON p.author_id = u.id
      WHERE p.is_active = true
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.title ILIKE $${params.length}`;
    }

    query += " ORDER BY p.created_at DESC";

    const { rows } = await db.query(query, params);
    return res.json({ products: rows });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT p.*, u.name as author_name
       FROM products p
       JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = rows[0];

    if (!product.is_active) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
          if (decoded.id === product.author_id) {
            return res.json({ product });
          }
        } catch {
          // invalid token — fall through to 404
        }
      }
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    if (req.user.role !== "author") {
      return res
        .status(403)
        .json({ error: "Only authors can create products" });
    }

    const result = productSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: (result.error?.errors ?? []).map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }

    if (!req.files?.file?.[0]) {
      return res.status(400).json({ error: "Product file is required" });
    }

    const { title, description, price, category } = result.data;
    const file = req.files.file[0];
    const cover = req.files?.cover?.[0];

    const { rows } = await db.query(
      `INSERT INTO products
        (author_id, title, description, price, category, file_path, file_name, file_size, cover_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, description, price, category, cover_path, created_at`,
      [
        req.user.id,
        title,
        description || null,
        price,
        category,
        `/uploads/files/${file.filename}`,
        file.originalname,
        file.size,
        cover ? `/uploads/covers/${cover.filename}` : null,
      ]
    );

    return res.status(201).json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function getMyProducts(req, res, next) {
  try {
    if (req.user.role !== "author") {
      return res.status(403).json({ error: "Only authors can access this" });
    }

    const { rows } = await db.query(
      `SELECT p.id, p.title, p.category, p.price, p.is_active, p.cover_path,
              p.created_at,
              COUNT(o.id) as sales_count,
              COALESCE(SUM(o.price_paid), 0) as total_revenue
       FROM products p
       LEFT JOIN orders o ON p.id = o.product_id
       WHERE p.author_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    return res.json({ products: rows });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;

    const { rows: existing } = await db.query(
      "SELECT * FROM products WHERE id = $1 AND author_id = $2",
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const result = productSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Validation failed" });
    }

    const { title, description, price, category } = result.data;
    const current = existing[0];
    const cover = req.files?.cover?.[0];
    const newCoverPath = cover ? `/uploads/covers/${cover.filename}` : current.cover_path;

    const { rows } = await db.query(
      `UPDATE products
       SET title = $1, description = $2, price = $3, category = $4, cover_path = $5, updated_at = NOW()
       WHERE id = $6 AND author_id = $7
       RETURNING id, title, description, price, category, cover_path, is_active`,
      [
        title ?? current.title,
        description ?? current.description,
        price ?? current.price,
        category ?? current.category,
        newCoverPath,
        id,
        req.user.id,
      ]
    );

    return res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function toggleProduct(req, res, next) {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `UPDATE products
       SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 AND author_id = $2
       RETURNING id, title, is_active`,
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      "DELETE FROM products WHERE id = $1 AND author_id = $2 RETURNING id",
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  getMyProducts,
  updateProduct,
  toggleProduct,
  deleteProduct,
};
