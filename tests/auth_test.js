const {
  login,
  loginAndAuthenticate,
  refreshTokenWithLogin,
  registerUser,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  refreshToken
} = require('../helpers/authHelpers');

Feature('Auth Service - Full Test');

// =======================
// 🔹 AUTH TEST
// =======================

Scenario('Login thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/auth/login', {
    email: 'Admin001@gmail.com',
    password: '123456'
  });

  I.seeResponseCodeIs(200);
  I.seeResponseContainsJson({
    user: {
      email: 'Admin001@gmail.com'
    }
  });
});

Scenario('Login sai mật khẩu', async ({ I }) => {
  await I.sendPostRequest('/auth/login', {
    email: 'Admin001@gmail.com',
    password: 'sai123'
  });

  I.seeResponseCodeIs(401);
});

Scenario('Login user không tồn tại', async ({ I }) => {
  await I.sendPostRequest('/auth/login', {
    email: `noexist${Date.now()}@gmail.com`,
    password: '123456'
  });

  I.seeResponseCodeIs(404);
});

// =======================
// 🔹 REGISTER (BVA)
// =======================

Scenario('Register hợp lệ', async ({ I }) => {
  const email = `test${Date.now()}@gmail.com`;
  const username = `user${Date.now()}`;

  await registerUser(I, {
    username,
    email,
    password: '123456'
  });
});

Scenario('Register username < min', async ({ I }) => {
  await registerUser(I, {
    username: 'abc',
    email: `test${Date.now()}@gmail.com`,
    password: '123456'
  }, 400);
});

Scenario('Register username > max', async ({ I }) => {
  await registerUser(I, {
    username: 'a'.repeat(51),
    email: `test${Date.now()}@gmail.com`,
    password: '123456'
  }, 400);
});

Scenario('Register password > max', async ({ I }) => {
  await registerUser(I, {
    username: 'validname',
    email: `test${Date.now()}@gmail.com`,
    password: 'a'.repeat(21)
  }, 400);
});

Scenario('Register password < min', async ({ I }) => {
  await registerUser(I, {
    username: 'validname',
    email: `test${Date.now()}@gmail.com`,
    password: '123'
  }, 400);
});

Scenario('Register email không hợp lệ', async ({ I }) => {
  await registerUser(I, {
    username: `user${Date.now()}`,
    email: 'invalid-email',
    password: '123456'
  }, 400);
});

Scenario('Register trùng email', async ({ I }) => {
  const email = `duplicate${Date.now()}@gmail.com`;

  await registerUser(I, {
    username: `user${Date.now()}`,
    email,
    password: '123456'
  });

  await registerUser(I, {
    username: `user${Date.now()}`,
    email,
    password: '123456'
  }, 400);
});

// =======================
// 🔹 USER API
// =======================

Scenario('Lấy danh sách user', async ({ I }) => {
  await getUsers(I);
});

Scenario('Lấy user theo ID', async ({ I }) => {
  await getUserById(I, 20);
});

// =======================
// 🔹 CREATE + UPDATE + DELETE (FLOW RIÊNG)
// =======================

Scenario('CRUD user flow', async ({ I }) => {
  const createRes = await createUser(I, {
    username: `user${Date.now()}`,
    email: `new${Date.now()}@gmail.com`,
    password: '123456'
  });

  const userId = createRes.id;

  await updateUser(I, userId, {
    username: `updatedName${Date.now()}`
  });

  await deleteUser(I, userId);
});

// =======================
// 🔹 CREATE/UPDATE BVA
// =======================

Scenario('Create user thiếu password', async ({ I }) => {
  await createUser(I, {
    username: `user${Date.now()}`,
    email: `missingpass${Date.now()}@gmail.com`
  }, 400);
});

Scenario('Create user trùng email', async ({ I }) => {
  const email = `dupcreate${Date.now()}@gmail.com`;
  await createUser(I, {
    username: `user${Date.now()}`,
    email,
    password: '123456'
  });

  await createUser(I, {
    username: `user${Date.now()}`,
    email,
    password: '123456'
  }, 400);
});

Scenario('Update user no data provided', async ({ I }) => {
  await updateUser(I, 22, {}, 400);
});

Scenario('Update roles invalid array', async ({ I }) => {
  await updateUser(I, 22, { roles: [] }, 400);
});

Scenario('Delete user không tồn tại', async ({ I }) => {
  const email = `todelete${Date.now()}@gmail.com`;
  const user = await createUser(I, {
    username: `user${Date.now()}`,
    email,
    password: '123456'
  });

  await deleteUser(I, user.id);
  await deleteUser(I, user.id, 404);
});

Scenario('Get user stats current year', async ({ I }) => {
  await getUserStats(I);
});

Scenario('Get user stats future year invalid', async ({ I }) => {
  await getUserStats(I, 9999, 400);
});

Scenario('Refresh token invalid format', async ({ I }) => {
  await refreshToken(I, 'bad-token', 403);
});

Scenario('Update username < min', async ({ I }) => {
  await updateUser(I, 22, {
    username: 'abc'
  }, 400);
});

// =======================
// 🔹 REFRESH TOKEN
// =======================

Scenario('Refresh token', async ({ I }) => {
  await refreshTokenWithLogin(I);
});