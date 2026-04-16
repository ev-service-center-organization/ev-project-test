const assert = require('assert');
const {
  createFinance,
  getFinances,
  getFinanceById,
  updateFinance,
  deleteFinance
} = require('../helpers/financeHelpers');

Feature('Finance Service - Full Test');

// =======================
// 🔹 CREATE
// =======================

Scenario('Tạo finance hợp lệ', async ({ I }) => {
  await createFinance(I);
});

Scenario('Thiếu customerId', async ({ I }) => {
  await createFinance(I, { customerId: undefined }, 400);
});

Scenario('Thiếu dueDate', async ({ I }) => {
  await createFinance(I, { dueDate: undefined }, 400);
});

// =======================
// 🔹 GET
// =======================

Scenario('Lấy danh sách finance', async ({ I }) => {
  await getFinances(I);
});

Scenario('Lấy finance theo ID', async ({ I }) => {
  const f = await createFinance(I);
  await getFinanceById(I, f.id);
});

Scenario('Finance không tồn tại', async ({ I }) => {
  await getFinanceById(I, 999999, 404);
});

// =======================
// 🔹 CREATE BVA
// =======================

Scenario('Tạo finance với amount = 1 (giá trị biên hợp lệ)', async ({ I }) => {
  const finance = await createFinance(I, { amount: 1 });
  I.seeResponseContainsJson({ amount: 1 });
});

Scenario('Tạo finance với amount = 0 (giá trị biên sai)', async ({ I }) => {
  await createFinance(I, { amount: 0 }, 400);
});

Scenario('Tạo finance với dueDate là hôm nay', async ({ I }) => {
  const today = new Date().toISOString().split('T')[0];
  const finance = await createFinance(I, { dueDate: today });
  assert.ok(finance.dueDate.startsWith(today), `Expected dueDate to start with ${today}, got ${finance.dueDate}`);
});

Scenario('Tạo finance với dueDate ngày trước', async ({ I }) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await createFinance(I, { dueDate: yesterday.toISOString().split('T')[0] }, 400);
});

// =======================
// 🔹 UPDATE
// =======================

Scenario('Update finance', async ({ I }) => {
  const f = await createFinance(I);

  await updateFinance(I, f.id, {
    amount: 2000
  });

  I.seeResponseContainsJson({
    amount: 2000
  });
});

Scenario('Update finance amount = 1 (giá trị biên hợp lệ)', async ({ I }) => {
  const f = await createFinance(I);
  await updateFinance(I, f.id, { amount: 1 });
  I.seeResponseContainsJson({ amount: 1 });
});

Scenario('Update finance amount = 0 (giá trị biên sai)', async ({ I }) => {
  const f = await createFinance(I);
  await updateFinance(I, f.id, { amount: 0 }, 400);
});

// =======================
// 🔹 DELETE
// =======================

Scenario('Xóa finance', async ({ I }) => {
  const f = await createFinance(I);
  await deleteFinance(I, f.id);
});

Scenario('Xóa finance không tồn tại', async ({ I }) => {
  await deleteFinance(I, 999999, 404);
});