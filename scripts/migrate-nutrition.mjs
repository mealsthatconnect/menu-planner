/**
 * Non-destructive remap of legacy nutritional_info fields to the current schema
 * (e.g. fatPercentage → fat). Unsets removed legacy keys. Does not zero values.
 *
 * Usage:
 *   node scripts/migrate-nutrition.mjs --dry-run
 *   node scripts/migrate-nutrition.mjs
 *   node scripts/migrate-nutrition.mjs --yes --force
 */
import {
  LEGACY_NUTRITION_FIELDS,
  collectionNameMap,
  confirmAction,
  connectMongo,
  nutritionNeedsRemap,
  parseArgs,
  redactMongoUri,
  remapNutritionDoc,
  requireSafeMongoUri,
  withMongoConnection,
} from "./lib/mongo-cli.mjs";

function printHelp() {
  console.log(`Usage: node scripts/migrate-nutrition.mjs [options]

Options:
  --dry-run   Report what would change without writing
  --yes       Skip interactive confirmation
  --force     Allow non-local MONGO_URI
  --help      Show this help

Maps legacy fields (fatPercentage → fat, saturatedFatPercentage → saturatedFat)
and fills missing current keys. Prefer this over wipe-nutrition.mjs when retaining data.`);
}

async function migrateCollection(db, collectionName, { dryRun }) {
  const collection = db.collection(collectionName);
  const cursor = collection.find({}, { projection: { nutritional_info: 1 } });

  let scanned = 0;
  let wouldUpdate = 0;
  let updated = 0;

  for await (const doc of cursor) {
    scanned += 1;
    const raw = doc.nutritional_info;
    if (!nutritionNeedsRemap(raw)) continue;

    wouldUpdate += 1;
    const nutritional_info = remapNutritionDoc(raw);

    if (dryRun) continue;

    const unset = Object.fromEntries(LEGACY_NUTRITION_FIELDS.map((key) => [`nutritional_info.${key}`, ""]));
    await collection.updateOne({ _id: doc._id }, { $set: { nutritional_info }, $unset: unset });
    updated += 1;
  }

  if (dryRun) {
    console.log(`${collectionName}: scanned ${scanned}, would remap ${wouldUpdate}`);
  } else {
    console.log(`${collectionName}: scanned ${scanned}, remapped ${updated}`);
  }
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    printHelp();
    return;
  }

  const mongoUri = await connectMongo();
  console.log(`target: ${redactMongoUri(mongoUri)}${args.dryRun ? " (dry-run)" : ""}`);
  await requireSafeMongoUri(mongoUri, args);

  if (!args.dryRun) {
    await confirmAction(
      "This will remap legacy nutritional_info fields on recipes, combos, and calendars (no wipe).",
      "MIGRATE",
      args,
    );
  }

  await withMongoConnection(mongoUri, async (db) => {
    const collectionNames = (await db.listCollections().toArray()).map((collection) => collection.name);
    const collectionByLower = collectionNameMap(collectionNames);

    console.log(`collections: ${collectionNames.join(", ") || "(none)"}`);

    for (const expected of ["recipes", "combos", "calendars"]) {
      const name = collectionByLower.get(expected);
      if (name) {
        await migrateCollection(db, name, args);
      } else {
        console.log(`${expected}: collection not found, skipped`);
      }
    }
  });

  console.log(args.dryRun ? "Dry run complete. No changes written." : "Nutrition migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
