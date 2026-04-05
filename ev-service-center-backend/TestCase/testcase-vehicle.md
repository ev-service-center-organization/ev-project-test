1. Tổng quan các API Chính của vehicle-service
Dịch vụ quản lý phương tiện bao gồm 8 API chính để điều khiển thông tin xe và các nhắc nhở bảo dưỡng:

GET /: Lấy danh sách tất cả xe (hỗ trợ phân trang, tìm kiếm theo keyword, lọc theo userId).

GET /user/:userId: Lấy danh sách xe theo ID người dùng cụ thể.

GET /:id: Lấy thông tin chi tiết một chiếc xe bằng ID.

POST /: Tạo mới một phương tiện.

PUT /:id: Cập nhật thông tin phương tiện.

DELETE /:id: Xóa phương tiện khỏi hệ thống.

POST /:vehicle_id/reminders: Thêm nhắc nhở bảo dưỡng cho xe.

GET /:vehicle_id/reminders: Lấy danh sách nhắc nhở của một xe.

2. TEST CASE
Environments:

baseUrl: http://localhost:8080/api/vehicles (Giả định qua Gateway) hoặc port riêng của service.

Header chung: Authorization: Bearer {{access_token}} (Tất cả API đều yêu cầu xác thực).

2.1 CREATE VEHICLE (Tạo xe)
TC01 - Tạo xe thành công

Method: POST {{baseUrl}}/

Input:

JSON
{
  "licensePlate": "29A-123.45",
  "brand": "VinFast",
  "model": "VF8",
  "year": 2023,
  "userId": 1
}
Expected:

201 Created.

message: "Vehicle created successfully".

TC02 - Biển số xe đã tồn tại

Input: licensePlate trùng với xe đã có trong DB.

Expected: 400 Bad Request (Do ràng buộc unique trong Model).

2.2 GET VEHICLES (Lấy danh sách)
TC03 - Lấy tất cả xe (Admin/Staff)

Method: GET {{baseUrl}}/?keyword=VinFast&page=1&limit=10

Expected: 200 OK, trả về object gồm data (mảng xe), total, totalPages, hasNext.

TC04 - Lấy xe theo User ID

Method: GET {{baseUrl}}/user/{{userId}}

Expected: 200 OK, trả về danh sách xe thuộc sở hữu của userId đó.

2.3 GET VEHICLE BY ID (Chi tiết xe)
TC05 - Lấy chi tiết xe thành công

Method: GET {{baseUrl}}/{{id}}

Expected: 200 OK, dữ liệu trả về bao gồm thông tin xe và mảng Reminders đi kèm.

TC06 - Xe không tồn tại

Input: id không có trong DB.

Expected: 404 Not Found, message: "Vehicle not found".

2.4 UPDATE VEHICLE (Cập nhật xe)
TC07 - Cập nhật thành công

Method: PUT {{baseUrl}}/{{id}}

Body:

JSON
{
  "model": "VF9 Plus"
}
Expected: 200 OK, message: "Vehicle updated successfully".

2.5 DELETE VEHICLE (Xóa xe)
TC08 - Xóa xe thành công

Method: DELETE {{baseUrl}}/{{id}}

Expected: 200 OK, message: "Vehicle deleted successfully".

2.6 ADD REMINDER (Thêm nhắc nhở)
TC09 - Tạo nhắc nhở thành công

Method: POST {{baseUrl}}/{{vehicle_id}}/reminders

Body:

JSON
{
  "message": "Thay lốp định kỳ",
  "date": "2024-05-20T08:00:00Z"
}
Expected: 201 Created, trả về thông tin reminder vừa tạo.

2.7 GET REMINDERS (Xem nhắc nhở)
TC10 - Lấy danh sách nhắc nhở của xe

Method: GET {{baseUrl}}/{{vehicle_id}}/reminders

Expected: 200 OK, danh sách nhắc nhở sắp xếp theo thời gian tạo mới nhất (DESC).