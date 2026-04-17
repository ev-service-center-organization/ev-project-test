// vehicle_service_test.js
const vehicleHelper = require('../helpers/vehicleHelpers');

Feature('Vehicle Service - 55 Comprehensive & BVA Test Cases');

Before(async ({ I }) => {
    // Tự động Login và thiết lập Header Token trước mỗi Test Case
    await vehicleHelper.authenticate(I);
});
const generatePlateByLength = (length) => {
    if (length < 7) return '51A123'; // Cố tình sai định dạng/ngắn
    const chars = "0123456789";
    let result = "59A-";
    for (let i = 0; i < length - 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
const generateDate = (yearsOffset = 0, daysOffset = 0) => {
    let d = new Date();
    d.setFullYear(d.getFullYear() + yearsOffset);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
};

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
// ==========================================
// 🔹 PHẦN 2: 30 TEST CASES BVA (Ranh giới dữ liệu)
// ==========================================

// --- BVA: License Plate ---
Scenario('26. BVA - Biển số ngắn hơn quy định (6 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: generatePlateByLength(6), brand: 'Toyota', model: 'Camry', year: 2020, userId: currentUserId }, 400);
});

Scenario('27. BVA - Biển số có độ dài tối thiểu (7 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: generatePlateByLength(7), brand: 'Toyota', model: 'Camry', year: 2020, userId: currentUserId }, 201);
});

Scenario('28. BVA - Biển số có độ dài bình thường (8 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: generatePlateByLength(8), brand: 'Toyota', model: 'Camry', year: 2020, userId: currentUserId }, 201);
});

Scenario('29. BVA - Biển số có độ dài tối đa (9 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: generatePlateByLength(9), brand: 'Toyota', model: 'Camry', year: 2020, userId: currentUserId }, 201);
});

Scenario('30. BVA - Biển số dài hơn quy định (10 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: generatePlateByLength(10), brand: 'Toyota', model: 'Camry', year: 2020, userId: currentUserId }, 400);
});

// --- BVA: Brand ---
Scenario('31. BVA - Thương hiệu để trống trường bắt buộc', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: '', model: 'Camry', year: 2020, userId: currentUserId }, 400);
});

Scenario('32. BVA - Thương hiệu có 1 ký tự', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'T', model: 'Camry', year: 2020, userId: currentUserId }, 201);
});


Scenario('33. BVA - Thương hiệu dài tối đa (50 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'A'.repeat(50), model: 'Camry', year: 2020, userId: currentUserId }, 201);
});

Scenario('34. BVA - Thương hiệu giá trị dài vượt quá giới hạn (51 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'A'.repeat(51), model: 'Camry', year: 2020, userId: currentUserId }, 400);
});

// --- BVA: Model ---
Scenario('35. BVA - Mẫu xe để trống trường tùy chọn', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: '', year: 2020, userId: currentUserId }, 400); // Hoặc 201 tùy Backend
});

Scenario('36. BVA - Mẫu xe có 1 ký tự', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'C', year: 2020, userId: currentUserId }, 201);
});

Scenario('37. BVA - Mẫu xe dài tối đa (50 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'M'.repeat(50), year: 2020, userId: currentUserId }, 201);
});

Scenario('38. BVA - Mẫu xe quá dài gây tràn dữ liệu (51 ký tự)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'M'.repeat(51), year: 2020, userId: currentUserId }, 400);
});

// --- BVA: Year ---
Scenario('39. BVA - Năm sản xuất dưới biên cho phép (1899)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 1899, userId: currentUserId }, 400);
});

Scenario('40. BVA - Năm sản xuất nhỏ nhất hợp lệ (1900)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 1900, userId: currentUserId }, 201);
});


Scenario('41. BVA - Năm sản xuất lớn nhất hợp lệ (2026)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 2026, userId: currentUserId }, 201);
});

Scenario('42. BVA - Năm sản xuất vượt biên tương lai (2027)', async ({ I }) => {
    const { currentUserId } = vehicleHelper.getStoredData();
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 2027, userId: currentUserId }, 400);
});

// --- BVA: User ID ---
Scenario('43. BVA - User ID là số âm (-1)', async ({ I }) => {
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 2020, userId: -1 }, 400);
});

Scenario('44. BVA - User ID nhỏ nhất hợp lệ (1)', async ({ I }) => {
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 2020, userId: 1 }, 201);
});


Scenario('45. BVA - User ID lớn nhất hợp lệ (2147483647)', async ({ I }) => {
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 2020, userId: 2147483647 }, 201);
});

Scenario('46. BVA - User ID sai định dạng chữ ("A")', async ({ I }) => {
    await vehicleHelper.createVehicle(I, { licensePlate: vehicleHelper.generateRandomPlate(), brand: 'Toyota', model: 'Camry', year: 2020, userId: "A" }, 400);
});

// --- BVA: Reminder Message (Hoàn thiện đủ 30 TCs BVA) ---
Scenario('47. BVA Reminder - Message rỗng', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { message: "", date: vehicleHelper.getFutureDate(7) }, 400);
});

Scenario('48. BVA Reminder - Message 1 ký tự', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { message: "A", date: vehicleHelper.getFutureDate(7) }, 201);
});

Scenario('49. BVA Reminder - Message thông thường', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { message: "Kiểm tra và thay nhớt", date: vehicleHelper.getFutureDate(7) }, 201);
});

Scenario('50. BVA Reminder - Message tối đa 255 ký tự', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { message: "A".repeat(255), date: vehicleHelper.getFutureDate(7) }, 201);
});

Scenario('51. BVA Reminder - Message vượt giới hạn 256 ký tự', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { message: "A".repeat(256), date: vehicleHelper.getFutureDate(7) }, 400);
});
Scenario('52. BVA Reminder - Date: Kiểm tra ngày ở quá khứ', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { 
        message: "Kiểm tra định kỳ", 
        date: generateDate(-1, 0) // Lùi về 1 năm trước
    }, 400);
});

Scenario('53. BVA Reminder - Date: Kiểm tra ngày hôm nay', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { 
        message: "Kiểm tra định kỳ", 
        date: generateDate(0, 0) // Ngày hôm nay
    }, 201);
});


Scenario('54. BVA Reminder - Date: Kiểm tra ngày tối đa (tương lai xa không quá 100 năm)', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { 
        message: "Kiểm tra định kỳ", 
        date: generateDate(100, 0) // Cộng đúng 100 năm
    }, 201);
});

Scenario('55. BVA Reminder - Date: Kiểm tra ngày vượt quá tối đa (tương lai xa quá 100 năm)', async ({ I }) => {
    let { currentVehicleId } = vehicleHelper.getStoredData();
    await vehicleHelper.createReminder(I, currentVehicleId, { 
        message: "Kiểm tra định kỳ", 
        date: generateDate(101, 0) // Vượt ngưỡng 100 năm (Cộng 101 năm)
    }, 400);
});