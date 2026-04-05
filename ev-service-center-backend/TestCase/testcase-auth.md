 1. Tổng quan các API Chính của auth service
 - POST register
 - POST login
 - GET  users
 - POST users
 - PATCH users
 - DELETE users
 - POST refresh 
 2. TEST CASE
 Environments:
 baseUrl: http://localhost:8080/api
    2.1 REGISTER
    TC01 - Đăng ký thành công 
    - Method: POST  {{baseUrl}}/auth/register
    - Input:
    {
        "username": "random_user",
        "email": "random@gmail.com",
        "password": "123456" 
    }
    - Expected:
    201 created
    "message": "User registered successfully"

    TC02 - Email đã tồn tại
    - Input: email trùng
    - Expected:
    400 Bad Request
    "message": "User already exists"

    TC03 - Thiếu field
    - Input: 
    {
        "email": "{{email}}",
        "password": "{{password}}"
    }
    - Expected:
    400 Bad Request

    2.2 LOGIN
    TC04 - Login thành công
    - Method: POST {{baseUrl}}/auth/login
    - Input: 
    {
        "email": "{{email}}",
        "password": "{{password}}"
    }
    - Expected:
    200 OK
    {
        "token":...
        "refreshToken":...
        ....
    }

    TC05 - Sai password
    - Expected:
    401 Unauthorized
    "message": "Invalid password"

    TC06 - Email không tồn tại
    401 Unauthorized

    2.3 GET USERS


