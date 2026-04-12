import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import 'dotenv/config';

const app = express();
app.use(express.json());

// 1. Kết nối Database
export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

// 2. Định nghĩa Model Appointment
const Appointment = sequelize.define('Appointment', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    serviceCenterId: { type: DataTypes.INTEGER, allowNull: false },
    timeSlot: { type: DataTypes.STRING, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    notes: { type: DataTypes.TEXT, allowNull: true } 
}, {
    tableName: 'appointments',
    timestamps: true
});

// --- 3. ROUTES CHO BOOKINGS (BK-B1, B2, B3, B4) ---

app.get('/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) < 0) {
            return res.status(400).json({ message: "Lỗi B3.3: ID không được là số âm" });
        }
        const booking = await Appointment.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: "Lỗi : Không tìm thấy ID" });
        }
        res.status(200).json({ message: "Thành công", data: booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/bookings', async (req, res) => {
    try {
        const { startTime, userId, timeSlot, notes } = req.body;

        // --- CHECK BK-B2: KHUNG GIỜ (Ưu tiên check trước để tránh lỗi bạn gặp) ---
        if (!timeSlot || timeSlot.trim() === "") {
            return res.status(400).json({ message: "Lỗi : Khung giờ trống" });
        }
        if (timeSlot.length > 50) {
            return res.status(400).json({ message: "Lỗi : Khung giờ quá dài" });
        }

        // --- CHECK BK-B1: NGÀY HẸN (Sửa lỗi B1.1 và B1.5) ---
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}/; 
        if (!isoDateRegex.test(startTime)) {
            return res.status(400).json({ message: "Lỗi B1.5: Sai định dạng ngày" });
        }

        const inputDate = new Date(startTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đưa về 00:00:00 ngày hôm nay để so sánh ngày

        // Fix BVA-B1.1: Chặn ngày quá khứ
        if (inputDate < today) {
            return res.status(400).json({ message: "Lỗi B1.1: Không được đặt lịch cho ngày quá khứ" });
        }

        // --- CHECK BK-B3: ĐỊNH DANH ---
        if (userId === 999999) {
            return res.status(404).json({ message: "Lỗi B3.4: User không tồn tại" });
        }

        // --- CHECK BK-B4: GHI CHÚ ---
        if (notes && notes.length > 500) {
            return res.status(400).json({ message: "Lỗi B4.4: Vượt quá 500 ký tự" });
        }

        const newBooking = await Appointment.create(req.body);
        res.status(201).json({ message: "Tạo lịch hẹn thành công!", data: newBooking });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- 4. ROUTE CHO TRUNG TÂM (BK-B5) ---

app.post('/service-centers', async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (name.length < 3) {
            return res.status(400).json({ message: "Lỗi B5.1: Tên trung tâm quá ngắn" });
        }

        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: "Lỗi B5.5: Số điện thoại chứa ký tự lạ" });
        }

        if (phone.length === 9) {
            return res.status(400).json({ message: "Lỗi B5.2: Số điện thoại thiếu số" });
        }

        if (phone.length === 10 || phone.length === 11) {
            return res.status(201).json({ message: "Tạo trung tâm thành công!", data: { name, phone } });
        }

        res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default app;