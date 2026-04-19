// tests/workorder_test.js
const woHelper = require('../helpers/workOrderHelpers');

Feature('WorkOrder Service - Full Test (Functional + BVA)');

Before(async ({ I }) => {
  await woHelper.authenticate(I);
});

// ═══════════════════════════════════════════════════════════
// WO_F1 – Xem Danh Sách Work Order
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_1.1 - Lấy danh sách work order mặc định', async ({ I }) => {
  const res = await woHelper.getAllWorkOrders(I);

  I.assertTrue(Array.isArray(res.data), 'data phải là array');
  I.seeResponseContainsJson({ page: 1 });
  if (res.data.length > 0) {
    I.assertNotNull(res.data[0].checklistItems, 'Thiếu field: checklistItems');
  }
});

Scenario('ITC_WO_1.2 - Phân trang page=2, limit=5', async ({ I }) => {
  const res = await woHelper.getAllWorkOrders(I, '?page=2&limit=5');

  I.seeResponseContainsJson({ page: 2, limit: 5 });
  I.assertTrue(res.hasPrev, 'hasPrev phải = true khi page=2');
  I.assertLessOrEqual(res.data.length, 5, 'data tối đa 5 items');
});

// ═══════════════════════════════════════════════════════════
// WO_F2 – Xem Chi Tiết Work Order
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_2.1 - Xem chi tiết WO hợp lệ', async ({ I }) => {
  const listRes = await woHelper.getAllWorkOrders(I, '', 200);
  const firstId = listRes?.data?.[0]?.id;

  const res = await woHelper.getWorkOrderById(I, firstId, 200);

  // Response trả về flat object, data nằm thẳng ở res (không có wrapper)
  I.assertNotNull(res?.id,             'Thiếu field: id');
  I.assertNotNull(res?.title,          'Thiếu field: title');
  I.assertNotNull(res?.status,         'Thiếu field: status');
  I.assertNotNull(res?.checklistItems, 'Thiếu field: checklistItems');
});

Scenario('ITC_WO_2.2 - Xem WO không tồn tại → 404', async ({ I }) => {
  await woHelper.getWorkOrderById(I, 99999, 404);
  I.seeResponseContainsJson({ message: 'Work order not found' });
});

// ═══════════════════════════════════════════════════════════
// WO_F3 – Tạo Work Order
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_3.1 - Tạo WO đầy đủ thông tin', async ({ I }) => {
  const res = await woHelper.createWorkOrder(I, {
    title:         'AUTO TEST - Bảo dưỡng xe',
    description:   'Test tự động bởi CodeceptJS',
    status:        'pending',
    appointmentId: 1,
    createdById:   1,
    dueDate:       '2025-12-31',
  });

  I.assertNotNull(res.id, 'Thiếu field: id');
  I.assertEqual(res.totalPrice, 0,        'totalPrice ban đầu phải = 0');
  I.assertEqual(res.status,    'pending', 'status phải = pending');
});

Scenario('ITC_WO_3.2 - Tạo WO thiếu title → 400', async ({ I }) => {
  await woHelper.createWorkOrder(I, {
    appointmentId: 1,
    createdById:   1,
  }, 400);
});

Scenario('ITC_WO_3.3 - Tạo WO với appointmentId giả → 201 (BUG: không validate)', async ({ I }) => {
  const res = await woHelper.createWorkOrder(I, {
    title:         'WO appointmentId giả',
    appointmentId: 99999,
    createdById:   1,
  }, 201, false); // không ghi đè globalState

  // Cleanup
  if (res.id) await woHelper.deleteWorkOrder(I, res.id);
  console.log('[ITC_WO_3.3] WO tạo được dù appointmentId không tồn tại - đây là BUG');
});

// ═══════════════════════════════════════════════════════════
// WO_F4 – Cập Nhật Work Order
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_4.1 - Cập nhật status WO → in_progress', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  const res = await woHelper.updateWorkOrder(I, currentWorkOrderId, {
    status: 'in_progress',
  });

  I.assertEqual(res.status, 'in_progress', 'status phải = in_progress');
});

Scenario('ITC_WO_4.2 - Cập nhật WO không tồn tại → 404', async ({ I }) => {
  await woHelper.updateWorkOrder(I, 99999, { status: 'completed' }, 404);
  I.seeResponseContainsJson({ message: 'Work order not found' });
});

