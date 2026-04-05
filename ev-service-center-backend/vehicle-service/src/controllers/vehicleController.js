import Vehicle from '../models/vehicle.js';
import Reminder from '../models/remider.js';
import { Op } from 'sequelize';

export const getAllVehicles = async (req, res) => {
  try {
    const { keyword, userId } = req.query;
    
    // Lấy giá trị limit từ query, mặc định là 10
    let limit = parseInt(req.query.limit);
    
    // STT 1: Nếu limit <= 0 hoặc không phải số, đặt mặc định là 10
    if (!limit || limit <= 0) {
      limit = 10;
    }
    
    // STT 4: Nếu vượt quá giới hạn hệ thống (100), cắt về 100
    if (limit > 100) {
      limit = 100;
    }

    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (userId) {
      whereClause.userId = parseInt(userId);
    }
    if (keyword) {
      whereClause[Op.or] = [
        { licensePlate: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } },
        { model: { [Op.like]: `%${keyword}%` } },
        { year: { [Op.like]: `%${keyword}%` } },
      ];
    }

   const { rows, count } = await Vehicle.findAndCountAll({
      where: whereClause,
      include: Reminder,
      limit, // Sử dụng limit đã được xử lý
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      limit, // Trả về limit thực tế đã áp dụng
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, { include: Reminder });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.status(200).json({
      data: vehicle
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVehiclesByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // STT 3: Kiểm tra User ID âm hoặc không phải số hợp lệ
    if (isNaN(userId) || userId < 0) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Vehicle.findAndCountAll({
      where: { userId: userId },
      include: Reminder,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1
    });
  } catch (err) {
    // Trả về 500 cho các lỗi hệ thống khác
    res.status(500).json({ message: err.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json({
      data: newVehicle,
      message: 'Vehicle created successfully'
    });
  } catch (err) {
    // Nếu là lỗi validation từ Sequelize, trả về message cụ thể
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: err.errors.map(e => e.message).join(', ') 
      });
    }
    res.status(400).json({ message: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Thực hiện cập nhật dữ liệu từ body
    await vehicle.update(req.body);

    res.status(200).json({
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (err) {
    // Nếu vi phạm ràng buộc về năm (min/max) hoặc độ dài biển số (len)
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: err.errors.map(e => e.message).join(', ') 
      });
    }
    // Các lỗi khác trả về 500
    res.status(500).json({ message: err.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // STT 1: Kiểm tra ID không hợp lệ (ví dụ: số âm)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid Vehicle ID' });
    }

    const vehicle = await Vehicle.findByPk(id);

    // Trả về 404 nếu không tìm thấy xe (Dành cho STT 1 hoặc STT 3 khi ID không tồn tại)
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await vehicle.destroy();
    res.status(200).json({ 
      message: 'Vehicle deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create({
      vehicleId: req.params.vehicle_id,
      ...req.body,
    });
    res.status(201).json({
      data: reminder,
      message: 'Reminder created successfully'
    });
  } catch (err) {
    // Bắt lỗi độ dài message hoặc các lỗi validation khác từ Sequelize
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: err.errors.map(e => e.message).join(', ') 
      });
    }
    // Bắt lỗi dữ liệu quá dài ở tầng Database (MySQL)
    if (err.parent?.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({ message: "Nội dung vượt quá giới hạn 255 ký tự" });
    }
    res.status(400).json({ message: err.message });
  }
};
export const getReminders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { rows, count } = await Reminder.findAndCountAll({
      where: { vehicleId: req.params.vehicle_id },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      hasNext: offset + limit < count,
      hasPrev: page > 1
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
