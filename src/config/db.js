const mongoose = require("mongoose");
const seedDemo = require("../seed/seedDemo");

// Cache em variável global para reaproveitar a conexão entre requests
// (importante na Vercel, onde cada função pode reiniciar).
let cached = global.sactsMongoose;

if (!cached) {
  cached = global.sactsMongoose = { conn: null, promise: null, seeded: false };
}

// Resolve a string de conexão.
// - Se existir MONGODB_URI no .env, usa ela (MongoDB Atlas em produção).
// - Senão, sobe um MongoDB em memória só para a sessão local (sem precisar
//   instalar nada manualmente). Útil para demonstração e desenvolvimento.
async function resolveUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  console.warn("[SACTS] MONGODB_URI não configurada — subindo MongoDB em memória (somente local).");
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const mem = await MongoMemoryServer.create();
  return mem.getUri();
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = resolveUri().then(uri =>
      mongoose.connect(uri, { bufferCommands: false })
    );
  }

  cached.conn = await cached.promise;

  // Roda o seed automaticamente na primeira conexão.
  // No banco em memória, isso garante dados de exemplo logo de cara.
  if (!cached.seeded) {
    cached.seeded = true;
    await seedDemo(false);
  }

  return cached.conn;
}

module.exports = connectDB;
