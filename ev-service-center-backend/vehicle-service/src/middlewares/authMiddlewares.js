import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  // 1. Lấy token từ Header Authorization (Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Kiểm tra nếu không có token
  if (!token) {
    return res.status(403).json({ message: "No token provided!" });
  }

  // 3. Xác thực token
  // Đảm bảo process.env.JWT_SECRET trong vehicle-service khớp với auth-service
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ message: "Unauthorized! Invalid or expired token." });
    }

    // 4. Lưu thông tin user vào request để các controller sau có thể sử dụng
    req.userId = decoded.id;
    
    // 5. QUAN TRỌNG: Gọi next() để chuyển sang controller tiếp theo
    next();
  });
};