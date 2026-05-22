const { ObjectId } = require("mongodb");
const { collections } = require("../config/db");

// POST /comments
exports.create = async (req, res) => {
  const comment = {
    ...req.body,
    userEmail: req.user.email,
    userName: req.user.name,
    userPhotoURL: req.user.photoURL || "",
    createdAt: new Date(),
  };
  const result = await collections.comments().insertOne(comment);
  await collections
    .ideas()
    .updateOne({ _id: new ObjectId(comment.ideaId) }, { $inc: { commentCount: 1 } });
  res.json(result);
};

// GET /comments/:ideaId
exports.listForIdea = async (req, res) => {
  const comments = await collections
    .comments()
    .find({ ideaId: req.params.ideaId })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(comments);
};

// PUT /comments/:id
exports.update = async (req, res) => {
  const comment = await collections.comments().findOne({ _id: new ObjectId(req.params.id) });
  if (!comment) return res.status(404).json({ message: "Not found" });
  if (comment.userEmail !== req.user.email)
    return res.status(403).json({ message: "Forbidden" });

  const result = await collections
    .comments()
    .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { text: req.body.text } });
  res.json(result);
};

// DELETE /comments/:id
exports.remove = async (req, res) => {
  const comment = await collections.comments().findOne({ _id: new ObjectId(req.params.id) });
  if (!comment) return res.status(404).json({ message: "Not found" });
  if (comment.userEmail !== req.user.email)
    return res.status(403).json({ message: "Forbidden" });

  await collections.comments().deleteOne({ _id: new ObjectId(req.params.id) });
  await collections
    .ideas()
    .updateOne({ _id: new ObjectId(comment.ideaId) }, { $inc: { commentCount: -1 } });
  res.json({ success: true });
};
