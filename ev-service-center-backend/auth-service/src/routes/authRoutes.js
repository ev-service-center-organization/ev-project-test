import express from "express";
import {
  register,
  login,
  refresh,
  indexUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} from "../controllers/authController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// ===== PROTECTED ROUTES =====

// user management
router.get("/users", authenticate, indexUsers);
router.get("/users/:id", authenticate, getUserById);
router.post("/users", authenticate, authorizeAdmin, createUser);
router.patch("/users/:id", authenticate, authorizeAdmin, updateUser);
router.delete("/users/:id", authenticate, authorizeAdmin, deleteUser);

// statistics
router.get("/stats/users", authenticate, authorizeAdmin, getUserStats);

export default router;
