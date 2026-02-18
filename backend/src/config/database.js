import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

let dbState = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, "../../data/local-db.json");

const collections = {
  users: "users",
  opportunities: "opportunities",
  pickups: "pickups",
  applications: "applications",
  messages: "messages",
  notifications: "notifications",
  adminLogs: "adminLogs"
};

const initialState = () => ({
  users: [],
  opportunities: [],
  pickups: [],
  applications: [],
  messages: [],
  notifications: [],
  adminLogs: []
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const ensureDbFile = async () => {
  await fs.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });

  try {
    await fs.access(DB_FILE_PATH);
  } catch {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(initialState(), null, 2), "utf8");
  }
};

const readState = async () => {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw || "{}");
    dbState = { ...initialState(), ...parsed };
  } catch {
    dbState = initialState();
  }
};

const persistState = async () => {
  if (!dbState) return;
  await fs.writeFile(DB_FILE_PATH, JSON.stringify(dbState, null, 2), "utf8");
};

const getNextId = (rows) => {
  const max = rows.reduce((acc, row) => {
    const value = typeof row._id === "number" ? row._id : 0;
    return Math.max(acc, value);
  }, 0);
  return max + 1;
};

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

const matchesQuery = (doc, query = {}) => {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, expected] of Object.entries(query)) {
    if (key === "$or") {
      if (!Array.isArray(expected) || expected.length === 0) return false;
      if (!expected.some((subQuery) => matchesQuery(doc, subQuery))) return false;
      continue;
    }

    const actual = doc[key];

    if (isObject(expected)) {
      if ("$in" in expected) {
        if (!expected.$in.includes(actual)) return false;
      }
      if ("$ne" in expected) {
        if (actual === expected.$ne) return false;
      }
      continue;
    }

    if (actual !== expected) return false;
  }

  return true;
};

const applyProjection = (doc, projection) => {
  if (!projection) return clone(doc);

  const includeKeys = Object.entries(projection)
    .filter(([, value]) => value === 1)
    .map(([key]) => key);

  if (includeKeys.length === 0) {
    const output = clone(doc);
    if (projection._id === 0) delete output._id;
    return output;
  }

  const output = {};
  for (const key of includeKeys) {
    if (key in doc) output[key] = clone(doc[key]);
  }

  return output;
};

class LocalCursor {
  constructor(rows, options = {}) {
    this.rows = rows;
    this.options = options;
  }

  sort(sortSpec = {}) {
    const entries = Object.entries(sortSpec);
    if (entries.length === 0) return this;

    this.rows.sort((a, b) => {
      for (const [key, direction] of entries) {
        const left = a[key];
        const right = b[key];
        if (left === right) continue;
        const asc = direction >= 0;
        return left > right ? (asc ? 1 : -1) : asc ? -1 : 1;
      }
      return 0;
    });

    return this;
  }

  async toArray() {
    return this.rows.map((doc) => applyProjection(doc, this.options.projection));
  }
}

class LocalCollection {
  constructor(name) {
    this.name = name;
  }

  get rows() {
    return dbState[this.name];
  }

  find(query = {}, options = {}) {
    const rows = this.rows.filter((doc) => matchesQuery(doc, query)).map((doc) => clone(doc));
    return new LocalCursor(rows, options);
  }

  async findOne(query = {}, options = {}) {
    const row = this.rows.find((doc) => matchesQuery(doc, query));
    return row ? applyProjection(row, options.projection) : null;
  }

  async countDocuments(query = {}) {
    return this.rows.filter((doc) => matchesQuery(doc, query)).length;
  }

  async insertOne(doc) {
    const row = clone(doc);
    if (typeof row._id !== "number") row._id = getNextId(this.rows);
    this.rows.push(row);
    await persistState();
    return { acknowledged: true, insertedId: row._id };
  }

  async insertMany(docs) {
    const insertedIds = {};
    let index = 0;
    for (const doc of docs) {
      const row = clone(doc);
      if (typeof row._id !== "number") row._id = getNextId(this.rows);
      this.rows.push(row);
      insertedIds[index] = row._id;
      index += 1;
    }
    await persistState();
    return { acknowledged: true, insertedCount: docs.length, insertedIds };
  }

