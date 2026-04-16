import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./config/db.js";
import partRoutes from "./routes/partRoutes.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/inventory/parts", partRoutes);

sequelize
  .authenticate()
  .then(async () => {
    try {
      await sequelize.query(
        "ALTER TABLE `PartsUsages` DROP FOREIGN KEY IF EXISTS `PartsUsages_ibfk_1`;"
      );
    } catch (cleanupError) {
      console.warn("Inventory DB cleanup warning:", cleanupError.message || cleanupError);
    }

    return sequelize.sync({ alter: true });
  })
  .then(() => console.log("✅ Inventory DB synced"))
  .catch((error) => console.error("Inventory DB sync failed:", error));

export default app;
