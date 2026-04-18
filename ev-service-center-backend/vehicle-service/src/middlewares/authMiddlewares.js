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
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ message: "Unauthorized! Invalid or expired token." });
    }

    // 4. 🔥 QUAN TRỌNG: Gán thẳng toàn bộ decoded payload vào req.user 🔥
    // Vì token bên Auth-service sinh ra có chứa { id, role } nên decoded sẽ có đủ
    req.user = {
      id: decoded.id,
      role: decoded.role
    };
    
    // Vẫn giữ lại req.userId phòng trường hợp các controller cũ của bạn đang dùng nó
    req.userId = decoded.id;
    
    // 5. Gọi next() để chuyển sang controller tiếp theo
    next();
  });
};