// One-off script to add random likes arrays to existing seeded ideas
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const sampleEmails = [
  "alice@example.com","bob@example.com","carol@example.com","dan@example.com",
  "eve@example.com","frank@example.com","gina@example.com","hank@example.com",
  "ivy@example.com","jack@example.com","kate@example.com","leo@example.com",
  "maya@example.com","noah@example.com","olivia@example.com","peter@example.com",
];

const randomLikes = (min, max) => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return sampleEmails.slice(0, count);
};

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    const ideasCol = client.db("ideaVaultDB").collection("ideas");
    const ideas = await ideasCol.find({}).toArray();
    let updated = 0;
    for (const idea of ideas) {
      if (!idea.likes || idea.likes.length === 0) {
        const likes = randomLikes(3, 13);
        await ideasCol.updateOne({ _id: idea._id }, { $set: { likes } });
        updated++;
      }
    }
    console.log(`✅ Backfilled likes for ${updated} ideas`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
