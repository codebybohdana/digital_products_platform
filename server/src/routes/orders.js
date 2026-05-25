const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createOrder, getMyOrders } = require("../controllers/ordersController");

const router = express.Router();

router.post("/", requireAuth, createOrder);
router.get("/my", requireAuth, getMyOrders);

module.exports = router;
