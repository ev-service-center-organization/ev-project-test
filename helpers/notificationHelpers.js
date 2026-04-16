function createNotificationPayload(overrides = {}) {
  return {
    userId: 1,
    message: 'Notification test message',
    type: 'booking',
    ...overrides
  };
}

async function createNotification(I, payload = {}, expectedCode = 201) {
  const response = await I.sendPostRequest(
    '/notification',
    createNotificationPayload(payload)
  );
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 201 ? response.data : response;
}

async function getNotifications(I, query = '', expectedCode = 200) {
  const url = query ? `/notification?${query}` : '/notification';
  const response = await I.sendGetRequest(url);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data : response;
}

async function getNotificationsByUser(I, userId, expectedCode = 200) {
  const response = await I.sendGetRequest(`/notification/user/${userId}`);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data : response;
}

async function markNotificationAsRead(I, id, expectedCode = 200) {
  const response = await I.sendPutRequest(`/notification/${id}/read`);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data : response;
}

async function deleteNotification(I, id, expectedCode = 200) {
  const response = await I.sendDeleteRequest(`/notification/${id}`);
  I.seeResponseCodeIs(expectedCode);
  return response;
}

module.exports = {
  createNotification,
  getNotifications,
  getNotificationsByUser,
  markNotificationAsRead,
  deleteNotification
};
