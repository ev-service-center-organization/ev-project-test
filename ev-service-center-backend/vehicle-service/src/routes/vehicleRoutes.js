import express from 'express';
import { authenticate } from '../middlewares/authMiddlewares.js';
import {
  getAllVehicles,
  getVehicleById,
  getVehiclesByUserId,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addReminder,
  getReminders,
} from '../controllers/vehicleController.js';

const router = express.Router();

// Áp dụng cho toàn bộ route bên dưới nếu muốn bảo mật tất cả
// router.use(authenticate); 

router.get('/', authenticate, getAllVehicles);
router.get('/user/:userId', authenticate, getVehiclesByUserId);
router.get('/:id', authenticate, getVehicleById);
router.post('/', authenticate, createVehicle);
router.put('/:id', authenticate, updateVehicle);
router.delete('/:id', authenticate, deleteVehicle);

router.post('/:vehicle_id/reminders', authenticate, addReminder);
router.get('/:vehicle_id/reminders', authenticate, getReminders);

export default router;