
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongoDbId");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");

const createProduct = asyncHandler(async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params;
  const owner = await Product.findById(id).owner;
  if (owner === req.user._id || req.user.role === "Admin") {
    try {
      const updateProduct = await Product.findOneAndUpdate({ id }, req.body, {
        new: true,
      });

      res.json(updateProduct);
    } catch (error) {
      throw new Error(error);
    }
  } else {
    res.statusCode(400).send("Back off");
  }
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }
  return array;
}

const updateProductImg = asyncHandler(async (req, res) => {
  const {id} = req.params;
  const images = req.body;
  // console.log(id)
  // console.log(images);
  // console.log(req.body)
  //const owner = await Product.findById(id).owner;
  if (!id) {
    return res.status(400).send("Invalid product ID.");
  }

  // if (!Array.isArray(images) || images.length === 0) {
  //   return res.status(400).send("images is not an array");
  // }
  const product = await Product.findById(id)
  if (product) {
        try {
      const updateProductImage = await Product.findByIdAndUpdate( id , { $set: {images : images} }, {
        new: true,
      });
      
    if (!updateProductImage) {
      return res.status(404).send("Product not found.");
    res.json(product)
    // console.log(product)
    }

     res.json(updateProductImage);
         // console.log(updateProductImage.images)
          
          //console.log(updateProductImage.images.images)
    } catch (error) {
       res.status(500).json({ message: error.message })
    }
  } 
    else {
      console.log("Can't find product")
  }

});

const deleteAProduct = asyncHandler(async (req, res) => {
  const id = req.params;
  try {
    const deleteAProduct = await Product.findOneAndDelete(id);

    res.json(deleteAProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Filtering
    const queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields", "search"];
    excludeFields.forEach((el) => delete queryObject[el]);

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    console.log("Query Object after filtering:", queryObject);
    console.log("Query String:", queryStr);

    // Initialize the query with an empty object if no filtering criteria
    let query = Product.find(JSON.parse(queryStr) || {});

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      console.log("Search Regex:", searchRegex);
      query = query.where({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      });
    }

    // Log query before sorting, limiting, and pagination
    console.log("Query before sorting and pagination:", JSON.stringify(query.getQuery(), null, 2));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This page does not exist");
    }

    // Log final query
    console.log("Final Query:", JSON.stringify(query.getQuery(), null, 2));
     
    const products = await query;
    const shuffledProducts = shuffleArray(products);
    res.json(shuffledProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// const addToWishlist = asyncHandler(async(req, res) => {
//     const { _id } = req.user;
//     const {prodId} = req.body;
//     try {
//         const user =await User.findById(_id);
//         const alreadyAdded =  user.wishlist.find((id)=>id.toString() === prodId);
//         if(alreadyAdded){
//             let user = await User.findByIdAndUpdate(_id, {
//                 $pull: { wishlist: prodId }
//             }, {new: true});
//             res.json(user);
//         } else {
//             let user = await User.findByIdAndUpdate(_id, {
//                 $push: { wishlist: prodId }
//             }, {new: true});
//             res.json(user);
//         }
//     } catch (error) {
//         throw new Error(error);
//     }
// });

// const rating = asyncHandler(async(req, res) => {
//     const { _id } = req.user;
//     const { star, prodId, comment } = req.body;
//     const product = await Product.findById(prodId);
//     let alreadyRated = product.ratings.find((userId)=> userId.postedBy.toString() === _id.toString());
//     try {

//     if(alreadyRated){
//         const updateRating = await Product.updateOne({
//             ratings: {$elemMatch: alreadyRated}
//         },{
//             $set: {"ratings.$.star": star, "ratings.$.comment": comment}
//         }, {new: true});
//     }else{
//         const rateProduct = await Product.findByIdAndUpdate(prodId, {
//             $push: {
//                 ratings: {
//                     star: star,
//                     comment: comment,
//                     postedBy: _id
//                 },
//             },
//         },{new: true});
//     } const getAllRatings = await Product.findById(prodId);
//     let totalRating = getAllRatings.ratings.length;
//     let ratingSum = getAllRatings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
//     let actualRating = Math.round( ratingSum / totalRating);
//    let finalProduct = await Product.findByIdAndUpdate(prodId, {
//         totalRatings: actualRating
//     }, {new: true});
//     res.json(finalProduct);
//     } catch (error) {
//         throw new Error(error)
//     }
// });

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    let files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getAProduct,
  getAllProducts,
  updateProduct,
  deleteAProduct,
  //   addToWishlist,
  //   rating,
  uploadImages,
  updateProductImg
};
