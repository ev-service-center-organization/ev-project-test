1. Tổng quan các API Chính của Booking Service
   POST /booking: Tạo mới một lịch hẹn bảo dưỡng (Cr booking)

GET /booking: Lấy danh sách toàn bộ lịch hẹn (G_booking)

PUT /booking/:id: Cập nhật trạng thái/thông tin lịch hẹn (Up_booking)

DELETE /booking/:id: Xóa lịch hẹn khỏi hệ thống (Del_booking)

POST /service-center: Tạo mới trung tâm dịch vụ (Service_center)

2. TEST CASE
   Environments:
   baseUrl: http://localhost:5002/api (Hoặc http://localhost:8080/api nếu qua Gateway)

2.1 CREATE BOOKING (Cr booking)
TC16 - Tạo lịch hẹn thành công

Method: POST {{baseUrl}}/booking

Input:
{
"userId": 2,
"vehicleId": 1,
"serviceCenterId": 1,
"date": "2026-03-25",
"timeSlot": "08:00 - 09:00"
}
Expected:

201 Created

"status": "pending"

Hệ thống tự động lưu id vào biến {{bookingId}}

TC17 - Thiếu trường bắt buộc (ví dụ: thiếu vehicleId)

Input: Bỏ trường vehicleId

Expected: 400 Bad Request

2.2 GET BOOKING (G_booking)
TC18 - Lấy danh sách booking thành công

Method: GET {{baseUrl}}/booking

Expected:

200 OK

Trả về mảng dữ liệu chứa id vừa tạo (ID: 31)

2.3 UPDATE BOOKING (Up_booking)
TC19 - Cập nhật trạng thái sang "confirmed"

Method: PUT {{baseUrl}}/booking/{{bookingId}}

Input:
{
"status": "confirmed",
"notes": "Đã gọi điện xác nhận với khách hàng."
}
Expected:

200 OK

Trường status chuyển từ pending sang confirmed

2.4 DELETE BOOKING (Del_booking)
TC20 - Xóa lịch hẹn thành công

Method: DELETE {{baseUrl}}/booking/{{bookingId}}

Expected:

200 OK

"message": "Appointment deleted successfully"

2.5 SERVICE CENTER (Service_center)
TC21 - Tạo trung tâm dịch vụ mới

Method: POST {{baseUrl}}/service-center

Input:
{
"name": "Service Center A",
"address": "Q12, Ho Chi Minh city",
"phone": "0901234567"
}
Expected:

201 Created

"message": "Service center created successfully"
