const db = require("../db/pool");

async function createOrder(req, res, next) {
  try {
    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({ error: "Only buyers can purchase products" });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    // Check product exists and is active
    const { rows: products } = await db.query(
      "SELECT id, author_id, price FROM products WHERE id = $1 AND is_active = true",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = products[0];

    // Cannot buy own product
    if (product.author_id === req.user.id) {
      return res.status(403).json({ error: "You cannot buy your own product" });
    }

    // Create order (UNIQUE constraint handles duplicate purchase)
    try {
      const { rows } = await db.query(
        `INSERT INTO orders (user_id, product_id, price_paid)
         VALUES ($1, $2, $3)
         RETURNING id, product_id, price_paid, purchased_at`,
        [req.user.id, productId, product.price]
      );

      return res.status(201).json({ order: rows[0] });
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "You already own this product" });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT o.id, o.price_paid, o.purchased_at,
              p.id as product_id, p.title, p.description,
              p.category, p.cover_path, p.file_name,
              u.name as author_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       JOIN users u ON p.author_id = u.id
       WHERE o.user_id = $1
       ORDER BY o.purchased_at DESC`,
      [req.user.id]
    );

    return res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getMyOrders };