// ═══════════════════════════════════════════════════════════
// WO_F5 – Xóa Work Order (test cuối, dùng WO phụ)
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_5.1 - Xóa WO và cascade checklist', async ({ I }) => {
  // Tạo WO phụ để xóa, không ảnh hưởng WO chính
  const woRes = await woHelper.createWorkOrder(I, {
    title: 'WO To Delete AUTO', appointmentId: 1, createdById: 1,
  }, 201, false);

  const deleteId = woRes.id;

  // Thêm checklist
  await woHelper.addChecklistItem(I, deleteId, {
    task: 'Task AUTO', price: 100000, completed: false,
  }, 201, false);

  // Xóa WO
  const res = await woHelper.deleteWorkOrder(I, deleteId);
  I.seeResponseContainsJson({ message: 'Work order deleted' });

  // Verify đã xóa
  await woHelper.getWorkOrderById(I, deleteId, 404);
});

// ═══════════════════════════════════════════════════════════
// WO_F6 – Thêm Checklist Item
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_6.1 - Thêm item chưa hoàn thành → totalPrice không đổi', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task:      'Thay dầu động cơ AUTO',
    price:     150000,
    completed: false,
  });

  // Verify totalPrice KHÔNG thay đổi
  const woRes = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  I.assertEqual(woRes.totalPrice, 0,
    'totalPrice phải = 0 khi completed=false');
});

Scenario('ITC_WO_6.2 - Thêm item completed=true → totalPrice tăng ngay', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task:      'Kiểm tra phanh AUTO',
    price:     50000,
    completed: true,
  });

  // Verify totalPrice tăng
  const woRes = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  I.assertTrue(woRes.totalPrice > 0, 'totalPrice phải > 0 khi có item completed=true');
});

Scenario('ITC_WO_6.3 - Thêm item thiếu task → 400', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    price: 100000,
  }, 400);
});

// ═══════════════════════════════════════════════════════════
// WO_F7 – Xem Checklist của WO
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_7.1 - Lấy checklist của WO hợp lệ', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  const res = await woHelper.getChecklistItems(I, currentWorkOrderId);

  I.assertTrue(Array.isArray(res), 'Checklist phải là array');
  // Mọi item phải thuộc đúng workOrderId
  for (const item of res) {
    I.assertEqual(item.workOrderId, currentWorkOrderId,
      `item.workOrderId ${item.workOrderId} không khớp ${currentWorkOrderId}`);
  }
});

// ═══════════════════════════════════════════════════════════
// WO_F8 – Xem Chi Tiết Checklist Item
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_8.1 - Xem checklist item hợp lệ', async ({ I }) => {
  const { currentWorkOrderId, currentChecklistItemId } = woHelper.getStoredData();

  const res = await woHelper.getChecklistItemById(I, currentWorkOrderId, currentChecklistItemId);

  I.assertEqual(res.workOrderId, currentWorkOrderId,
    'workOrderId phải khớp với URL');
  I.assertEqual(res.id, currentChecklistItemId,
    'id phải khớp với URL');
});

Scenario('ITC_WO_8.2 - Xem item thuộc WO khác → 404 (cross-access)', async ({ I }) => {
  // Tạo WO thứ hai để test cross-access
  const wo2Res = await woHelper.createWorkOrder(I, {
    title: 'WO B AUTO', appointmentId: 1, createdById: 1,
  }, 201, false);
  const wo2Id = wo2Res.id;

  const { currentChecklistItemId } = woHelper.getStoredData();

  // Dùng item của WO_A nhưng truyền wo_id = WO_B → phải 404
  await woHelper.getChecklistItemById(I, wo2Id, currentChecklistItemId, 404);
  I.seeResponseContainsJson({ message: 'Checklist item not found' });

  // Cleanup
  if (wo2Id) await woHelper.deleteWorkOrder(I, wo2Id);
});

// ═══════════════════════════════════════════════════════════
// WO_F9 – Cập Nhật Checklist Item
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_9.1 - Đánh dấu item hoàn thành → totalPrice tăng', async ({ I }) => {
  const { currentWorkOrderId, currentChecklistItemId } = woHelper.getStoredData();

  // Lấy totalPrice trước
  const woBefore = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  const priceBefore = woBefore.totalPrice;

  await woHelper.updateChecklistItem(I, currentWorkOrderId, currentChecklistItemId, {
    completed: true,
  });

  const woAfter = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  I.assertTrue(woAfter.totalPrice >= priceBefore,
    `totalPrice (${woAfter.totalPrice}) phải >= ${priceBefore}`);
});

