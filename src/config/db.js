const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectDB() {
  await client.connect();
  db = client.db("ideaVaultDB");
  console.log("Connected to MongoDB");
  return db;
}

function getCollection(name) {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db.collection(name);
}

// Lazy collection getters — only resolve after connectDB() runs
const collections = {
  users: () => getCollection("users"),
  ideas: () => getCollection("ideas"),
  comments: () => getCollection("comments"),
  bookmarks: () => getCollection("bookmarks"),
};

module.exports = { connectDB, collections };
