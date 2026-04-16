import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";

import sequelize from "./config/db.js";
import User from "./models/user.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);

sequelize.sync()
  .then(async () => {
    console.log(" Database synced");

    const [admin, created] = await User.findOrCreate({
      where: { email: "Admin001@gmail.com" },
      defaults: {
        username: "Admin001",
        password: await bcrypt.hash("123456", 10),
        role: "admin"
      }
    });

    if (created) {
      console.log("✅ Default admin user created: Admin001@gmail.com");
    }
  })
  .catch(err => console.error(" Sync error:", err));

export default app;
