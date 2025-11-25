const mongoose = require("mongoose");
const { Product } = require("../models/product");

const newProducts = [
  {
    _id: new mongoose.Types.ObjectId("691f71d76c6106fe0ae87e10"),
    name: "Berry Bliss Bites",
    price: 60,
    varieties: "Berry&Nuts",
    description:
      "Delicious berry and nut energy bites packed with antioxidants",
    productImg:
      "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
    category: {
      _id: new mongoose.Types.ObjectId("691dbe9be45f84be42b6b136"),
      name: "Healthy Snacks",
    },
    productInStock: true,
    productRating: 4.5,
    buyingPrice: 30,
    quantity: 43,
    unit: "Packets",
    thresholdValue: 12,
    expiryDate: new Date("2024-11-12"),
  },
  // ... other products
];

async function seedProducts() {
  try {
    await mongoose.connect("mongodb://localhost/fooddatabase");
    console.log("✅ Connected to MongoDB (fooddatabase)…\n");

    for (const product of newProducts) {
      await Product.updateOne(
        { _id: product._id }, // match by _id
        { $set: product }, // update all fields
        { upsert: true } // insert if it doesn't exist
      );
      console.log(`✅ Updated/Inserted: ${product.name}`);
    }

    const totalProducts = await Product.countDocuments();
    console.log(`\n📊 Total products in database: ${totalProducts}`);
    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    console.error(err);
    process.exit(1);
  }
}

seedProducts();
