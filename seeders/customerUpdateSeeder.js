const mongoose = require("mongoose");
const { Customer } = require("../models/customer");

// Optional: change to your MongoDB URI
const MONGO_URI = "mongodb://127.0.0.1:27017/food-amazon";

async function runSeeder() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    console.log("Updating customers...");

    const result = await Customer.updateMany(
      {},
      {
        $set: {
          totalOrders: 0,
          totalSpent: 0,
          profilePicture: "",
          status: "Active",
          timeStamp: "",
        },
      }
    );

    console.log("Seeder complete.");
    console.log(`Modified documents: ${result.modifiedCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Error running seeder:", err);
    process.exit(1);
  }
}

runSeeder();
