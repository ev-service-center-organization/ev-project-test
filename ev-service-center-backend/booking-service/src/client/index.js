import 'dotenv/config';
import app, { sequelize } from './src/app.js';

const PORT = process.env.PORT || 5002;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Đã thông kết nối với MySQL (Pass: 1234)!');

        // force: true sẽ xóa bảng cũ (nếu có) và tạo lại bảng mới hoàn toàn
        await sequelize.sync({ force: true }); 
        console.log('✅ Bảng "appointments" đã được xây lại xong!');

        app.listen(PORT, () => {
            console.log(`🚀 Booking Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động:', error.message);
        process.exit(1);
    }
};

startServer();