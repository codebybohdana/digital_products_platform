const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { productStorage } = require("../middleware/upload");
const {
  getProducts,
  getProduct,
  createProduct,
  getMyProducts,
  updateProduct,
  toggleProduct,
  deleteProduct,
} = require("../controllers/productsController");

const router = express.Router();

router.get("/", getProducts);
router.get("/my", requireAuth, getMyProducts);
router.get("/:id", getProduct);
router.post("/", requireAuth, productStorage, createProduct);
router.put("/:id", requireAuth, updateProduct);
router.patch("/:id/toggle", requireAuth, toggleProduct);
router.delete("/:id", requireAuth, deleteProduct);

module.exports = router;
