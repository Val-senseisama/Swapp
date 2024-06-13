const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    inReturn: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      //required: true,
    },
    brand: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    images: {
      type: Array,
    },
    whatsapp:{
      type: Number,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

async function deleteDocuments() {
  try {
    const result = await Product.deleteMany({ images: { $eq: [] } });
    console.log(`${result.deletedCount} documents were deleted.`);
  } catch (error) {
    console.error("Error deleting documents:", error);
  } 
}

deleteDocuments();

//Export the model
module.exports = mongoose.model("Product", productSchema);
