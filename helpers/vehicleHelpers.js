// vehicleHelpers.js

// Biến lưu trữ trạng thái toàn cục cho suốt quá trình chạy Test
let globalState = {
    token: null,
    currentUserId: null,
    currentVehicleId: null,
    currentPlate: null, // Lưu biển số để test trùng lặp
    currentReminderId: null
};

module.exports = {
    // ----------------------------------------------------
    // UTILITIES (Tạo dữ liệu động, tránh lỗi chạy nhiều lần)
    // ----------------------------------------------------
    generateRandomPlate() {
        const randomSuffix = Math.floor(Math.random() * 90000) + 10000;
        return `59A-${randomSuffix}`;
    },

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },

    getFutureDate(daysToAdd = 7) {
        let date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split('T')[0];
    },

    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------
    async authenticate(I, credentials = { email: 'Admin001@gmail.com', password: '123456' }) {
        const res = await I.sendPostRequest('/auth/login', credentials);
        I.seeResponseCodeIsSuccessful(); // Tương đương 2xx
        
        // Tự động lưu Token và UserID từ Auth
        globalState.token = res.data.token || res.data.accessToken;
        // Tránh trường hợp API trả về cấu trúc khác nhau
        globalState.currentUserId = res.data.user?.id || res.data.id || 1; 
        
        // Gắn header mặc định cho mọi request tiếp theo
        I.haveRequestHeaders({ Authorization: `Bearer ${globalState.token}` });
        return res.data;
    },

    // ----------------------------------------------------
    // API CỦA VEHICLE SERVICE
    // ----------------------------------------------------
    
    // Cập nhật lại trong vehicleHelpers.js
// Cập nhật lại trong vehicleHelpers.js
// Thay đổi dòng khai báo hàm và thêm điều kiện lưu
async createVehicle(I, data, expectedCode = 201, saveToGlobalState = true) {
    const res = await I.sendPostRequest('/vehicle', data);
    I.seeResponseCodeIs(expectedCode);
    
    if (expectedCode === 201) {
        const newId = res.data?.id || res.id || res.data?._id || res.data?.data?.id; 
        const newPlate = res.data?.licensePlate || res.licensePlate || res.data?.data?.licensePlate;
        
        // 👉 Chỉ lưu vào biến global nếu saveToGlobalState là true
        if (newId && saveToGlobalState) {
            globalState.currentVehicleId = newId;
            globalState.currentPlate = newPlate;
        }
    }
    return res.data || res;
},

    async updateVehicle(I, id, data, expectedCode = 200) {
        const res = await I.sendPutRequest(`/vehicle/${id}`, data);
        I.seeResponseCodeIs(expectedCode);
        return res.data;
    },

    async deleteVehicle(I, id, expectedCode = 200) {
    const res = await I.sendDeleteRequest(`/vehicle/${id}`);
    
    console.log(`\n=== DEBUG DELETE VEHICLE ===`);
    console.log(`- Mã Status thật sự trả về:`, res.status);
    console.log(`- Nội dung lỗi từ Backend:`, res.data);
    console.log(`============================\n`);

    I.seeResponseCodeIs(expectedCode);
    return res;
},

    async getAllVehicles(I, queryParams = "", expectedCode = 200) {
        const res = await I.sendGetRequest(`/vehicle${queryParams}`);
        I.seeResponseCodeIs(expectedCode);
        return res.data;
    },

    async getVehicleById(I, id, expectedCode = 200) {
        const res = await I.sendGetRequest(`/vehicle/${id}`);
        I.seeResponseCodeIs(expectedCode);
        return res.data;
    },

    async getVehiclesByUser(I, userId, queryParams = "", expectedCode = 200) {
        const res = await I.sendGetRequest(`/vehicle/user/${userId}${queryParams}`);
        I.seeResponseCodeIs(expectedCode);
        return res.data;
    },

    async createReminder(I, vehicleId, data, expectedCode = 201) {
        const res = await I.sendPostRequest(`/vehicle/${vehicleId}/reminders`, data);
        I.seeResponseCodeIs(expectedCode);
        if (expectedCode === 201 && res.data?.id) {
            globalState.currentReminderId = res.data.id;
        }
        return res.data;
    },

    async getRemindersByVehicle(I, vehicleId, queryParams = "", expectedCode = 200) {
        const res = await I.sendGetRequest(`/vehicle/${vehicleId}/reminders${queryParams}`);
        I.seeResponseCodeIs(expectedCode);
        return res.data;
    },

    // Getter lấy dữ liệu state
    getStoredData() { return globalState; }
};