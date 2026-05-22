const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");

// POST /ideas
exports.create = async (req, res) => {
  const idea = {
    ...req.body,
    authorEmail: req.user.email,
    authorName: req.user.name,
    authorPhotoURL: req.user.photoURL || "",
    commentCount: 0,
    likes: [],
    createdAt: new Date(),
  };
  const result = await collections.ideas().insertOne(idea);
  res.json(result);
};

// GET /ideas — search, category, date range filters
exports.list = async (req, res) => {
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
  const ideas = await collections.ideas().find(query).sort({ createdAt: -1 }).toArray();
  res.json(ideas);
};

// GET /ideas/trending — top 6 by (likes*3 + comments*2 + recency)
exports.trending = async (req, res) => {
  const ideas = await collections
    .ideas()
    .aggregate([
      {
        $addFields: {
          ageDays: {
            $divide: [{ $subtract: ["$$NOW", "$createdAt"] }, 1000 * 60 * 60 * 24],
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
};

// GET /ideas/my/:email
exports.myIdeas = async (req, res) => {
  if (req.user.email !== req.params.email)
    return res.status(403).json({ message: "Forbidden" });
  const ideas = await collections
    .ideas()
    .find({ authorEmail: req.params.email })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(ideas);
};

// GET /ideas/:id
exports.getOne = async (req, res) => {
  const idea = await collections.ideas().findOne({ _id: new ObjectId(req.params.id) });
  if (!idea) return res.status(404).json({ message: "Idea not found" });
  res.json(idea);
};

// PUT /ideas/:id
exports.update = async (req, res) => {
  const idea = await collections.ideas().findOne({ _id: new ObjectId(req.params.id) });
  if (!idea) return res.status(404).json({ message: "Not found" });
  if (idea.authorEmail !== req.user.email)
    return res.status(403).json({ message: "Forbidden" });

  const { _id, ...updates } = req.body;
  const result = await collections
    .ideas()
    .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
  res.json(result);
};

// DELETE /ideas/:id
exports.remove = async (req, res) => {
  const idea = await collections.ideas().findOne({ _id: new ObjectId(req.params.id) });
  if (!idea) return res.status(404).json({ message: "Not found" });
  if (idea.authorEmail !== req.user.email)
    return res.status(403).json({ message: "Forbidden" });

  const result = await collections.ideas().deleteOne({ _id: new ObjectId(req.params.id) });
  await collections.comments().deleteMany({ ideaId: req.params.id });
  res.json(result);
};

// POST /ideas/:id/like — toggle
exports.toggleLike = async (req, res) => {
  const idea = await collections.ideas().findOne({ _id: new ObjectId(req.params.id) });
  if (!idea) return res.status(404).json({ message: "Not found" });

  const email = req.user.email;
  const liked = (idea.likes || []).includes(email);
  const update = liked ? { $pull: { likes: email } } : { $addToSet: { likes: email } };
  await collections.ideas().updateOne({ _id: new ObjectId(req.params.id) }, update);
  res.json({ liked: !liked });
};
