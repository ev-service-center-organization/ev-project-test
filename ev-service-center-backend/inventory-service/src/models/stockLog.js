import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Part from "./part.js";
import { STOCK_CHANGE_TYPE_VALUES } from "../constants/stockConstants.js";

const StockLog = sequelize.define("StockLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  changeType: { type: DataTypes.ENUM(...STOCK_CHANGE_TYPE_VALUES), allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'StockLogs'
});

Part.hasMany(StockLog, { foreignKey: "partId", as: "StockLogs" });
StockLog.belongsTo(Part, { foreignKey: "partId", as: "Part" });

export default StockLog;
