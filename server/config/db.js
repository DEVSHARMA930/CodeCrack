const mongoose = require("mongoose");
const env = require("./env");

let isConnected = false;
let activeUri = "";

async function connectToDatabase(uri = env.mongodbUri) {
  if (isConnected && activeUri === uri) {
    return mongoose.connection;
  }

  if (isConnected && activeUri !== uri) {
    await mongoose.disconnect();
    isConnected = false;
  }

  // Assumption: this app runs as a long-lived web server with moderate concurrency.
  // Pool values are conservative defaults and can be tuned using production metrics.
  const connection = await mongoose.connect(uri, {
    maxPoolSize: 50,
    minPoolSize: 10,
    maxIdleTimeMS: 5 * 60 * 1000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000
  });

  isConnected = true;
  activeUri = uri;

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    activeUri = "";
    console.warn("MongoDB disconnected");
  });

  return connection;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  isConnected = false;
  activeUri = "";
}

module.exports = {
  connectToDatabase,
  disconnectDatabase
};
