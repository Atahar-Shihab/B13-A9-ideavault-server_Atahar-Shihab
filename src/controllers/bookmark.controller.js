const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");

// POST /bookmarks
exports.add = async (req, res) => {
  const { ideaId } = req.body;
  const existing = await collections
    .bookmarks()
    .findOne({ userEmail: req.user.email, ideaId });
  if (existing) return res.status(409).json({ message: "Already bookmarked" });

  await collections.bookmarks().insertOne({
    userEmail: req.user.email,
    ideaId,
    createdAt: new Date(),
  });
  res.json({ success: true });
};

// DELETE /bookmarks/:ideaId
exports.remove = async (req, res) => {
  await collections
    .bookmarks()
    .deleteOne({ userEmail: req.user.email, ideaId: req.params.ideaId });
  res.json({ success: true });
};

// GET /bookmarks/:email — full bookmarked ideas
exports.listForUser = async (req, res) => {
  if (req.user.email !== req.params.email)
    return res.status(403).json({ message: "Forbidden" });

  const bookmarks = await collections
    .bookmarks()
    .find({ userEmail: req.params.email })
    .sort({ createdAt: -1 })
    .toArray();
  const ideas = await Promise.all(
    bookmarks.map((b) =>
      collections.ideas().findOne({ _id: new ObjectId(b.ideaId) }).catch(() => null)
    )
  );
  res.json(ideas.filter(Boolean));
};

// GET /bookmarks/check/:email — just the bookmarked idea IDs
exports.check = async (req, res) => {
  if (req.user.email !== req.params.email)
    return res.status(403).json({ message: "Forbidden" });

  const bookmarks = await collections
    .bookmarks()
    .find({ userEmail: req.params.email })
    .project({ ideaId: 1, _id: 0 })
    .toArray();
  res.json(bookmarks.map((b) => b.ideaId));
};