  async updateOne(filter = {}, update = {}) {
    const index = this.rows.findIndex((doc) => matchesQuery(doc, filter));
    if (index === -1) return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };

    const row = this.rows[index];
    if (update.$set && isObject(update.$set)) {
      Object.assign(row, clone(update.$set));
    }

    await persistState();
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(filter = {}) {
    const index = this.rows.findIndex((doc) => matchesQuery(doc, filter));
    if (index === -1) return { acknowledged: true, deletedCount: 0 };
    this.rows.splice(index, 1);
    await persistState();
    return { acknowledged: true, deletedCount: 1 };
  }

  async createIndex() {
    return "local-index-noop";
  }
}

const getCollection = (name) => {
  if (!dbState) throw new Error("Database not connected");
  return new LocalCollection(collections[name]);
};

const seedInitialData = async () => {
  const usersCol = getCollection("users");
  const userCount = await usersCol.countDocuments();
  if (userCount > 0) return;

  const hashed = await bcrypt.hash("password123", 8);

  await usersCol.insertMany([
    {
      id: "u-admin",
      name: "Platform Admin",
      email: "admin@wastezero.com",
      password: hashed,
      role: "admin",
      skills: ["monitoring", "reporting"],
      location: "Delhi",
      bio: "System administrator"
    },
    {
      id: "u-ngo",
      name: "Green NGO",
      email: "ngo@wastezero.com",
      password: hashed,
      role: "ngo",
      skills: ["plastic", "organic", "ewaste"],
      location: "Delhi",
      bio: "Community recycling organization"
    },
    {
      id: "u-vol",
      name: "Volunteer One",
      email: "volunteer@wastezero.com",
      password: hashed,
      role: "volunteer",
      skills: ["plastic", "cleanup"],
      location: "Delhi",
      bio: "Weekend cleanup volunteer"
    },
    {
      id: "u-agent",
      name: "Pickup Agent",
      email: "agent@wastezero.com",
      password: hashed,
      role: "agent",
      skills: ["pickup", "organic", "plastic"],
      location: "Delhi",
      bio: "Assigned waste pickup agent"
    }
  ]);

  await getCollection("opportunities").insertOne({
    id: "o-1",
    ngo_id: "u-ngo",
    title: "Neighborhood Plastic Drive",
    description: "Collect and sort household plastic waste.",
    required_skills: ["plastic", "cleanup"],
    duration: "4 hours",
    location: "Delhi",
    status: "open",
    wasteType: "plastic"
  });
};

const ensureIndexes = async () => {
  await getCollection("users").createIndex({ id: 1 }, { unique: true });
  await getCollection("users").createIndex({ email: 1 }, { unique: true });

  await Promise.all([
    getCollection("opportunities").createIndex({ id: 1 }, { unique: true }),
    getCollection("applications").createIndex({ id: 1 }, { unique: true }),
    getCollection("pickups").createIndex({ id: 1 }, { unique: true }),
    getCollection("messages").createIndex({ id: 1 }, { unique: true }),
    getCollection("notifications").createIndex({ id: 1 }, { unique: true }),
    getCollection("adminLogs").createIndex({ id: 1 }, { unique: true })
  ]);
};

export const connectDatabase = async () => {
  if (dbState) return dbState;

  await readState();
  await ensureIndexes();
  await seedInitialData();

  console.log(`[DB] Connected to local JSON database (${DB_FILE_PATH})`);
  return dbState;
};

export const getDb = () => {
  if (!dbState) throw new Error("Database not connected");
  return dbState;
};

export const getCollections = () => ({
  users: getCollection("users"),
  opportunities: getCollection("opportunities"),
  pickups: getCollection("pickups"),
  applications: getCollection("applications"),
  messages: getCollection("messages"),
  notifications: getCollection("notifications"),
  adminLogs: getCollection("adminLogs")
});
