const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  createServiceCenter
} = require('../helpers/bookingHelpers');

Feature('Booking Service - Full Test');

// =======================
// 🔹 BOOKING TEST
// =======================

Scenario('Tạo booking hợp lệ', async ({ I }) => {
  const booking = await createBooking(I);
  I.seeResponseContainsJson({ status: 'pending' });
  I.seeResponseContainsJson({ userId: 2 });
  I.seeResponseContainsJson({ vehicleId: 1 });
  I.seeResponseContainsJson({ serviceCenterId: 1 });
  I.seeResponseContainsJson({ notes: 'Ghi chú đặt lịch từ testcase' });
});

Scenario('Tạo booking thiếu trường bắt buộc userId', async ({ I }) => {
  await createBooking(I, {
    userId: undefined
  }, 400);
});

Scenario('Tạo booking thiếu trường bắt buộc serviceCenterId', async ({ I }) => {
  await createBooking(I, {
    serviceCenterId: undefined
  }, 400);
});

Scenario('Tạo booking thiếu timeSlot', async ({ I }) => {
  await createBooking(I, {
    timeSlot: undefined
  }, 400);
});

Scenario('Tạo booking với timeSlot rỗng', async ({ I }) => {
  await createBooking(I, {
    timeSlot: ''
  }, 400);
});

Scenario('Tạo booking thiếu startTime', async ({ I }) => {
  await createBooking(I, {
    startTime: undefined
  }, 400);
});

Scenario('Tạo booking thiếu date', async ({ I }) => {
  await createBooking(I, {
    date: undefined
  }, 400);
});

Scenario('Tạo booking với date sai định dạng', async ({ I }) => {
  await createBooking(I, {
    date: '25-03-2026'
  }, 400);
});

Scenario('Tạo booking với ngày quá khứ', async ({ I }) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await createBooking(I, {
    date: yesterday.toISOString().split('T')[0]
  }, 400);
});

Scenario('Tạo booking với timeSlot quá dài', async ({ I }) => {
  await createBooking(I, {
    timeSlot: 'X'.repeat(51)
  }, 400);
});

Scenario('Tạo booking với ghi chú quá dài', async ({ I }) => {
  await createBooking(I, {
    notes: 'X'.repeat(501)
  }, 400);
});

Scenario('Tạo booking với userId không tồn tại', async ({ I }) => {
  await createBooking(I, {
    userId: 999999
  }, 404);
});

Scenario('Lấy danh sách booking', async ({ I }) => {
  await getBookings(I);
});

Scenario('Lấy booking theo ID thành công', async ({ I }) => {
  const booking = await createBooking(I);
  await getBookingById(I, booking.id);
});

Scenario('Lấy booking theo ID không tồn tại', async ({ I }) => {
  await getBookingById(I, 999999, 404);
});

Scenario('Cập nhật booking không tồn tại', async ({ I }) => {
  await updateBooking(I, 999999, {
    status: 'confirmed'
  }, 404);
});

Scenario('Cập nhật trạng thái booking sang confirmed', async ({ I }) => {
  const booking = await createBooking(I);
  const updated = await updateBooking(I, booking.id, {
    status: 'confirmed',
    notes: 'Đã gọi điện xác nhận với khách hàng.'
  });

  I.seeResponseContainsJson({ status: 'confirmed' });
  I.seeResponseContainsJson({ notes: 'Đã gọi điện xác nhận với khách hàng.' });
  I.seeResponseContainsJson({ id: booking.id });
});

Scenario('Xóa booking thành công', async ({ I }) => {
  const booking = await createBooking(I);
  await deleteBooking(I, booking.id);
});
Scenario('Xóa booking không tồn tại', async ({ I }) => {
  await deleteBooking(I, 999999, 404);
});
// =======================
// 🔹 SERVICE CENTER TEST
// =======================

Scenario('Tạo service center thành công', async ({ I }) => {
  await createServiceCenter(I, {
    name: 'Service Center A',
    phone: '0901234567'
  });
});

Scenario('Tạo service center với tên quá ngắn', async ({ I }) => {
  await createServiceCenter(I, {
    name: 'AB'
  }, 400);
});

Scenario('Tạo service center với phone chứa ký tự lạ', async ({ I }) => {
  await createServiceCenter(I, {
    phone: '09012A4567'
  }, 400);
});

Scenario('Tạo service center với phone thiếu số', async ({ I }) => {
  await createServiceCenter(I, {
    phone: '090123456'
  }, 400);
});

Scenario('Tạo service center với phone không hợp lệ', async ({ I }) => {
  await createServiceCenter(I, {
    phone: '090123456789'
  }, 400);
});

Scenario('Tạo service center thiếu tên', async ({ I }) => {
  await createServiceCenter(I, {
    name: undefined
  }, 400);
});

Scenario('Tạo service center thiếu phone', async ({ I }) => {
  await createServiceCenter(I, {
    phone: undefined
  }, 400);
});
