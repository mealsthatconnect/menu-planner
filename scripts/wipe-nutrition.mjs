import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

const EMPTY_NUTRITION = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  saturatedFat: 0,
  transFat: 0,
  cholesterol: 0,
  fiber: 0,
  calcium: 0,
  iron: 0,
  sodium: 0,
  vitaminA: 0,
  vitaminC: 0,
};

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  const text = readFileSync(envPath, "utf8");

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

async function wipeCollectionNutrition(db, collectionName) {
  const result = await db.collection(collectionName).updateMany({}, { $set: { nutritional_info: EMPTY_NUTRITION } });
  console.log(`${collectionName}: reset nutritional_info on ${result.modifiedCount} document(s)`);
}

async function main() {
  loadEnv();

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Mongo connection has no database");
  }

  const collectionNames = (await db.listCollections().toArray()).map((collection) => collection.name);
  const collectionByLower = new Map(collectionNames.map((name) => [name.toLowerCase(), name]));

  console.log(`collections: ${collectionNames.join(", ") || "(none)"}`);

  for (const expected of ["recipes", "combos", "calendars"]) {
    const name = collectionByLower.get(expected);
    if (name) {
      await wipeCollectionNutrition(db, name);
    } else {
      console.log(`${expected}: collection not found, skipped`);
    }
  }

  const nutritionCollection = collectionByLower.get("nutritions");
  if (nutritionCollection) {
    const dropped = await db.collection(nutritionCollection).drop();
    console.log(`${nutritionCollection}: dropped collection (${dropped})`);
  } else {
    console.log("nutritions: collection not found, skipped");
  }

  await mongoose.disconnect();
  console.log("Nutrition wipe complete. App goals now come from nutrition-goals.csv (Add + Stay nutrients).");
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors during failure
  }
  process.exit(1);
});
