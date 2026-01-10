import fs from "fs";
import path from "path";

export type PredmetSkupina = { predmetId: string; skupina: string };

export type ShraniSkupinoBody = {
  enabled: boolean;
  skupine: PredmetSkupina[];
};

export type UserModuleGroups = {
  userId: number;
  programId: string;
  year: number;
  enabled: boolean;
  skupine: PredmetSkupina[];
  updatedAt: string;
};


type DbShape = { records: UserModuleGroups[] };

const DATA_DIR = path.join(process.cwd(), "storage", "_index");
const FILE_PATH = path.join(DATA_DIR, "userModuleGroups.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) {
    const initial: DbShape = { records: [] };
    fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

function readDb(): DbShape {
  ensureStore();
  return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8")) as DbShape;
}

function writeDb(db: DbShape) {
  ensureStore();
  fs.writeFileSync(FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function loadUserModuleGroups(userId: number, programId: string, year: number): UserModuleGroups | null {
  const db = readDb();
  return db.records.find(r => r.userId === userId && r.programId === programId && r.year === year) ?? null;
}

export function saveUserModuleGroups(
  userId: number,
  programId: string,
  year: number,
  enabled: boolean,
  skupine: PredmetSkupina[]
): UserModuleGroups {
  const db = readDb();
  const record: UserModuleGroups = {
    userId,
    programId,
    year,
    enabled,
    skupine,
    updatedAt: new Date().toISOString()
  };

  const idx = db.records.findIndex(r => r.userId === userId && r.programId === programId && r.year === year);
  if (idx >= 0) db.records[idx] = record;
  else db.records.push(record);

  writeDb(db);
  return record;
}
