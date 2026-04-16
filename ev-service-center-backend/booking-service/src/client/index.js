import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
const AUTH_INTERNAL_TOKEN = process.env.AUTH_INTERNAL_TOKEN || '';
const VEHICLE_SERVICE_URL = process.env.VEHICLE_SERVICE_URL || 'http://vehicle-service:5006';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5005';

const authHeaders = AUTH_INTERNAL_TOKEN ? { Authorization: `Bearer ${AUTH_INTERNAL_TOKEN}` } : {};

export const userClient = {
  async getUserById(userId) {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/${userId}`, {
        headers: authHeaders
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching user:', error?.message || error);
      return null;
    }
  },

  async getUsersByIds(userIds) {
    const promises = userIds.map(id => this.getUserById(id));
    return Promise.all(promises);
  }
};

export const vehicleClient = {
  async getVehicleById(vehicleId) {
    try {
      const response = await axios.get(`${VEHICLE_SERVICE_URL}/api/vehicle/${vehicleId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error?.message || error);
      return null;
    }
  },

  async getVehiclesByIds(vehicleIds) {
    const promises = vehicleIds.map(id => this.getVehicleById(id));
    return Promise.all(promises);
  }
};

export const notificationClient = {
  async createNotification(payload) {
    try {
      const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notification`, payload);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error?.message || error);
      return null;
    }
  }
};