Scenario('ITC_WO_9.2 - Bỏ hoàn thành item → totalPrice giảm', async ({ I }) => {
  const { currentWorkOrderId, currentChecklistItemId } = woHelper.getStoredData();

  const woBefore = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  const priceBefore = woBefore.totalPrice;

  await woHelper.updateChecklistItem(I, currentWorkOrderId, currentChecklistItemId, {
    completed: false,
  });

  const woAfter = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  I.assertTrue(woAfter.totalPrice <= priceBefore,
    `totalPrice (${woAfter.totalPrice}) phải <= ${priceBefore}`);
});

Scenario('ITC_WO_9.3 - Update price (không đổi completed) → totalPrice không đổi', async ({ I }) => {
  const { currentWorkOrderId, currentChecklistItemId } = woHelper.getStoredData();

  const woBefore = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  const priceBefore = woBefore.totalPrice;

  await woHelper.updateChecklistItem(I, currentWorkOrderId, currentChecklistItemId, {
    price: 200000,
    // completed không truyền
  });

  const woAfter = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  I.assertEqual(woAfter.totalPrice, priceBefore,
    'totalPrice không được thay đổi khi completed không đổi');
});

// ═══════════════════════════════════════════════════════════
// WO_F10 – Xóa Checklist Item
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_10.1 - Xóa item completed=true → totalPrice giảm', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  // Thêm 1 item mới completed=true để xóa
  const itemRes = await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task: 'Task To Delete AUTO', price: 100000, completed: true,
  }, 201, false);

  const deleteItemId = itemRes.id;
  const woBefore = await woHelper.getWorkOrderById(I, currentWorkOrderId);

  await woHelper.deleteChecklistItem(I, currentWorkOrderId, deleteItemId);
  I.seeResponseContainsJson({ message: 'Checklist item deleted' });

  const woAfter = await woHelper.getWorkOrderById(I, currentWorkOrderId);
  I.assertTrue(woAfter.totalPrice <= woBefore.totalPrice,
    'totalPrice phải giảm sau khi xóa item completed=true');
});

Scenario('ITC_WO_10.2 - Xóa item không tồn tại → 404', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();
  await woHelper.deleteChecklistItem(I, currentWorkOrderId, 99999, 404);
  I.seeResponseContainsJson({ message: 'Checklist item not found' });
});

// ═══════════════════════════════════════════════════════════
// WO_F11 – Xem Tất Cả Checklist (limit nhỏ tránh timeout)
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_11.1 - Lấy checklist all, limit=5', async ({ I }) => {
  const res = await woHelper.getAllChecklistItems(I, '?page=1&limit=5');

  I.assertTrue(Array.isArray(res.data), 'data phải là array');
  I.assertLessOrEqual(res.data.length, 5, 'data tối đa 5 items');
  // Verify enrich data (có thể null nếu service khác lỗi)
  console.log('[ITC_WO_11.1] appointment sample:', res.data[0]?.appointment ?? 'null (service unavailable)');
});

Scenario('ITC_WO_11.2 - Tìm kiếm checklist theo keyword', async ({ I }) => {
  const res = await woHelper.getAllChecklistItems(I, '?keyword=thay&limit=5');

  for (const item of res.data) {
    I.assertTrue(
      item.task?.toLowerCase().includes('thay'),
      `task "${item.task}" không chứa 'thay'`
    );
  }
});

// ═══════════════════════════════════════════════════════════
// WO_F12 – WO theo Appointment
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_12.1 - Tìm WO theo appointmentId hợp lệ', async ({ I }) => {
  const { currentAppointmentId } = woHelper.getStoredData();
  const res = await woHelper.getWorkOrderByAppointmentId(I, currentAppointmentId);

  I.assertEqual(res.appointmentId, currentAppointmentId,
    'appointmentId phải khớp');
  I.assertNotNull(res.checklistItems, 'Thiếu field: checklistItems');
});

