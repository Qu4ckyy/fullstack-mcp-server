import { MongoClient } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

let productionClientPromise: Promise<MongoClient> | undefined;

function createClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Brakuje zmiennej środowiskowej MONGODB_URI.");
  }

  return new MongoClient(uri).connect();
}

function getClientPromise() {
  if (process.env.NODE_ENV === "development") {
    globalForMongo.mongoClientPromise ??= createClientPromise();
    return globalForMongo.mongoClientPromise;
  }

  productionClientPromise ??= createClientPromise();
  return productionClientPromise;
}

export async function getDatabase() {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB ?? "technischools");
}
