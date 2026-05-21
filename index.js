require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const port = process.env.PORT || 5000;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Support multiple origins (comma-separated CLIENT_URL env)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ── Middleware ────────────────────────────────────────────────────────────────
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = decoded;
    next();
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signAndSend = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  return res.cookie("token", token, cookieOptions).json({
    user: payload,
  });
};

// ── DB ────────────────────────────────────────────────────────────────────────
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("ideaVaultDB");
    const usersCol = db.collection("users");
    const ideasCol = db.collection("ideas");
    const commentsCol = db.collection("comments");
    const bookmarksCol = db.collection("bookmarks");

    console.log("Connected to MongoDB");

    // ── Auth ──────────────────────────────────────────────────────────────────

    app.post("/auth/register", async (req, res) => {
      const { name, email, photoURL, password } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" });

      const existing = await usersCol.findOne({ email });
      if (existing)
        return res.status(409).json({ message: "Email already registered" });

      const hashedPassword = await argon2.hash(password);
      const newUser = {
        name,
        email,
        photoURL: photoURL || "",
        password: hashedPassword,
        provider: "email",
        createdAt: new Date(),
      };
      await usersCol.insertOne(newUser);
      return signAndSend(res, { name, email, photoURL: photoURL || "" });
    });

    app.post("/auth/login", async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const user = await usersCol.findOne({ email });
      if (!user || user.provider !== "email")
        return res.status(401).json({ message: "Invalid credentials" });

      const valid = await argon2.verify(user.password, password);
      if (!valid)
        return res.status(401).json({ message: "Invalid credentials" });

      return signAndSend(res, {
        name: user.name,
        email: user.email,
        photoURL: user.photoURL || "",
      });
    });

    app.post("/auth/google", async (req, res) => {
      const { credential } = req.body;
      if (!credential)
        return res.status(400).json({ message: "Credential required" });

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { name, email, picture } = ticket.getPayload();

      const existing = await usersCol.findOne({ email });
      if (!existing) {
        await usersCol.insertOne({
          name,
          email,
          photoURL: picture,
          provider: "google",
          createdAt: new Date(),
        });
      }

      return signAndSend(res, { name, email, photoURL: picture });
    });

    app.post("/auth/logout", (req, res) => {
      res.clearCookie("token", cookieOptions).json({ success: true });
    });

    app.get("/auth/me", verifyToken, (req, res) => {
      res.json({ user: req.user });
    });

    // ── Users ─────────────────────────────────────────────────────────────────

    app.patch("/users/:email", verifyToken, async (req, res) => {
      if (req.user.email !== req.params.email)
        return res.status(403).json({ message: "Forbidden" });
      const { name, photoURL } = req.body;
      const result = await usersCol.updateOne(
        { email: req.params.email },
        { $set: { name, photoURL } }
      );
      // Re-issue token with updated info
      return signAndSend(res, {
        name,
        email: req.params.email,
        photoURL: photoURL || "",
      });
    });

    // ── Ideas ─────────────────────────────────────────────────────────────────

    app.post("/ideas", verifyToken, async (req, res) => {
      const idea = {
        ...req.body,
        authorEmail: req.user.email,
        authorName: req.user.name,
        commentCount: 0,
        likes: [],
        createdAt: new Date(),
      };
      const result = await ideasCol.insertOne(idea);
      res.json(result);
    });

    app.get("/ideas", async (req, res) => {
      const { search, category, dateFrom, dateTo } = req.query;
      const query = {};
      if (search) query.title = { $regex: search, $options: "i" };
      if (category && category !== "all") query.category = category;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) {
          const end = new Date(dateTo);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }
      const ideas = await ideasCol
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
      res.json(ideas);
    });

    app.get("/ideas/trending", async (req, res) => {
      // Trending = (likes * 3) + (comments * 2) + recency boost
      const ideas = await ideasCol
        .aggregate([
          {
            $addFields: {
              ageDays: {
                $divide: [
                  { $subtract: ["$$NOW", "$createdAt"] },
                  1000 * 60 * 60 * 24,
                ],
              },
              likeCount: { $size: { $ifNull: ["$likes", []] } },
            },
          },
          {
            $addFields: {
              trendingScore: {
                $add: [
                  { $multiply: ["$likeCount", 3] },
                  { $multiply: [{ $ifNull: ["$commentCount", 0] }, 2] },
                  {
                    $cond: [
                      { $lte: ["$ageDays", 7] }, 15,
                      { $cond: [{ $lte: ["$ageDays", 30] }, 7, 0] },
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { trendingScore: -1, createdAt: -1 } },
          { $limit: 6 },
        ])
        .toArray();
      res.json(ideas);
    });

    // Toggle Like
    app.post("/ideas/:id/like", verifyToken, async (req, res) => {
      const idea = await ideasCol.findOne({ _id: new ObjectId(req.params.id) });
      if (!idea) return res.status(404).json({ message: "Not found" });
      const email = req.user.email;
      const liked = (idea.likes || []).includes(email);
      const update = liked
        ? { $pull: { likes: email } }
        : { $addToSet: { likes: email } };
      await ideasCol.updateOne({ _id: new ObjectId(req.params.id) }, update);
      res.json({ liked: !liked });
    });

    app.get("/ideas/my/:email", verifyToken, async (req, res) => {
      if (req.user.email !== req.params.email)
        return res.status(403).json({ message: "Forbidden" });
      const ideas = await ideasCol
        .find({ authorEmail: req.params.email })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(ideas);
    });

    app.get("/ideas/:id", verifyToken, async (req, res) => {
      const idea = await ideasCol.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!idea) return res.status(404).json({ message: "Idea not found" });
      res.json(idea);
    });

    app.put("/ideas/:id", verifyToken, async (req, res) => {
      const idea = await ideasCol.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!idea) return res.status(404).json({ message: "Not found" });
      if (idea.authorEmail !== req.user.email)
        return res.status(403).json({ message: "Forbidden" });
      const { _id, ...updates } = req.body;
      const result = await ideasCol.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updates }
      );
      res.json(result);
    });

    app.delete("/ideas/:id", verifyToken, async (req, res) => {
      const idea = await ideasCol.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!idea) return res.status(404).json({ message: "Not found" });
      if (idea.authorEmail !== req.user.email)
        return res.status(403).json({ message: "Forbidden" });
      const result = await ideasCol.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      await commentsCol.deleteMany({ ideaId: req.params.id });
      res.json(result);
    });

    // ── Comments ──────────────────────────────────────────────────────────────

    app.post("/comments", verifyToken, async (req, res) => {
      const comment = {
        ...req.body,
        userEmail: req.user.email,
        userName: req.user.name,
        createdAt: new Date(),
      };
      const result = await commentsCol.insertOne(comment);
      await ideasCol.updateOne(
        { _id: new ObjectId(comment.ideaId) },
        { $inc: { commentCount: 1 } }
      );
      res.json(result);
    });

    app.get("/comments/:ideaId", async (req, res) => {
      const comments = await commentsCol
        .find({ ideaId: req.params.ideaId })
        .sort({ createdAt: -1 })
        .toArray();
      res.json(comments);
    });

    app.put("/comments/:id", verifyToken, async (req, res) => {
      const comment = await commentsCol.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!comment) return res.status(404).json({ message: "Not found" });
      if (comment.userEmail !== req.user.email)
        return res.status(403).json({ message: "Forbidden" });
      const result = await commentsCol.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { text: req.body.text } }
      );
      res.json(result);
    });

    app.delete("/comments/:id", verifyToken, async (req, res) => {
      const comment = await commentsCol.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!comment) return res.status(404).json({ message: "Not found" });
      if (comment.userEmail !== req.user.email)
        return res.status(403).json({ message: "Forbidden" });
      await commentsCol.deleteOne({ _id: new ObjectId(req.params.id) });
      await ideasCol.updateOne(
        { _id: new ObjectId(comment.ideaId) },
        { $inc: { commentCount: -1 } }
      );
      res.json({ success: true });
    });

    // ── Bookmarks ─────────────────────────────────────────────────────────────

    app.post("/bookmarks", verifyToken, async (req, res) => {
      const { ideaId } = req.body;
      const existing = await bookmarksCol.findOne({
        userEmail: req.user.email,
        ideaId,
      });
      if (existing)
        return res.status(409).json({ message: "Already bookmarked" });
      await bookmarksCol.insertOne({
        userEmail: req.user.email,
        ideaId,
        createdAt: new Date(),
      });
      res.json({ success: true });
    });

    app.delete("/bookmarks/:ideaId", verifyToken, async (req, res) => {
      await bookmarksCol.deleteOne({
        userEmail: req.user.email,
        ideaId: req.params.ideaId,
      });
      res.json({ success: true });
    });

    app.get("/bookmarks/:email", verifyToken, async (req, res) => {
      if (req.user.email !== req.params.email)
        return res.status(403).json({ message: "Forbidden" });
      const bookmarks = await bookmarksCol
        .find({ userEmail: req.params.email })
        .sort({ createdAt: -1 })
        .toArray();
      const ideas = await Promise.all(
        bookmarks.map((b) =>
          ideasCol.findOne({ _id: new ObjectId(b.ideaId) }).catch(() => null)
        )
      );
      res.json(ideas.filter(Boolean));
    });

    app.get("/bookmarks/check/:email", verifyToken, async (req, res) => {
      if (req.user.email !== req.params.email)
        return res.status(403).json({ message: "Forbidden" });
      const bookmarks = await bookmarksCol
        .find({ userEmail: req.params.email })
        .project({ ideaId: 1, _id: 0 })
        .toArray();
      res.json(bookmarks.map((b) => b.ideaId));
    });

    // ── Interactions ──────────────────────────────────────────────────────────

    app.get("/interactions/:email", verifyToken, async (req, res) => {
      if (req.user.email !== req.params.email)
        return res.status(403).json({ message: "Forbidden" });
      const comments = await commentsCol
        .find({ userEmail: req.params.email })
        .toArray();
      const ideaIds = [...new Set(comments.map((c) => c.ideaId))];
      const ideas = await Promise.all(
        ideaIds.map((id) =>
          ideasCol
            .findOne({ _id: new ObjectId(id) })
            .catch(() => null)
        )
      );
      res.json(ideas.filter(Boolean));
    });

    app.get("/", (req, res) => res.send("IdeaVault API is running"));
  } catch (err) {
    console.error(err);
  }
}

run();

app.listen(port, () => console.log(`Server running on port ${port}`));
