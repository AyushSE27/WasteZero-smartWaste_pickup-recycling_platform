import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";
import { env } from "./env.js";

let client;
let db;

const collections = {
  users: "users",
  opportunities: "opportunities",
  pickups: "pickups",
  applications: "applications",
  messages: "messages",
  notifications: "notifications",
  adminLogs: "adminLogs"
};

const getCollection = (name) => {
  if (!db) throw new Error("Database not connected");
  return db.collection(collections[name]);
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
  if (db) return db;

  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is not set. Update backend/.env");
  }

  client = new MongoClient(env.mongoUri);
  await client.connect();
  db = client.db(env.mongoDbName);

  await ensureIndexes();
  await seedInitialData();

  console.log(`[DB] Connected to MongoDB (${env.mongoDbName})`);
  return db;
};

export const getDb = () => {
  if (!db) throw new Error("Database not connected");
  return db;
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
