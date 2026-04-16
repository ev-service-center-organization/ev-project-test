const DEFAULT_USER = {
  email: 'Admin001@gmail.com',
  password: '123456'
};

async function login(I, credentials = DEFAULT_USER) {
  const response = await I.sendPostRequest('/auth/login', credentials);
  I.seeResponseCodeIs(200);

  if (!response?.data?.token) {
    throw new Error('Auth login failed: token missing');
  }

  return response.data;
}

async function loginAndAuthenticate(I, credentials = DEFAULT_USER) {
  const loginData = await login(I, credentials);
  I.haveRequestHeaders({ Authorization: `Bearer ${loginData.token}` });
  return loginData;
}

async function refreshToken(I, refreshToken, expectedCode = 200) {
  const response = await I.sendPostRequest('/auth/refresh', { refreshToken });
  I.seeResponseCodeIs(expectedCode);
  return response.data;
}

async function refreshTokenWithLogin(I, credentials = DEFAULT_USER) {
  const loginData = await login(I, credentials);
  return refreshToken(I, loginData.refreshToken);
}

async function registerUser(I, userPayload, expectedCode = 201) {
  const response = await I.sendPostRequest('/auth/register', userPayload);
  I.seeResponseCodeIs(expectedCode);
  return response;
}

async function createUser(I, userPayload, expectedCode = 201) {
  await loginAndAuthenticate(I);
  const response = await I.sendPostRequest('/auth/users', userPayload);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 201 ? response.data : response;
}

async function getUsers(I, expectedCode = 200) {
  await loginAndAuthenticate(I);
  const response = await I.sendGetRequest('/auth/users');
  I.seeResponseCodeIs(expectedCode);
  return response.data;
}

async function getUserById(I, id, expectedCode = 200) {
  await loginAndAuthenticate(I);
  const response = await I.sendGetRequest(`/auth/users/${id}`);
  I.seeResponseCodeIs(expectedCode);
  return response.data;
}

async function updateUser(I, userId, payload, expectedCode = 200) {
  await loginAndAuthenticate(I);
  const response = await I.sendPatchRequest(`/auth/users/${userId}`, payload);
  I.seeResponseCodeIs(expectedCode);
  return response.data;
}

async function deleteUser(I, userId, expectedCode = 204) {
  await loginAndAuthenticate(I);
  const response = await I.sendDeleteRequest(`/auth/users/${userId}`);
  I.seeResponseCodeIs(expectedCode);
  return response;
}

async function getUserStats(I, year, expectedCode = 200) {
  await loginAndAuthenticate(I);
  const url = year ? `/auth/stats/users?year=${year}` : '/auth/stats/users';
  const response = await I.sendGetRequest(url);
  I.seeResponseCodeIs(expectedCode);
  return response.data;
}

module.exports = {
  DEFAULT_USER,
  login,
  loginAndAuthenticate,
  refreshToken,
  refreshTokenWithLogin,
  registerUser,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
};