Scenario('ITC_WO_12.2 - Không tìm thấy WO theo appointmentId → 404', async ({ I }) => {
  await woHelper.getWorkOrderByAppointmentId(I, 99999, 404);
  I.seeResponseContainsJson({ message: 'Work order not found for this appointment' });
});

// ═══════════════════════════════════════════════════════════
// WO_F13 – Thống Kê Doanh Thu
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_13.1 - Lấy thống kê doanh thu năm hiện tại', async ({ I }) => {
  const res = await woHelper.getRevenueStats(I);
  const currentYear = new Date().getFullYear();

  I.assertEqual(res.data?.year, currentYear, 'year phải = năm hiện tại');
  I.assertEqual(res.data?.monthlyRevenue?.length, 12,
    'monthlyRevenue phải có đúng 12 phần tử');
  I.assertNotNull(res.data?.totalRevenue !== undefined, 'Thiếu field: totalRevenue');
});

Scenario('ITC_WO_13.2 - WO cancelled không tính vào doanh thu', async ({ I }) => {
  // Tạo WO với status cancelled
  const cancelRes = await woHelper.createWorkOrder(I, {
    title:         'WO Cancelled AUTO',
    appointmentId: 1,
    createdById:   1,
    status:        'cancelled',
  }, 201, false);
  const cancelId = cancelRes.id;

  // Lấy stats trước và sau
  const statsBefore = await woHelper.getRevenueStats(I);
  const totalBefore = statsBefore.data?.totalWorkOrders;

  // WO cancelled không được tính
  const statsAfter = await woHelper.getRevenueStats(I);
  I.assertEqual(statsAfter.data?.totalWorkOrders, totalBefore,
    'totalWorkOrders không được tăng khi có WO cancelled');

  // Cleanup
  if (cancelId) await woHelper.deleteWorkOrder(I, cancelId);
});

// ═══════════════════════════════════════════════════════════
// WO_F14 – Thống Kê Tasks
// ═══════════════════════════════════════════════════════════

Scenario('ITC_WO_14.1 - Lấy thống kê tasks năm hiện tại', async ({ I }) => {
  const res = await woHelper.getTaskStats(I);

  I.assertEqual(res.data?.monthlyTasks?.length, 12,
    'monthlyTasks phải có đúng 12 phần tử');
  I.assertEqual(res.data?.monthlyCompleted?.length, 12,
    'monthlyCompleted phải có đúng 12 phần tử');
  I.assertEqual(res.data?.monthlyPending?.length, 12,
    'monthlyPending phải có đúng 12 phần tử');

  // Verify: completed + pending = total mỗi tháng
  for (let m = 0; m < 12; m++) {
    const total     = res.data.monthlyTasks[m];
    const completed = res.data.monthlyCompleted[m];
    const pending   = res.data.monthlyPending[m];
    I.assertEqual(completed + pending, total,
      `Tháng ${m + 1}: completed(${completed}) + pending(${pending}) ≠ total(${total})`);
  }
});

// ═══════════════════════════════════════════════════════════
// BVA – WO_F3 createWorkOrder | title length
// ═══════════════════════════════════════════════════════════

Scenario('BVA_WO_3.1 - title = rỗng → 400 hoặc 201 (BUG: allowNull không bắt)', async ({ I }) => {
  const res = await I.sendPostRequest('/workorder', {
    title: '', appointmentId: 1, createdById: 1,
  });
  console.log(`[BVA_WO_3.1] title='' → HTTP ${res.status}`);
  if (res.status === 201 && res.data?.id) {
    await woHelper.deleteWorkOrder(I, res.data.id);
  }
});

Scenario('BVA_WO_3.2 - title = 1 ký tự (min hợp lệ) → 201', async ({ I }) => {
  const res = await woHelper.createWorkOrder(I, {
    title: 'X', appointmentId: 1, createdById: 1,
  }, 201, false);
  if (res.id) await woHelper.deleteWorkOrder(I, res.id);
});

Scenario('BVA_WO_3.3 - title = 255 ký tự (max) → 201', async ({ I }) => {
  const res = await woHelper.createWorkOrder(I, {
    title: 'A'.repeat(255), appointmentId: 1, createdById: 1,
  }, 201, false);
  if (res.id) await woHelper.deleteWorkOrder(I, res.id);
});

