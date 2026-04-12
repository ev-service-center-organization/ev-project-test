import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import User from "../models/user.js";
import RefreshToken from "../models/refreshToken.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || username.length < 5 || username.length > 50) {
      return res.status(400).json({
        message: "Username must be between 5 and 50 characters"
      });
    }

    if (!password || password.length < 6 || password.length > 20) {
      return res.status(400).json({
        message: "Password must be between 6 and 20 characters"
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    console.log(user);

    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.dataValues.id, role: user.dataValues.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = await RefreshToken.create({
      token: jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }),
      userId: user.id,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({ token, refreshToken: refreshToken.token, user: {
      id: user.id,
      username: user.username,
      email: user.email,
      userRoles: [{ role: { name: user.role } }] },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  // Token rỗng
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  // Check format JWT (3 phần)
  const parts = refreshToken.split(".");
  if (parts.length !== 3) {
    return res.status(403).json({ message: "Invalid token format" });
  }

  // Check tồn tại DB
  const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
  if (!storedToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  // Check hết hạn
  if (storedToken.expiryDate < new Date()) {
    await storedToken.destroy();
    return res.status(401).json({ message: "Refresh token expired" });
  }

  // Tạo access token mới
  const newAccessToken = jwt.sign(
    { id: storedToken.userId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(200).json({ token: newAccessToken });
};

export const indexUsers = async (req, res) => {
  try {
    let { name, username, email, role, page = 1, limit = 10 } = req.query;

    page = Number.parseInt(page, 10);
    limit = Number.parseInt(limit, 10);

    if (isNaN(page) || page < 1) {
      return res.status(400).json({ message: "page must be >= 1" });
    }
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ message: "limit must be >= 1" });
    }
    if (limit > 100) {
      return res.status(400).json({ message: "limit must be <= 100" });
    }
    const whereClause = {};

    if (name) {
      whereClause.username = { [Op.like]: `%${name}%` };
    }

    if (username) {
      whereClause.username = { [Op.like]: `%${username}%` };
    }

    if (email) {
      whereClause.email = { [Op.like]: `%${email}%` };
    }

    if (role) {
      whereClause.role = role;
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const mapped = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      userRoles: [{ role: { name: u.role } }],
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.status(200).json({
      data: mapped,
      total: count,
      page: page,
      limit: limit,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "Invalid ID format",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      userRoles: [{ role: { name: user.role } }],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    let { username, email, password, roles } = req.body;

    // 👉 Trim để tránh "   "
    username = username?.trim();
    email = email?.trim();
    password = password?.trim();

    // 🔥 VALIDATION: rỗng hoặc thiếu
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "username, email, password are required"
      });
    }

    // 🔥 VALIDATION: email dài > 255
    if (email.length > 255) {
      return res.status(400).json({
        message: "email must be <= 255 characters"
      });
    }

    // (Optional nhưng nên có) check username length
    if (username.length > 255) {
      return res.status(400).json({
        message: "username must be <= 255 characters"
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const role = Array.isArray(roles) && roles.length > 0 ? roles[0] : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      userRoles: [{ role: { name: user.role } }],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { username, email, password, roles } = req.body;

    // 👉 Trim nếu là string
    username = username?.trim();
    email = email?.trim();
    password = password?.trim();

    // 🔥 1. Check rỗng (BVA-A7.1)
    if (
      username === undefined &&
      email === undefined &&
      password === undefined &&
      roles === undefined
    ) {
      return res.status(400).json({
        message: "No data provided for update"
      });
    }

    // 🔥 2. Validate BVA cho username
    if (username !== undefined) {
      if (username.length < 5 || username.length > 25) {
        return res.status(400).json({
          message: "Username must be between 5 and 25 characters"
        });
      }
    }

    // 🔥 3. Validate BVA cho email
    if (email !== undefined) {
      if (email.length > 255) {
        return res.status(400).json({
          message: "Email must not exceed 255 characters"
        });
      }
    }

    // 🔥 4. Validate BVA cho password
    if (password !== undefined) {
      if (password.length < 6 || password.length > 20) {
        return res.status(400).json({
          message: "Password must be between 6 and 20 characters"
        });
      }
    }

    // 🔥 5. Validate roles
    if (roles !== undefined) {
      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({
          message: "Roles must be a non-empty array"
        });
      }
    }

    // 🔎 Tìm user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔄 Update
    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (roles !== undefined) user.role = roles[0];
    if (password !== undefined) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      userRoles: [{ role: { name: user.role } }],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.destroy();
    return res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { year } = req.query;

    const currentYear = new Date().getFullYear();

    // 👉 Validate year
    const selectedYear = year ? parseInt(year) : currentYear;

    if (selectedYear > currentYear) {
      return res.status(400).json({
        message: "Year cannot be in the future"
      });
    }

    if (selectedYear < 1900) {
      return res.status(400).json({
        message: "Year is too old"
      });
    }

    const totalUsers = await User.count();

    const monthlyUserStats = await User.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(selectedYear, 0, 1),
          [Op.lt]: new Date(selectedYear + 1, 0, 1)
        }
      },
      group: [sequelize.fn('MONTH', sequelize.col('createdAt'))],
      order: [[sequelize.fn('MONTH', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    const monthlyUsers = new Array(12).fill(0);
    monthlyUserStats.forEach(stat => {
      const monthIndex = parseInt(stat.month) - 1;
      monthlyUsers[monthIndex] = parseInt(stat.count);
    });

    return res.status(200).json({
      year: selectedYear,
      totalUsers,
      monthlyUsers
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
