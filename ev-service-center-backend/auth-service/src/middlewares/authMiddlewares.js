import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // 1. Check header tồn tại
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  // 2. Check đúng format Bearer
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = parts[1];

  // 2a. Allow internal service token bypass
  if (process.env.INTERNAL_SERVICE_TOKEN && token === process.env.INTERNAL_SERVICE_TOKEN) {
    req.userId = null;
    req.userRole = 'service';
    return next();
  }

  // 3. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.status(403).json({
        message: "Invalid or expired token"
      });
    }

    // 4. Gán thông tin user
    req.userId = decoded.id;
    req.userRole = decoded.role; // nếu có role

    next();
  });
}; 

export const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== "admin" && req.userRole !== "service") {
    return res.status(403).json({
      message: "Forbidden: Admin only"
    });
  }
  next();
};
