const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

let jwks;

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL("/api/auth/jwks", process.env.AUTH_URL));
    }
    const { payload } = await jwtVerify(token, jwks);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
