// helpers/workorderHelpers.js
// Pattern: giống vehicleHelpers.js - globalState + authenticate + API functions

let globalState = {
  token: null,
  currentWorkOrderId: null,
  currentChecklistItemId: null,
  currentTotalPrice: 0,
  currentAppointmentId: null,
};

module.exports = {

  // ─────────────────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────────────────
  async authenticate(I, credentials = { email: 'Admin001@gmail.com', password: '123456' }) {
    const res = await I.sendPostRequest('/auth/login', credentials);
    I.seeResponseCodeIs(200);

    globalState.token = res.data.token || res.data.accessToken;
    I.haveRequestHeaders({ Authorization: `Bearer ${globalState.token}` });
    return res.data;
  },

  getStoredData() {
    return globalState;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F1 – getAllWorkOrders
  // ─────────────────────────────────────────────────────────
  async getAllWorkOrders(I, queryParams = '', expectedCode = 200) {
    const res = await I.sendGetRequest(`/workorder${queryParams}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F2 – getWorkOrderById
  // ─────────────────────────────────────────────────────────
  async getWorkOrderById(I, id, expectedCode = 200) {
    const res = await I.sendGetRequest(`/workorder/${id}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F3 – createWorkOrder
  // ─────────────────────────────────────────────────────────
  async createWorkOrder(I, data, expectedCode = 201, saveToGlobalState = true) {
    const res = await I.sendPostRequest('/workorder', data);
    I.seeResponseCodeIs(expectedCode);

    if (expectedCode === 201 && saveToGlobalState) {
      const newId = res.data?.id || res.data?.data?.id;
      if (newId) {
        globalState.currentWorkOrderId = newId;
        globalState.currentTotalPrice = res.data?.totalPrice ?? 0;
        globalState.currentAppointmentId = res.data?.appointmentId;
      }
    }

    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F4 – updateWorkOrder
  // ─────────────────────────────────────────────────────────
  async updateWorkOrder(I, id, data, expectedCode = 200) {
    const res = await I.sendPutRequest(`/workorder/${id}`, data);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F5 – deleteWorkOrder
  // ─────────────────────────────────────────────────────────
  async deleteWorkOrder(I, id, expectedCode = 200) {
    const res = await I.sendDeleteRequest(`/workorder/${id}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F6 – addChecklistItem
  // ─────────────────────────────────────────────────────────
  async addChecklistItem(I, workOrderId, data, expectedCode = 201, saveToGlobalState = true) {
    const res = await I.sendPostRequest(`/workorder/${workOrderId}/checklist`, data);
    I.seeResponseCodeIs(expectedCode);

    if (expectedCode === 201 && saveToGlobalState) {
      const newId = res.data?.id || res.data?.data?.id;
      if (newId) globalState.currentChecklistItemId = newId;
    }

    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F7 – getChecklistItems
  // ─────────────────────────────────────────────────────────
  async getChecklistItems(I, workOrderId, expectedCode = 200) {
    const res = await I.sendGetRequest(`/workorder/${workOrderId}/checklist`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F8 – getChecklistItemById
  // ─────────────────────────────────────────────────────────
  async getChecklistItemById(I, workOrderId, checklistId, expectedCode = 200) {
    const res = await I.sendGetRequest(`/workorder/${workOrderId}/checklist/${checklistId}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F9 – updateChecklistItem
  // ─────────────────────────────────────────────────────────
  async updateChecklistItem(I, workOrderId, checklistId, data, expectedCode = 200) {
    const res = await I.sendPutRequest(
      `/workorder/${workOrderId}/checklist/${checklistId}`,
      data
    );
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F10 – deleteChecklistItem
  // ─────────────────────────────────────────────────────────
  async deleteChecklistItem(I, workOrderId, checklistId, expectedCode = 200) {
    const res = await I.sendDeleteRequest(
      `/workorder/${workOrderId}/checklist/${checklistId}`
    );
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F11 – getAllChecklistItems
  // ─────────────────────────────────────────────────────────
  async getAllChecklistItems(I, queryParams = '', expectedCode = 200) {
    const res = await I.sendGetRequest(`/workorder/checklist/all${queryParams}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F12 – getWorkOrderByAppointmentId
  // ─────────────────────────────────────────────────────────
  async getWorkOrderByAppointmentId(I, appointmentId, expectedCode = 200) {
    const res = await I.sendGetRequest(`/workorder/appointment/${appointmentId}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F13 – getRevenueStats
  // ─────────────────────────────────────────────────────────
  async getRevenueStats(I, year = null, expectedCode = 200) {
    const url = year
      ? `/workorder/stats/revenue?year=${year}`
      : '/workorder/stats/revenue';
    const res = await I.sendGetRequest(url);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // WO_F14 – getTaskStats
  // ─────────────────────────────────────────────────────────
  async getTaskStats(I, expectedCode = 200) {
    const res = await I.sendGetRequest('/workorder/stats/tasks');
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },
};