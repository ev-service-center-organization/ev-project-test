import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import ServiceCenter from './serviceCenter.js';

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  serviceCenterId: { type: DataTypes.INTEGER, allowNull: false },
  vehicleId: { type: DataTypes.INTEGER },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isFutureDate(value) {
        const appointmentDate = new Date(value);
        if (isNaN(appointmentDate.getTime())) {
          throw new Error('Invalid date format');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
          throw new Error('Date must be today or in the future');
        }
      }
    }
  },
  startTime: { type: DataTypes.DATE, allowNull: false, validate: { isDate: true } },
  endTime: { type: DataTypes.DATE, allowNull: false, validate: { isDate: true } },
  timeSlot: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'confirmed', 'cancelled', 'completed']]
    }
  }, // pending | confirmed | cancelled | completed
  notes: { type: DataTypes.STRING(500) },
  createdById: { type: DataTypes.INTEGER, allowNull: false },
}, {
  timestamps: true,
});

ServiceCenter.hasMany(Appointment, { foreignKey: 'serviceCenterId', as: 'appointments' });
Appointment.belongsTo(ServiceCenter, { foreignKey: 'serviceCenterId', as: 'serviceCenter' });

export default Appointment;
