const express = require("express");
const {
  createProduct,
  getAProduct,
  getAllProducts,
  updateProduct,
  deleteAProduct,
  //   addToWishlist,
  //   rating,
  uploadImages,
  updateProductImg,
} = require("../controllers/productController");
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const {
  uploadPhoto,
  productImgResize,
} = require("../middleware/uploadImagesMiddleware");
const router = express.Router();

router.post("/",createProduct);
router.put(
  "/upload/:id",
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);
router.get("/:id", getAProduct);
router.get("/", getAllProducts);
router.put("/:id", updateProductImg);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteAProduct);

module.exports = router;
