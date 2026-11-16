import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import mongoose from "mongoose";

export const EMPTY_NUTRITION = {
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

/** Legacy embedded fields → current Nutrition keys. */
export const LEGACY_NUTRITION_FIELD_MAP = {
  fatPercentage: "fat",
  saturatedFatPercentage: "saturatedFat",
};

export const LEGACY_NUTRITION_FIELDS = [
  ...Object.keys(LEGACY_NUTRITION_FIELD_MAP),
  "magnesium",
  "potassium",
  "vitaminD",
  "vitaminB12",
];

export function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

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

export function parseArgs(argv = process.argv.slice(2)) {
  const flags = new Set();
  for (const arg of argv) {
    if (arg.startsWith("--")) flags.add(arg.slice(2));
  }
  return {
    dryRun: flags.has("dry-run"),
    force: flags.has("force"),
    yes: flags.has("yes"),
    help: flags.has("help") || flags.has("h"),
  };
}

export function isLocalMongoUri(uri) {
  return /localhost|127\.0\.0\.1|::1|0\.0\.0\.0/i.test(uri);
}

export function redactMongoUri(uri) {
  return uri.replace(/\/\/([^@/]+)@/, "//***@");
}

export async function requireSafeMongoUri(uri, { force }) {
  if (force || isLocalMongoUri(uri)) return;

  throw new Error(
    `Refusing to run against non-local MONGO_URI (${redactMongoUri(uri)}). ` +
      `Re-run with --force if you intentionally target this database.`,
  );
}

export async function confirmAction(promptText, expected, { yes }) {
  if (yes) {
    console.log(`Skipping confirmation (--yes).`);
    return;
  }

  if (!input.isTTY) {
    throw new Error(`Refusing to run non-interactively without --yes. Expected confirmation: ${expected}`);
  }

  const rl = createInterface({ input, output });
  try {
    const answer = (await rl.question(`${promptText}\nType ${expected} to continue: `)).trim();
    if (answer !== expected) {
      throw new Error(`Aborted: expected "${expected}", got "${answer || "(empty)"}".`);
    }
  } finally {
    rl.close();
  }
}

export async function connectMongo() {
  loadEnv();

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
  }

  return mongoUri;
}

export async function withMongoConnection(mongoUri, work) {
  await mongoose.connect(mongoUri);
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Mongo connection has no database");
    }
    return await work(db);
  } finally {
    await mongoose.disconnect();
  }
}

export function collectionNameMap(collectionNames) {
  return new Map(collectionNames.map((name) => [name.toLowerCase(), name]));
}

export function remapNutritionDoc(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const next = { ...EMPTY_NUTRITION };

  for (const [legacyKey, currentKey] of Object.entries(LEGACY_NUTRITION_FIELD_MAP)) {
    if (source[currentKey] == null && source[legacyKey] != null) {
      next[currentKey] = Number(source[legacyKey]) || 0;
    }
  }

  for (const key of Object.keys(EMPTY_NUTRITION)) {
    if (source[key] != null) {
      next[key] = Number(source[key]) || 0;
    }
  }

  return next;
}

export function nutritionNeedsRemap(raw) {
  if (!raw || typeof raw !== "object") return true;

  const hasLegacy = LEGACY_NUTRITION_FIELDS.some((key) => Object.prototype.hasOwnProperty.call(raw, key));
  const missingCurrent = Object.keys(EMPTY_NUTRITION).some((key) => raw[key] == null);
  return hasLegacy || missingCurrent;
}
