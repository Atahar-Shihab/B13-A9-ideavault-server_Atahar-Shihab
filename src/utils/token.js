const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Sign a JWT, set it as an httpOnly cookie, and return the user payload
function signAndSend(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  return res.cookie("token", token, cookieOptions).json({ user: payload });
}

module.exports = { cookieOptions, signAndSend };
