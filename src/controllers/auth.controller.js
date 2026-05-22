const argon2 = require("argon2");
const { OAuth2Client } = require("google-auth-library");
const { collections } = require("../config/db");
const { signAndSend, cookieOptions } = require("../utils/token");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/register
exports.register = async (req, res) => {
  const { name, email, photoURL, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const existing = await collections.users().findOne({ email });
  if (existing)
    return res.status(409).json({ message: "Email already registered" });

  const hashedPassword = await argon2.hash(password);
  await collections.users().insertOne({
    name,
    email,
    photoURL: photoURL || "",
    password: hashedPassword,
    provider: "email",
    createdAt: new Date(),
  });

  return signAndSend(res, { name, email, photoURL: photoURL || "" });
};

// POST /auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await collections.users().findOne({ email });
  if (!user || user.provider !== "email")
    return res.status(401).json({ message: "Invalid credentials" });

  const valid = await argon2.verify(user.password, password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  return signAndSend(res, {
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || "",
  });
};

// POST /auth/google
exports.google = async (req, res) => {
  const { credential } = req.body;
  if (!credential)
    return res.status(400).json({ message: "Credential required" });

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { name, email, picture } = ticket.getPayload();

  const existing = await collections.users().findOne({ email });
  if (!existing) {
    await collections.users().insertOne({
      name,
      email,
      photoURL: picture,
      provider: "google",
      createdAt: new Date(),
    });
  }

  return signAndSend(res, { name, email, photoURL: picture });
};

// POST /auth/logout
exports.logout = (req, res) => {
  res.clearCookie("token", cookieOptions).json({ success: true });
};

// GET /auth/me
exports.me = (req, res) => {
  res.json({ user: req.user });
};
