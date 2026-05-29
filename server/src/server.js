require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

const authRouter = require("./routes/auth");

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);

const productsRouter = require("./routes/products");
app.use("/api/products", productsRouter);

const ordersRouter = require("./routes/orders");
const filesRouter = require("./routes/files");
const wishlistRouter = require("./routes/wishlist");
const { requireAuth } = require("./middleware/auth");

app.use("/api/orders", ordersRouter);
app.use("/api/files", filesRouter);
app.use("/api/wishlist", requireAuth, wishlistRouter);

const cartRouter = require("./routes/cart");
app.use("/api/cart", requireAuth, cartRouter);

// Serve cover images statically
const path = require("path");
app.use(
  "/uploads/covers",
  express.static(path.join(__dirname, "../uploads/covers"))
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
