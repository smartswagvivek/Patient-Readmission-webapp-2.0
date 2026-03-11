import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "patient-readmission-dev-secret";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      error: {
        message: "Authentication required. Provide a valid Bearer token.",
      },
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
    return next();
  } catch {
    return res.status(401).json({
      error: {
        message: "Invalid or expired token. Please login again.",
      },
    });
  }
}

