const multer = require("multer");
const path = require("path");

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "file") {
    const allowed = [".pdf", ".zip", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, ZIP, DOCX files are allowed"));
    }
  } else if (file.fieldname === "cover") {
    const allowed = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG images are allowed for cover"));
    }
  } else {
    cb(new Error("Unexpected field"));
  }
};

const productStorage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
}).fields([
  { name: "file", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

module.exports = { productStorage };
