const { MongoClient, ObjectId } = require("mongodb");

async function migrateRawProductImages() {
  const client = new MongoClient("mongodb://127.0.0.1:27017");
  try {
    await client.connect();
    const db = client.db("fooddatabase");
    const products = await db.collection("products").find().toArray();

    let updatedCount = 0;

    for (let product of products) {
      const current = product.productImg;
      if (!Array.isArray(current)) {
        let newImgs = [];
        if (typeof current === "string" && current.trim() !== "") {
          newImgs = [current];
        }
        await db
          .collection("products")
          .updateOne({ _id: product._id }, { $set: { productImg: newImgs } });
        updatedCount++;
        console.log(`✅ Updated product ${product._id}`);
      }
    }

    console.log(`🎉 Migration complete. Updated ${updatedCount} products.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

migrateRawProductImages();
