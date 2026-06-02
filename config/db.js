const { MongoClient, ServerApiVersion } = require("mongodb");

// Prefer a full connection string; fall back to composing one from user/pass.
const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client;
let dbInstance;

// The ONLY place that opens a connection. Singleton — call once at startup.
async function connectDB() {
  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
    console.log("Connected successfully to MongoDB");
    dbInstance = client.db(process.env.DB_NAME || "appdb");
  }
  return dbInstance;
}

// Accessor used by controllers: const db = getDB();
function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return dbInstance;
}

module.exports = { connectDB, getDB };
