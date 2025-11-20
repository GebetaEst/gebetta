import axios from 'axios';
import { AnalyticsData, Period } from '../types/analytics';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://api.ethiopianrecipe.com/v1'; // Replace with your actual API URL

export const analyticsAPI = {
  getAnalytics: async (period: Period): Promise<AnalyticsData> => {
    try {
      const { user } = useAuth();
      const response = await axios.get(`${API_URL}/analytics`, {
        params: {
          period,
          restaurantId: user?.restaurantId,
        },
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch analytics data');
    }
  },

  getPopularItems: async (period: Period): Promise<AnalyticsData['popularItems']> => {
    try {
      const { user } = useAuth();
      const response = await axios.get(`${API_URL}/analytics/popular-items`, {
        params: {
          period,
          restaurantId: user?.restaurantId,
        },
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch popular items data');
    }
  },

  getOrderTrends: async (period: Period): Promise<AnalyticsData['orderTrends']> => {
    try {
      const { user } = useAuth();
      const response = await axios.get(`${API_URL}/analytics/orders-trend`, {
        params: {
          period,
          restaurantId: user?.restaurantId,
        },
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch order trends data');
    }
  },
};