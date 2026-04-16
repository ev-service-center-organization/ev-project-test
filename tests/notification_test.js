const assert = require('assert');
const {
  createNotification,
  getNotifications,
  getNotificationsByUser,
  markNotificationAsRead,
  deleteNotification
} = require('../helpers/notificationHelpers');

Feature('Notification Service - Full Test');

Scenario('Tạo notification hợp lệ', async ({ I }) => {
  const notification = await createNotification(I);
  I.seeResponseContainsJson({ status: 'unread' });
});

Scenario('Thiếu userId', async ({ I }) => {
  await createNotification(I, { userId: undefined }, 400);
});

Scenario('Thiếu message', async ({ I }) => {
  await createNotification(I, { message: undefined }, 400);
});

Scenario('Thiếu type', async ({ I }) => {
  await createNotification(I, { type: undefined }, 400);
});

Scenario('Tạo notification với userId = 1 (biên hợp lệ)', async ({ I }) => {
  const notification = await createNotification(I, { userId: 1 });
  I.seeResponseContainsJson({ userId: 1 });
});

Scenario('Tạo notification với userId = 0 (biên sai)', async ({ I }) => {
  await createNotification(I, { userId: 0 }, 400);
});

Scenario('Tạo notification với message 1 ký tự (biên hợp lệ)', async ({ I }) => {
  const notification = await createNotification(I, { message: 'A' });
  I.seeResponseContainsJson({ message: 'A' });
});

Scenario('Tạo notification với message rỗng (biên sai)', async ({ I }) => {
  await createNotification(I, { message: '' }, 400);
});

Scenario('Tạo notification với type = "booking" (biên hợp lệ)', async ({ I }) => {
  const notification = await createNotification(I, { type: 'booking' });
  I.seeResponseContainsJson({ type: 'booking' });
});

Scenario('Tạo notification với type rỗng (biên sai)', async ({ I }) => {
  await createNotification(I, { type: '' }, 400);
});

Scenario('Lấy danh sách notification', async ({ I }) => {
  await getNotifications(I);
});

Scenario('Lấy notification theo user', async ({ I }) => {
  await createNotification(I, { userId: 2 });
  const result = await getNotificationsByUser(I, 2);
  I.seeResponseContainsJson({ page: 1, limit: 10 });
  I.seeResponseContainsJson({ data: [{ userId: 2 }] });
});

Scenario('Lấy notification với limit = 0 trả về danh sách rỗng', async ({ I }) => {
  const result = await getNotifications(I, 'limit=0');
  I.seeResponseContainsJson({ data: [], total: 0, limit: 0 });
});

Scenario('Lấy notification với limit = 1 (biên hợp lệ)', async ({ I }) => {
  const notification = await createNotification(I, { userId: 3 });
  const result = await getNotifications(I, 'limit=1');
  assert.strictEqual(result.page, 1);
  assert.strictEqual(result.limit, 1);
  assert.ok(Array.isArray(result.data));
  assert.ok(result.data.length <= 1);
});

Scenario('Lấy notification với page = 0 trả về trang 1', async ({ I }) => {
  const result = await getNotifications(I, 'page=0&limit=1');
  assert.strictEqual(result.page, 1);
  assert.strictEqual(result.limit, 1);
});

Scenario('Lấy notification với status=unread và userId=1', async ({ I }) => {
  await createNotification(I, { userId: 1, message: 'BVA status unread', type: 'booking' });
  const result = await getNotifications(I, 'userId=1&status=unread');
  I.seeResponseContainsJson({ page: 1, limit: 10 });
  assert.ok(Array.isArray(result.data));
  assert.ok(result.data.every((item) => item.status === 'unread' && item.userId === 1));
});

Scenario('Đánh dấu notification là đã đọc', async ({ I }) => {
  const notification = await createNotification(I);
  const updated = await markNotificationAsRead(I, notification.id);
  I.seeResponseContainsJson({ status: 'read' });
});

Scenario('Đánh dấu notification không tồn tại', async ({ I }) => {
  await markNotificationAsRead(I, 999999, 404);
});

Scenario('Xóa notification', async ({ I }) => {
  const notification = await createNotification(I);
  await deleteNotification(I, notification.id);
});

Scenario('Xóa notification không tồn tại', async ({ I }) => {
  await deleteNotification(I, 999999, 404);
});