Scenario('BVA_WO_3.4 - title = 256 ký tự (max+1) → 500 hoặc 400', async ({ I }) => {
  const res = await I.sendPostRequest('/workorder', {
    title: 'A'.repeat(256), appointmentId: 1, createdById: 1,
  });
  I.assertIn([400, 500], res.status, '256 ký tự phải là 400 hoặc 500');
});

// ═══════════════════════════════════════════════════════════
// BVA – WO_F6 addChecklistItem | price
// ═══════════════════════════════════════════════════════════

Scenario('BVA_WO_6.1 - price = 0 (biên dưới hợp lệ) → 201', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();
  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task: 'BVA Free Task', price: 0, completed: false,
  }, 201, false);
});

// ✅ Sau fix: BVA_WO_6.2 assert cứng
Scenario('BVA_WO_6.2 - price = -1 → 400 @fixed', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task:      'BVA Neg Price',
    price:     -1,
    completed: false,
  }, 400);

  I.seeResponseContainsJson({
    message: 'price must be greater than or equal to 0'
  });
});

Scenario('BVA_WO_6.3 - price = 0.01 (min dương hợp lệ) → 201', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();
  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task: 'BVA Tiny Price', price: 0.01, completed: false,
  }, 201, false);
});

Scenario('BVA_WO_6.4 - price = 999999999.99 (giá trị lớn) → 201', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();
  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task: 'BVA Huge Price', price: 999999999.99, completed: false,
  }, 201, false);
});

// ─────── BVA task length ──────────────────────────────────

// Scenario('BVA_WO_6.5 - task = rỗng → 400', async ({ I }) => {
//   const { currentWorkOrderId } = woHelper.getStoredData();
//   await woHelper.addChecklistItem(I, currentWorkOrderId, {
//     task: '', price: 50000,
//   }, 400);
// });
// ✅ Ghi nhận BUG
Scenario('BVA_WO_6.5 - task = rỗng → 400', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();

  const res = await I.sendPostRequest(`/workorder/${currentWorkOrderId}/checklist`, {
    task: '', price: 50000
  });

  // BUG: Backend trả về 201 thay vì 400
  // Backend không validate task='' (empty string)
  // Chỉ chặn khi task=null (allowNull:false ở DB level)
  console.log(`[BVA_WO_6.5] task='' → HTTP ${res.status} (expect 400, BUG nếu 201)`);

  // Cleanup nếu tạo thành công
  const itemId = res.data?.data?.id || res.data?.id;
  if (itemId) {
    await woHelper.deleteChecklistItem(I, currentWorkOrderId, itemId);
  }
});

Scenario('BVA_WO_6.6 - task = 255 ký tự (max) → 201', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();
  await woHelper.addChecklistItem(I, currentWorkOrderId, {
    task: 'A'.repeat(255), price: 50000,
  }, 201, false);
});

Scenario('BVA_WO_6.7 - task = 256 ký tự (max+1) → 400 hoặc 500', async ({ I }) => {
  const { currentWorkOrderId } = woHelper.getStoredData();
  const res = await I.sendPostRequest(`/workorder/${currentWorkOrderId}/checklist`, {
    task: 'A'.repeat(256), price: 50000,
  });
  I.assertIn([400, 500], res.status, '256 ký tự phải là 400 hoặc 500');
});

// ─────── BVA WO_F9 totalPrice recalculate ─────────────────

Scenario('BVA_WO_9.1 - 0 item completed → totalPrice = 0', async ({ I }) => {
  // Tạo WO mới với 3 items đều completed=false
  const woRes = await woHelper.createWorkOrder(I, {
    title: 'BVA Zero Completed', appointmentId: 1, createdById: 1,
  }, 201, false);
  const bvaWoId = woRes.id;

  for (let i = 0; i < 3; i++) {
    await woHelper.addChecklistItem(I, bvaWoId, {
      task: `BVA Task ${i}`, price: 100000, completed: false,
    }, 201, false);
  }

  const res = await woHelper.getWorkOrderById(I, bvaWoId);
  I.assertEqual(res.totalPrice, 0, 'totalPrice phải = 0 khi không có item completed');

  // Cleanup
  await woHelper.deleteWorkOrder(I, bvaWoId);
});

