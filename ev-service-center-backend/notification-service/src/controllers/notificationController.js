import Notification from '../models/notification.js';

const getPagination = (query) => {
  const page = parseInt(query.page);
  const limit = parseInt(query.limit);

  const finalPage = (isNaN(page) || page < 1) ? 1 : page;

  let finalLimit = isNaN(limit) ? 10 : Math.max(0, limit);
  finalLimit = Math.min(finalLimit, 100);

  const offset = (finalPage - 1) * finalLimit;
  return { limit: finalLimit, offset, page: finalPage };
};

export const getAllNotifications = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);

    if (limit === 0) {
      return res.status(200).json({
        data: [], total: 0, page, limit: 0,
        totalPages: 0, hasNext: false, hasPrev: false
      });
    }

    const { rows, count } = await Notification.findAndCountAll({
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

export const getNotifications = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);

    if (limit === 0) {
      return res.status(200).json({
        data: [], total: 0, page, limit: 0,
        totalPages: 0, hasNext: false, hasPrev: false
      });
    }

    const whereClause = {};
    if (req.query.status) whereClause.status = req.query.status;
    if (req.query.userId) whereClause.userId = req.query.userId;

    const { rows, count } = await Notification.findAndCountAll({
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

export const getNotificationsByUser = async (req, res) => {
  try {
    const { limit, offset, page } = getPagination(req.query);

    if (limit === 0) {
      return res.status(200).json({
        data: [], total: 0, page, limit: 0,
        totalPages: 0, hasNext: false, hasPrev: false
      });
    }

    const { rows, count } = await Notification.findAndCountAll({
      where: { userId: req.params.userId },
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

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.update({ status: 'read' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    await notification.destroy();
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
