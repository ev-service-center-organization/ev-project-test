// helpers/inventoryHelpers.js
// Pattern: giống vehicleHelpers.js - globalState + authenticate + API functions

let globalState = {
  token: null,
  currentPartId: null,
  currentPartNumber: null,
  currentQuantity: null,
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

  // ─────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────
  generatePartNumber() {
    return `PN-AUTO-${Date.now()}`;
  },

  getStoredData() {
    return globalState;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F1 – getParts
  // ─────────────────────────────────────────────────────────
  async getParts(I, queryParams = '', expectedCode = 200) {
    const res = await I.sendGetRequest(`/inventory/parts${queryParams}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F2 – getPartById
  // ─────────────────────────────────────────────────────────
  async getPartById(I, id, expectedCode = 200) {
    const res = await I.sendGetRequest(`/inventory/parts/${id}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F3 – addPart
  // ─────────────────────────────────────────────────────────
  async addPart(I, data, expectedCode = 201, saveToGlobalState = true) {
    const res = await I.sendPostRequest('/inventory/parts', data);
    I.seeResponseCodeIs(expectedCode);

    if (expectedCode === 201 && saveToGlobalState) {
      const newId = res.data?.data?.id || res.data?.id;
      const newPartNumber = res.data?.data?.partNumber || res.data?.partNumber;
      const newQuantity = res.data?.data?.quantity ?? res.data?.quantity;
      if (newId) {
        globalState.currentPartId = newId;
        globalState.currentPartNumber = newPartNumber;
        globalState.currentQuantity = newQuantity;
      }
    }

    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F4 – updatePart
  // ─────────────────────────────────────────────────────────
  async updatePart(I, id, data, expectedCode = 200) {
    const res = await I.sendPutRequest(`/inventory/parts/${id}`, data);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F5 – deletePart
  // ─────────────────────────────────────────────────────────
  async deletePart(I, id, expectedCode = 200) {
    const res = await I.sendDeleteRequest(`/inventory/parts/${id}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F6 – updateStock
  // ─────────────────────────────────────────────────────────
  async updateStock(I, id, data, expectedCode = 200) {
    const res = await I.sendPutRequest(`/inventory/parts/${id}/stock`, data);
    I.seeResponseCodeIs(expectedCode);
    if (expectedCode === 200) {
      const newQty = res.data?.data?.quantity ?? res.data?.quantity;
      if (newQty !== undefined) globalState.currentQuantity = newQty;
    }
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F7 – getStockHistory
  // ─────────────────────────────────────────────────────────
  async getStockHistory(I, id, queryParams = '', expectedCode = 200) {
    const res = await I.sendGetRequest(`/inventory/parts/${id}/stock-history${queryParams}`);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },

  // ─────────────────────────────────────────────────────────
  // INV_F8 – getPartsStats
  // ─────────────────────────────────────────────────────────
  async getPartsStats(I, year = null, expectedCode = 200) {
    const url = year
      ? `/inventory/parts/stats/parts?year=${year}`
      : '/inventory/parts/stats/parts';
    const res = await I.sendGetRequest(url);
    I.seeResponseCodeIs(expectedCode);
    return res.data;
  },
};