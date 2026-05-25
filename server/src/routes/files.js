const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { downloadFile } = require("../controllers/filesController");

const router = express.Router();

router.get("/download/:productId", requireAuth, downloadFile);

module.exports = router;
