import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../firebase';

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  deliveryMethod?: string;
}

export interface DeliveryOrder {
  orderId: string;
  orderCode?: string;
  status: string;
  acceptedAt?: string;
  deliveryPerson?: DeliveryPerson;
  restaurantLocation?: DeliveryLocation;
  deliveryLocation?: DeliveryLocation;
  deliveryFee?: number;
  tip?: number;
  trackingEnabled?: boolean;
  lastLocationUpdate?: string;
  locationHistory?: Record<string, {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
    status: string;
    recordedAt: string;
  }>;
}

export interface DeliveryGuy {
  currentLocation?: DeliveryLocation;
  lastLocationUpdate?: string;
  deliveryPerson?: DeliveryPerson;
  isOnline?: boolean;
  isTracking?: boolean;
  activeOrderId?: string | null;
  status?: string;
  locationHistory?: Record<string, {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
    status: string;
    recordedAt: string;
    activeOrderId?: string | null;
  }>;
}

export interface UseDeliveryTrackingReturn {
  deliveryOrder: DeliveryOrder | null;
  deliveryGuy: DeliveryGuy | null;
  isLoading: boolean;
  error: string | null;
  currentLocation: DeliveryLocation | null;
}

/**
 * Custom hook to track delivery order in real-time using Firebase Realtime Database
 * @param orderId - The order ID to track
 * @returns Delivery order data, delivery guy location, loading state, and error
 */
export const useDeliveryTracking = (orderId: string): UseDeliveryTrackingReturn => {
  const [deliveryOrder, setDeliveryOrder] = useState<DeliveryOrder | null>(null);
  const [deliveryGuy, setDeliveryGuy] = useState<DeliveryGuy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<DeliveryLocation | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is required');
      setIsLoading(false);
      return;
    }

    console.log('🔥 Setting up Firebase listeners for order:', orderId);
    
    // Reference to the specific delivery order
    const orderRef = ref(database, `deliveryOrders/${orderId}`);
    
    // Listen for real-time updates to the order
    const unsubscribeOrder = onValue(
      orderRef,
      (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          console.log('📦 Order data received:', data);
          setDeliveryOrder(data as DeliveryOrder);
          
          // Update current location from order
          if (data.deliveryLocation) {
            setCurrentLocation(data.deliveryLocation);
          }
          
          // If we have a delivery person, listen to their direct location updates
          if (data.deliveryPerson && data.deliveryPerson.id) {
            const deliveryGuyRef = ref(database, `deliveryGuys/${data.deliveryPerson.id}`);
            
            // Listen for real-time updates to delivery guy location
            const unsubscribeDeliveryGuy = onValue(
              deliveryGuyRef,
              (deliveryGuySnapshot) => {
                const deliveryGuyData = deliveryGuySnapshot.val();
                
                if (deliveryGuyData) {
                  console.log('🚚 Delivery guy data received:', deliveryGuyData);
                  setDeliveryGuy(deliveryGuyData as DeliveryGuy);
                  
                  // Update current location from delivery guy (more frequent updates)
                  if (deliveryGuyData.currentLocation) {
                    setCurrentLocation(deliveryGuyData.currentLocation);
                  }
                }
              },
              (error) => {
                console.error('❌ Error listening to delivery guy data:', error);
              }
            );
            
            // Store unsubscribe function for cleanup
            return () => {
              console.log('🔌 Cleaning up delivery guy listener');
              off(deliveryGuyRef);
            };
          }
          
          setError(null);
        } else {
          console.log('⚠️ No order data found');
          setError('Order not found or not being tracked yet');
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ Error listening to order data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    );

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up order listener');
      off(orderRef);
    };
  }, [orderId]);

  return {
    deliveryOrder,
    deliveryGuy,
    isLoading,
    error,
    currentLocation,
  };
};

/**
 * Custom hook to get location history for a delivery order
 * @param orderId - The order ID
 * @returns Location history array
 */
export const useDeliveryLocationHistory = (orderId: string) => {
  const [locationHistory, setLocationHistory] = useState<DeliveryLocation[]>([]);

  useEffect(() => {
    if (!orderId) return;

    const historyRef = ref(database, `deliveryOrders/${orderId}/locationHistory`);

    const unsubscribe = onValue(
      historyRef,
      (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          // Convert object to array and sort by timestamp
          const historyArray = Object.values(data).sort((a: any, b: any) => a.timestamp - b.timestamp);
          setLocationHistory(historyArray);
        }
      },
      (error) => {
        console.error('❌ Error listening to location history:', error);
      }
    );

    return () => {
      off(historyRef);
    };
  }, [orderId]);

  return locationHistory;
};

