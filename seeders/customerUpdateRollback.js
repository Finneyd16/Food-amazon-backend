const mongoose = require("mongoose");
const { Customer } = require("../models/customer");

// Same database as above
const MONGO_URI = "mongodb://127.0.0.1:27017/food-amazon";

async function runRollback() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    console.log("Reverting changes...");

    const result = await Customer.updateMany(
      {},
      {
        $unset: {
          totalOrders: "",
          totalSpent: "",
          profilePicture: "",
          status: "",
          forOrderNote: "",
        },
      }
    );

    console.log("Rollback complete.");
    console.log(`Modified documents: ${result.modifiedCount}`);

    process.exit(0);
  } catch (err) {
    console.error("Error running rollback:", err);
    process.exit(1);
  }
}

runRollback();
