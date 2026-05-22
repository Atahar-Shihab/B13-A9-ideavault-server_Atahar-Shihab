const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");

// GET /interactions/:email — ideas the user has commented on
exports.listForUser = async (req, res) => {
  if (req.user.email !== req.params.email)
    return res.status(403).json({ message: "Forbidden" });

  const comments = await collections
    .comments()
    .find({ userEmail: req.params.email })
    .toArray();
  const ideaIds = [...new Set(comments.map((c) => c.ideaId))];
  const ideas = await Promise.all(
    ideaIds.map((id) =>
      collections.ideas().findOne({ _id: new ObjectId(id) }).catch(() => null)
    )
  );
  res.json(ideas.filter(Boolean));
};
