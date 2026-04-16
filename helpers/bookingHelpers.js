const DEFAULT_BOOKING = {
  userId: 2,
  vehicleId: 1,
  serviceCenterId: 1,
  createdById: 2,
  date: getISODateOffset(1),
  startTime: getISODateOffset(1),
  endTime: getISODateOffset(1),
  timeSlot: '08:00 - 09:00',
  notes: 'Ghi chú đặt lịch từ testcase'
};

function getISODateOffset(days = 1) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function createBookingPayload(overrides = {}) {
  return {
    ...DEFAULT_BOOKING,
    date: getISODateOffset(1),
    startTime: getISODateOffset(1),
    endTime: getISODateOffset(1),
    ...overrides
  };
}

async function createBooking(I, payload = {}, expectedCode = 201) {
  const response = await I.sendPostRequest('/booking', createBookingPayload(payload));
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 201 ? response.data.data : response.data;
}

async function getBookings(I, expectedCode = 200) {
  const response = await I.sendGetRequest('/booking');
  I.seeResponseCodeIs(expectedCode);
  return response.data.data || response.data;
}

async function getBookingById(I, bookingId, expectedCode = 200) {
  const response = await I.sendGetRequest(`/booking/${bookingId}`);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data.data : response.data;
}

async function updateBooking(I, bookingId, payload, expectedCode = 200) {
  const response = await I.sendPutRequest(`/booking/${bookingId}`, payload);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data.data : response.data;
}

async function deleteBooking(I, bookingId, expectedCode = 200) {
  const response = await I.sendDeleteRequest(`/booking/${bookingId}`);
  I.seeResponseCodeIs(expectedCode);
  return response.data;
}

async function createServiceCenter(I, payload = {}, expectedCode = 201) {
  const defaultPayload = {
    name: 'Service Center Test',
    address: 'Q12, Ho Chi Minh City',
    phone: '0901234567'
  };

  const response = await I.sendPostRequest('/service-center', {
    ...defaultPayload,
    ...payload
  });
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 201 ? response.data : response.data;
}

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  createServiceCenter
};
