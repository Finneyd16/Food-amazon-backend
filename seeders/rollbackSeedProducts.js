// RUN THIS FILE TO ROLLBACK THE SEED

const mongoose = require("mongoose");
const { Product } = require("../models/product");

async function rollbackSeed() {
  try {
    await mongoose.connect("mongodb://localhost/fooddatabase");
    console.log("✅ Connected to MongoDB (fooddatabase)…\n");

    const backupCollection = mongoose.connection.collection("products_backup");
    const backup = await backupCollection.find().toArray();

    if (backup.length === 0) {
      console.log("❌ No backup found. Rollback aborted.");
      process.exit(0);
    }

    console.log(`📦 Found ${backup.length} products in backup\n`);

    // Delete current products
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} current products\n`);

    // Restore all products from backup
    const restoredProducts = await Product.insertMany(backup);
    console.log(`✅ Restored ${restoredProducts.length} products:\n`);

    // Display restored products
    restoredProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Price: ₦${product.price}`);
      console.log(`   Category: ${product.category.name}`);
      if (product.quantity !== undefined) {
        console.log(
          `   Quantity: ${product.quantity} ${product.unit || "units"}`
        );
        console.log(`   Availability: ${product.availability}`);
      }
      console.log();
    });

    console.log("✅ Rollback successful. Products restored from backup.");

    // Ask before removing backup
    console.log("\n⚠️  Backup collection still exists at 'products_backup'");
    console.log("💡 To keep backup: Do nothing");
    console.log(
      "💡 To remove backup: Uncomment the lines below in the script\n"
    );

    // Uncomment these lines if you want to auto-remove backup after restore:
    // await backupCollection.drop();
    // console.log("🗑️  Backup collection removed.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Rollback failed:", err.message);
    console.error(err);
    process.exit(1);
  }
}

rollbackSeed();