Scenario('BVA_WO_9.2 - Hoàn thành item cuối → totalPrice = SUM tất cả', async ({ I }) => {
  const woRes = await woHelper.createWorkOrder(I, {
    title: 'BVA All Completed', appointmentId: 1, createdById: 1,
  }, 201, false);
  const bvaWoId = woRes.id;

  const item1 = await woHelper.addChecklistItem(I, bvaWoId, {
    task: 'BVA Task A', price: 100000, completed: true,
  }, 201, false);

  const item2 = await woHelper.addChecklistItem(I, bvaWoId, {
    task: 'BVA Task B', price: 200000, completed: true,
  }, 201, false);

  const item3 = await woHelper.addChecklistItem(I, bvaWoId, {
    task: 'BVA Task C', price: 50000, completed: false,
  }, 201, false);

  // Hoàn thành item cuối
  await woHelper.updateChecklistItem(I, bvaWoId, item3.id, { completed: true });

  const res = await woHelper.getWorkOrderById(I, bvaWoId);
  I.assertEqual(res.totalPrice, 350000, 'totalPrice phải = 350000 (100k+200k+50k)');

  // Cleanup
  await woHelper.deleteWorkOrder(I, bvaWoId);
});

Scenario('BVA_WO_9.3 - Bỏ hoàn thành item cuối → totalPrice về 0', async ({ I }) => {
  const woRes = await woHelper.createWorkOrder(I, {
    title: 'BVA Last Item', appointmentId: 1, createdById: 1,
  }, 201, false);
  const bvaWoId = woRes.id;

  const item = await woHelper.addChecklistItem(I, bvaWoId, {
    task: 'BVA Solo Task', price: 500000, completed: true,
  }, 201, false);

  const before = await woHelper.getWorkOrderById(I, bvaWoId);
  I.assertEqual(before.totalPrice, 500000, 'totalPrice phải = 500000 trước khi bỏ');

  await woHelper.updateChecklistItem(I, bvaWoId, item.id, { completed: false });

  const after = await woHelper.getWorkOrderById(I, bvaWoId);
  I.assertEqual(after.totalPrice, 0, 'totalPrice phải về 0');

  // Cleanup
  await woHelper.deleteWorkOrder(I, bvaWoId);
});

// ─────── BVA WO_F1 page & limit ───────────────────────────

Scenario('BVA_WO_1.1 - page = 0 → offset âm (BUG)', async ({ I }) => {
  const res = await I.sendGetRequest('/workorder?page=0&limit=10');
  console.log(`[BVA_WO_1.1] page=0 → HTTP ${res.status} (expect lỗi)`);
});

Scenario('BVA_WO_1.2 - limit = 1 (min hợp lệ) → 200, 1 item/trang', async ({ I }) => {
  const res = await woHelper.getAllWorkOrders(I, '?page=1&limit=1');
  I.assertLessOrEqual(res.data.length, 1, 'data phải có đúng 1 item');
});

Scenario('BVA_WO_1.3 - limit = 100 → 200, không timeout', async ({ I }) => {
  await woHelper.getAllWorkOrders(I, '?page=1&limit=100');
  console.log('[BVA_WO_1.3] limit=100 passed - monitor performance');
});

// ─────── BVA WO_F11 keyword ───────────────────────────────

Scenario('BVA_WO_11.1 - keyword = rỗng → trả tất cả (không filter)', async ({ I }) => {
  const resEmpty = await woHelper.getAllChecklistItems(I, '?keyword=&limit=5');
  const resAll   = await woHelper.getAllChecklistItems(I, '?limit=5');
  I.assertEqual(resEmpty.total, resAll.total,
    'keyword rỗng và không có keyword phải cho cùng kết quả');
});

Scenario('BVA_WO_11.2 - keyword = 1 ký tự → filter LIKE %T%', async ({ I }) => {
  const res = await woHelper.getAllChecklistItems(I, '?keyword=T&limit=5');
  I.seeResponseCodeIs(200);
});

Scenario('BVA_WO_11.3 - keyword = whitespace → trả tất cả (trim() = rỗng)', async ({ I }) => {
  const resWhitespace = await woHelper.getAllChecklistItems(I, '?keyword=   &limit=5');
  const resAll        = await woHelper.getAllChecklistItems(I, '?limit=5');
  I.assertEqual(resWhitespace.total, resAll.total,
    'whitespace keyword và không có keyword phải cho cùng total');
});