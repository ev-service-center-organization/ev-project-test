import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Vehicle = sequelize.define('Vehicle', {
id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  licensePlate: { 
    type: DataTypes.STRING(10), // Giới hạn cứng 10 ký tự ở tầng Database
    allowNull: false, 
    unique: true,
    validate: {
      len: {
        args: [7, 9],
        msg: "Biển số xe phải từ 7 đến 10 ký tự"
      }
    }
  },
  brand: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING },
  year: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});

export default Vehicle;
