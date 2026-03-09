import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable in .env.local",
  );
}

/**
 * Global cache to reuse the connection across hot reloads in development.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log("✅ MongoDB: using existing connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
        dbName: "tedx",
        serverSelectionTimeoutMS: 5000, // fail fast — 5s instead of default 30s
        connectTimeoutMS: 5000,
      })
      .then((m) => {
        console.log(`✅ MongoDB connected successfully`);
        return m;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        if (err.code === "ECONNREFUSED" || err.message.includes("querySrv")) {
          console.error(
            "   ↳ Tip: Check your MONGO_URI in .env.local — make sure\n" +
              "     the username & password are your Atlas DATABASE USER\n" +
              "     credentials (Security → Database Access), NOT your Atlas login.",
          );
        }
        cached.promise = null; // reset so next request retries
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
