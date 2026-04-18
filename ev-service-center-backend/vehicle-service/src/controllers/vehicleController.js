import Vehicle from '../models/vehicle.js';
import Reminder from '../models/remider.js';
import { Op } from 'sequelize';

export const getAllVehicles = async (req, res) => {
  try {
    // Không lấy userId từ req.query ngay từ đầu nữa để tránh bị ghi đè
    const { keyword } = req.query; 
    
    // Lấy thông tin user hiện tại từ token (đã được middleware authenticate gán vào req.user)
    const currentUser = req.user; 
    
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

    // 🔥 LOGIC PHÂN QUYỀN BẢO MẬT 🔥
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (currentUser.role === 'user') {
      // 1. Nếu là Khách hàng (role = 'user'): Ép buộc chỉ tìm xe có userId trùng với ID của họ
      whereClause.userId = currentUser.id;
    } else {
      // 2. Nếu là Admin hoặc Nhân viên: 
      // Có thể lấy toàn bộ, hoặc lọc theo một userId cụ thể nếu Frontend có truyền lên
      if (req.query.userId) {
        whereClause.userId = parseInt(req.query.userId);
      }
    }

    // Xử lý tìm kiếm theo keyword (nếu có)
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
    const { userId, brand, model, year } = req.body;

    // --- Validation cho Brand ---
    // TC 6 & 10: Không được null hoặc để trống
    if (brand === undefined || brand === null || String(brand).trim() === "") {
      return res.status(400).json({ message: "Brand is required and cannot be empty" });
    }
    // TC 9: Giới hạn độ dài Max = 50
    if (brand.length > 50) {
      return res.status(400).json({ message: "Brand name exceeds maximum length (50 characters)" });
    }

    // --- Validation cho Model ---
    // TC 11 & 15: Không được null hoặc để trống
    if (model === undefined || model === null || String(model).trim() === "") {
      return res.status(400).json({ message: "Model is required and cannot be empty" });
    }
    // TC 14: Giới hạn độ dài Max = 50
    if (model.length > 50) {
      return res.status(400).json({ message: "Model name exceeds maximum length (50 characters)" });
    }
    if (userId === undefined || userId === null || userId === "") {
      return res.status(400).json({ message: "userId is required" });
    }

    const userIdNum = parseInt(userId);

    // Kiểm tra phải là định dạng số
    if (isNaN(userIdNum)) {
      return res.status(400).json({ message: "userId must be a valid number" });
    }

    // TC 21: Kiểm tra giá trị biên dưới (userId < 1)
    if (userIdNum < 1) {
      return res.status(400).json({ message: "userId must be a positive integer" });
    }

    // Nếu hợp lệ, tiến hành tạo mới
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json({
      data: newVehicle,
      message: 'Vehicle created successfully'
    });
  } catch (err) {
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

// File: ev-service-center-backend/vehicle-service/src/controllers/vehicleController.js

export const addReminder = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Reminder date is required" });
    }

    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh chính xác

    const hundredYearsLater = new Date();
    hundredYearsLater.setFullYear(today.getFullYear() + 100);

    // 1. Kiểm tra ngày ở quá khứ (Min-)
    if (inputDate < today) {
      return res.status(400).json({ message: "Date cannot be in the past" });
    }

    // 2. Kiểm tra giới hạn 100 năm (Max+)
    if (inputDate > hundredYearsLater) {
      return res.status(400).json({ message: "Date cannot exceed 100 years from now" });
    }

    // Nếu hợp lệ (Min, Nominal, Max), tiến hành tạo mới
    const reminder = await Reminder.create({
      vehicleId: req.params.vehicle_id,
      ...req.body,
    });
    
    res.status(201).json({
      data: reminder,
      message: 'Reminder created successfully'
    });
  } catch (err) {
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
