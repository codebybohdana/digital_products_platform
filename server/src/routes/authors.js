const express = require('express');
const db = require('../db/pool');

const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows: authorRows } = await db.query(
      "SELECT id, name, created_at FROM users WHERE id = $1 AND role = 'author'",
      [id]
    );

    if (authorRows.length === 0) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const [productsResult, statsResult] = await Promise.all([
      db.query(
        `SELECT p.id, p.title, p.price, p.category, p.cover_path, p.author_id,
                u.name AS author_name
         FROM products p
         JOIN users u ON p.author_id = u.id
         WHERE p.author_id = $1 AND p.is_active = true
         ORDER BY p.created_at DESC`,
        [id]
      ),
      db.query(
        `SELECT COUNT(DISTINCT p.id) AS product_count,
                COUNT(o.id) AS total_sales
         FROM products p
         LEFT JOIN orders o ON p.id = o.product_id
         WHERE p.author_id = $1 AND p.is_active = true`,
        [id]
      ),
    ]);

    const author = {
      ...authorRows[0],
      product_count: parseInt(statsResult.rows[0].product_count, 10),
      total_sales: parseInt(statsResult.rows[0].total_sales, 10),
    };

    return res.json({ author, products: productsResult.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;