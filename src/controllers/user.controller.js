const { collections } = require("../config/db");
const { signAndSend } = require("../utils/token");

// PATCH /users/:email — update name + photoURL, re-issue token
exports.updateProfile = async (req, res) => {
  if (req.user.email !== req.params.email)
    return res.status(403).json({ message: "Forbidden" });

  const { name, photoURL } = req.body;
  await collections.users().updateOne(
    { email: req.params.email },
    { $set: { name, photoURL } }
  );

  return signAndSend(res, {
    name,
    email: req.params.email,
    photoURL: photoURL || "",
  });
};
