const db = require("../db/pool");
const supabase = require("../lib/supabase");

async function downloadFile(req, res, next) {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Verify purchase
    const { rows: orders } = await db.query(
      `SELECT o.id FROM orders o
       WHERE o.user_id = $1 AND o.product_id = $2`,
      [userId, productId]
    );

    if (orders.length === 0) {
      return res
        .status(403)
        .json({ error: "You have not purchased this product" });
    }

    // Get file path from DB (never from URL params)
    const { rows: products } = await db.query(
      "SELECT file_path, file_name FROM products WHERE id = $1",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { file_path, file_name } = products[0];

    // Generate a signed URL (valid for 1 hour) with forced download
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file_path, 3600, { download: file_name });

    if (error || !data?.signedUrl) {
      return res.status(500).json({ error: "Failed to generate download URL" });
    }

    return res.json({ url: data.signedUrl });
  } catch (err) {
    next(err);
  }
}

module.exports = { downloadFile };
