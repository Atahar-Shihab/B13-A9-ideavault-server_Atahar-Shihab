const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const ideaRoutes = require("./routes/idea.routes");
const commentRoutes = require("./routes/comment.routes");
const bookmarkRoutes = require("./routes/bookmark.routes");
const interactionRoutes = require("./routes/interaction.routes");

const app = express();

// ── CORS (multi-origin support via comma-separated CLIENT_URL) ──
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

// ── Routes ──
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/ideas", ideaRoutes);
app.use("/comments", commentRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/interactions", interactionRoutes);

app.get("/", (req, res) => res.send("IdeaVault API is running"));

module.exports = app;
