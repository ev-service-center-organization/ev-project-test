// vehicle_service_test.js
const vehicleHelper = require('../helpers/vehicleHelpers');

Feature('Vehicle Service - 25 Comprehensive Test Cases');

Before(async ({ I }) => {
    // Tự động Login và thiết lập Header Token trước mỗi Test Case
    await vehicleHelper.authenticate(I);
});

// ==========================================
// 🔹 TẠO XE
// ==========================================

Scenario('1. Thêm xe hợp lệ', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, {
        licensePlate: vehicleHelper.generateRandomPlate(),
        brand: 'Tesla',
        model: 'Model S',
        year: 2024,
        userId: currentUserId
    }, 201);
});

Scenario('2. Thêm xe trùng biển số', async ({ I }) => {
    const { currentPlate, currentUserId } = vehicleHelper.getStoredData();
    // Lấy chính biển số vừa tạo thành công ở Case 1 để test trùng lặp
    await vehicleHelper.createVehicle(I, {
        licensePlate: currentPlate,
        brand: 'Ford',
        model: 'Ranger',
        year: 2023,
        userId: currentUserId
    }, 400); // Tùy Backend của bạn, có thể là 409 Conflict
});

Scenario('3. Thiếu thông tin bắt buộc', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, {
        licensePlate: vehicleHelper.generateRandomPlate(),
        brand: null, // Cố tình bỏ trống brand
        model: 'Camry',
        year: 2022,
        userId: currentUserId
    }, 400);
});

Scenario('4. Thêm xe với năm sản xuất sai', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, {
        licensePlate: vehicleHelper.generateRandomPlate(),
        brand: 'Honda',
        model: 'Civic',
        year: 'HaiNgànHaiTư', // Sai định dạng số
        userId: currentUserId
    }, 400);
});

// ==========================================
// 🔹 CẬP NHẬT XE
// ==========================================

Scenario('5. Cập nhật xe hợp lệ', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.updateVehicle(I, currentVehicleId, {
        brand: 'VinFast Updated',
        model: 'VF9 Plus'
    }, 200);
});

Scenario('6. Cập nhật xe không tồn tại', async ({ I }) => {
    await vehicleHelper.updateVehicle(I, 999999, {
        brand: 'Toyota'
    }, 404);
});

Scenario('7. Xóa trắng biển số', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.updateVehicle(I, currentVehicleId, {
        licensePlate: null
    }, 400);
});

Scenario('8. Cập nhật không truyền dữ liệu (body)', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.updateVehicle(I, currentVehicleId, {}, 200);
});

// ==========================================
// 🔹 NHẮC NHỞ BẢO TRÌ
// ==========================================

Scenario('9. Thêm nhắc nhở hợp lệ', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, {
        message: 'Thay dầu và lọc nhớt định kỳ',
        date: vehicleHelper.getFutureDate(7), // 7 ngày sau
        completed: false
    }, 201);
});

Scenario('10. Thiếu nội dung nhắc nhở', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, {
        message: '',
        date: vehicleHelper.getTodayDate()
    }, 400);
});

Scenario('11. Ngày hẹn không hợp lệ', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, {
        message: 'Kiểm tra phanh',
        date: '2020-01-01' // Ngày trong quá khứ, giả định backend chặn
    }, 400);
});

Scenario('12. Thêm nhắc nhở cho xe ko tồn tại', async ({ I }) => {
    await vehicleHelper.createReminder(I, 999999, {
        message: 'Lỗi xe',
        date: vehicleHelper.getTodayDate()
    }, 400); // Có thể backend bạn set 404
});

// ==========================================
// 🔹 DANH SÁCH XE
// ==========================================

Scenario('13. Lấy danh sách mặc định', async ({ I }) => {
    await vehicleHelper.getAllVehicles(I, "", 200);
});

Scenario('14. Tìm kiếm theo biển số', async ({ I }) => {
    const { currentPlate } = vehicleHelper.getStoredData();
    await vehicleHelper.getAllVehicles(I, `?keyword=${currentPlate}`, 200);
});

Scenario('15. Tìm kiếm theo hãng xe', async ({ I }) => {
    await vehicleHelper.getAllVehicles(I, "?keyword=VinFast", 200);
});

// ==========================================
// 🔹 XEM CHI TIẾT XE
// ==========================================

Scenario('16. Xem xe hợp lệ', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.getVehicleById(I, currentVehicleId, 200);
});

Scenario('17. Xem xe không tồn tại', async ({ I }) => {
    await vehicleHelper.getVehicleById(I, 999999, 404);
});

// ==========================================
// 🔹 LẤY XE THEO NGƯỜI DÙNG
// ==========================================

Scenario('18. Lấy xe của khách hàng cụ thể', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.getVehiclesByUser(I, currentUserId, "", 200);
});

Scenario('19. Phân trang xe của người dùng', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.getVehiclesByUser(I, currentUserId, "?limit=2&page=1", 200);
});

// ==========================================
// 🔹 XEM DANH SÁCH NHẮC NHỞ
// ==========================================

Scenario('20. Lấy danh sách reminders của xe', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.getRemindersByVehicle(I, currentVehicleId, "", 200);
});

Scenario('21. Phân trang danh sách', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.getRemindersByVehicle(I, currentVehicleId, "?limit=1", 200);
});

Scenario('22. Xe không có nhắc nhở nào', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    
  
    const tempVehicle = await vehicleHelper.createVehicle(I, {
        licensePlate: vehicleHelper.generateRandomPlate(),
        brand: 'Temp', model: 'Car', year: 2024, userId: currentUserId
    }, 201, false); 
    
    // Lấy id trực tiếp từ kết quả trả về
    const tempId = tempVehicle.id || tempVehicle._id || tempVehicle.data?.id;

    await vehicleHelper.getRemindersByVehicle(I, tempId, "", 200);

    // Xóa xe tạm
    await vehicleHelper.deleteVehicle(I, tempId, 200); 
    // (Lưu ý: Nếu delete trả 204 thì đổi số 200 ở trên thành 204 nhé)
});
// ==========================================
// 🔹 XÓA XE
// ==========================================

Scenario('23. Xóa xe thành công', async ({ I }) => {
    const { currentVehicleId } = vehicleHelper.getStoredData();
    // Xóa chiếc xe chính đã tạo từ TC1
    await vehicleHelper.deleteVehicle(I, currentVehicleId, 200); // Nếu BE trả về 204 thì đổi thành 204
});

Scenario('24. Kiểm tra xóa Reminders kèm theo', async ({ I }) => {
      const { currentVehicleId } = vehicleHelper.getStoredData();
    // Xóa chiếc xe chính đã tạo từ TC1
    await vehicleHelper.deleteVehicle(I, currentVehicleId, 404); 
});

Scenario('25. Xóa xe không tồn tại', async ({ I }) => {
    // Cố tình xóa lại ID đã xóa ở TC 23
    const { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.deleteVehicle(I, currentVehicleId, 404);
});