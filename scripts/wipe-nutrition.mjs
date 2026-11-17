/**
 * Destructive reset: zeroes nutritional_info on recipes/combos/calendars and
 * drops the legacy standalone nutritions collection.
 *
 * Prefer scripts/migrate-nutrition.mjs when you only need to remap old fields.
 *
 * Usage:
 *   node scripts/wipe-nutrition.mjs --dry-run
 *   node scripts/wipe-nutrition.mjs
 *   node scripts/wipe-nutrition.mjs --yes --force   # non-local URI, no prompt
 */
import {
  EMPTY_NUTRITION,
  collectionNameMap,
  confirmAction,
  connectMongo,
  parseArgs,
  redactMongoUri,
  requireSafeMongoUri,
  withMongoConnection,
} from "./lib/mongo-cli.mjs";

function printHelp() {
  console.log(`Usage: node scripts/wipe-nutrition.mjs [options]

Options:
  --dry-run   Report what would change without writing
  --yes       Skip interactive confirmation
  --force     Allow non-local MONGO_URI
  --help      Show this help

Safety: refuses non-local URIs unless --force. Prefer migrate-nutrition.mjs for remaps.`);
}

async function wipeCollectionNutrition(db, collectionName, { dryRun }) {
  const count = await db.collection(collectionName).countDocuments({});
  if (dryRun) {
    console.log(`${collectionName}: would reset nutritional_info on ${count} document(s)`);
    return;
  }

  const result = await db.collection(collectionName).updateMany({}, { $set: { nutritional_info: EMPTY_NUTRITION } });
  console.log(`${collectionName}: reset nutritional_info on ${result.modifiedCount} document(s)`);
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
      "This will ZERO nutritional_info on recipes, combos, and calendars, and DROP the nutritions collection.",
      "WIPE",
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
        await wipeCollectionNutrition(db, name, args);
      } else {
        console.log(`${expected}: collection not found, skipped`);
      }
    }

    const nutritionCollection = collectionByLower.get("nutritions");
    if (nutritionCollection) {
      if (args.dryRun) {
        console.log(`${nutritionCollection}: would drop collection`);
      } else {
        const dropped = await db.collection(nutritionCollection).drop();
        console.log(`${nutritionCollection}: dropped collection (${dropped})`);
      }
    } else {
      console.log("nutritions: collection not found, skipped");
    }
  });

  console.log(args.dryRun ? "Dry run complete. No changes written." : "Nutrition wipe complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
