import ServiceCenter from '../models/serviceCenter.js';
import { Op } from 'sequelize';

export const getAllServiceCenters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { keyword } = req.query;

    const whereClause = {};
    if (keyword) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { address: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { rows, count } = await ServiceCenter.findAndCountAll({
      where: whereClause,
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

export const getServiceCenterById = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByPk(req.params.id);
    if (!serviceCenter) return res.status(404).json({ message: 'Service center not found' });
    res.status(200).json({
      data: serviceCenter
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createServiceCenter = async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ message: 'Lỗi B5.1: Tên trung tâm quá ngắn' });
    }

    if (!phone) {
      return res.status(400).json({ message: 'Số điện thoại là bắt buộc' });
    }

    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Lỗi B5.5: Số điện thoại chứa ký tự lạ' });
    }

    if (phone.length === 9) {
      return res.status(400).json({ message: 'Lỗi B5.2: Số điện thoại thiếu số' });
    }

    if (phone.length !== 10 && phone.length !== 11) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    }

    const created = await ServiceCenter.create({ name, address, phone });
    res.status(201).json({
      data: created,
      message: 'Service center created successfully'
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateServiceCenter = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByPk(req.params.id);
    if (!serviceCenter) return res.status(404).json({ message: 'Service center not found' });

    await serviceCenter.update(req.body);
    res.status(200).json({
      data: serviceCenter,
      message: 'Service center updated successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteServiceCenter = async (req, res) => {
  try {
    const serviceCenter = await ServiceCenter.findByPk(req.params.id);
    if (!serviceCenter) return res.status(404).json({ message: 'Service center not found' });

    await serviceCenter.destroy();
    res.status(200).json({ 
      message: 'Service center deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


