function getISODateOffset(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function createFinancePayload(overrides = {}) {
  return {
    customerId: 1,
    amount: 1000,
    dueDate: getISODateOffset(7),
    description: 'Test finance invoice',
    appointmentId: 1,
    ...overrides
  };
}

async function createFinance(I, payload = {}, expectedCode = 201) {
  const response = await I.sendPostRequest(
    '/finance',
    createFinancePayload(payload)
  );
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 201 ? response.data : response;
}

async function getFinances(I, expectedCode = 200) {
  const response = await I.sendGetRequest('/finance');
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data.data : response.data;
}

async function getFinanceById(I, id, expectedCode = 200) {
  const response = await I.sendGetRequest(`/finance/${id}`);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data : response;
}

async function updateFinance(I, id, payload, expectedCode = 200) {
  const response = await I.sendPutRequest(`/finance/${id}`, payload);
  I.seeResponseCodeIs(expectedCode);
  return expectedCode === 200 ? response.data : response;
}

async function deleteFinance(I, id, expectedCode = 200) {
  const response = await I.sendDeleteRequest(`/finance/${id}`);
  I.seeResponseCodeIs(expectedCode);
  return response;
}

module.exports = {
  createFinance,
  getFinances,
  getFinanceById,
  updateFinance,
  deleteFinance
};