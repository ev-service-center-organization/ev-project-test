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
    TC07 - Lấy danh sách user
    - Method: GET {{baseUrl}}/auth/users
    - Header: Authorization: Bearer {{access_token}}
    - Expected: 200 OK and Trả về array user

    TC08 - Không có token 
    - Expected: 401 Unauthorized

    2.4 UPDATE USER
    TC09 - Update thành công
    - Method: PATCH {{baseUrl}}/auth/users/{{user_id}}
    - Body:
    {
        "username": "{{username_up}}"
    }
    - Expected: 200 OK

    TC10 - User không tồn tại
    - 404 Not Found

    TC11 - Email trùng
    - 400 Bad Request

    2.5 DELETE USER
    TC12 - Xóa user thành công 
    - Method: DELETE {{baseUrl}}/auth/users/{{user_id}}
    - Expected: 204 OK

    TC13 - User không tồn tại 
    - 404 Not Found

    2.6 REFRESH TOKEN
    TC14 - Refresh token thành công
    - Method: POST {{baseUrl}}/auth/refresh
    - Body: 
    {
        "refreshToken": "{{refresh_token}}"
    }
    - Expected: 
    200 OK
    JSON
    {
        "access_token": "new_token"
    }

    TC15 - Refresh token sai
    - 401 Unauthorized

    -> FLOW TEST: Register -> Login -> Get User -> Up User -> Del User -> Refresh Token
    





    
