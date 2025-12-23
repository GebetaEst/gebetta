/**
 * Delivery Tracking Demo Component
 * 
 * This component demonstrates how to use the real-time delivery tracking system.
 * Use this for testing and as a reference implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface DeliveryTrackingDemoProps {
  orderId: string;
}

export const DeliveryTrackingDemo: React.FC<DeliveryTrackingDemoProps> = ({ orderId }) => {
  const { 
    deliveryOrder, 
    deliveryGuy, 
    isLoading, 
    error, 
    currentLocation 
  } = useDeliveryTracking(orderId);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading tracking data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.info}>
          Make sure the delivery guy has accepted the order and is sending location updates.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚚 Delivery Tracking Demo</Text>
      
      {/* Current Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Current Location</Text>
        {currentLocation ? (
          <View>
            <Text style={styles.dataLabel}>Latitude:</Text>
            <Text style={styles.dataValue}>{currentLocation.latitude.toFixed(6)}</Text>
            <Text style={styles.dataLabel}>Longitude:</Text>
            <Text style={styles.dataValue}>{currentLocation.longitude.toFixed(6)}</Text>
            {currentLocation.accuracy && (
              <>
                <Text style={styles.dataLabel}>Accuracy:</Text>
                <Text style={styles.dataValue}>{currentLocation.accuracy}m</Text>
              </>
            )}
            {currentLocation.timestamp && (
              <>
                <Text style={styles.dataLabel}>Timestamp:</Text>
                <Text style={styles.dataValue}>
                  {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </Text>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.noData}>No location data available</Text>
        )}
      </View>

      {/* Delivery Order Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Delivery Order</Text>
        {deliveryOrder ? (
          <View>
            <Text style={styles.dataLabel}>Order ID:</Text>
            <Text style={styles.dataValue}>{deliveryOrder.orderId}</Text>
            
            <Text style={styles.dataLabel}>Status:</Text>
            <Text style={[styles.dataValue, styles.status]}>
              {deliveryOrder.status}
            </Text>
            
            {deliveryOrder.orderCode && (
              <>
                <Text style={styles.dataLabel}>Order Code:</Text>
                <Text style={styles.dataValue}>{deliveryOrder.orderCode}</Text>
              </>
            )}
            
            {deliveryOrder.lastLocationUpdate && (
              <>
                <Text style={styles.dataLabel}>Last Update:</Text>
                <Text style={styles.dataValue}>
                  {new Date(deliveryOrder.lastLocationUpdate).toLocaleString()}
                </Text>
              </>
            )}

            {deliveryOrder.trackingEnabled !== undefined && (
              <>
                <Text style={styles.dataLabel}>Tracking Enabled:</Text>
                <Text style={styles.dataValue}>
                  {deliveryOrder.trackingEnabled ? '✅ Yes' : '❌ No'}
                </Text>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.noData}>No order data available</Text>
        )}
      </View>

      {/* Delivery Person Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Delivery Person</Text>
        {deliveryOrder?.deliveryPerson || deliveryGuy?.deliveryPerson ? (
          <View>
            <Text style={styles.dataLabel}>Name:</Text>
            <Text style={styles.dataValue}>
              {deliveryGuy?.deliveryPerson?.name || deliveryOrder?.deliveryPerson?.name}
            </Text>
            
            <Text style={styles.dataLabel}>Phone:</Text>
            <Text style={styles.dataValue}>
              {deliveryGuy?.deliveryPerson?.phone || deliveryOrder?.deliveryPerson?.phone}
            </Text>
            
            {(deliveryGuy?.deliveryPerson?.deliveryMethod || deliveryOrder?.deliveryPerson?.deliveryMethod) && (
              <>
                <Text style={styles.dataLabel}>Vehicle:</Text>
                <Text style={styles.dataValue}>
                  {deliveryGuy?.deliveryPerson?.deliveryMethod || deliveryOrder?.deliveryPerson?.deliveryMethod}
                </Text>
              </>
            )}

            {deliveryGuy?.isOnline !== undefined && (
              <>
                <Text style={styles.dataLabel}>Online Status:</Text>
                <Text style={styles.dataValue}>
                  {deliveryGuy.isOnline ? '🟢 Online' : '⚫ Offline'}
                </Text>
              </>
            )}

            {deliveryGuy?.isTracking !== undefined && (
              <>
                <Text style={styles.dataLabel}>Location Tracking:</Text>
                <Text style={styles.dataValue}>
                  {deliveryGuy.isTracking ? '📍 Active' : '⏸️ Inactive'}
                </Text>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.noData}>No delivery person assigned yet</Text>
        )}
      </View>

      {/* Firebase Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Firebase Status</Text>
        <Text style={styles.dataLabel}>Connection:</Text>
        <Text style={[styles.dataValue, styles.success]}>
          ✅ Connected
        </Text>
        <Text style={styles.dataLabel}>Real-time Updates:</Text>
        <Text style={[styles.dataValue, styles.success]}>
          ✅ Active
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ How It Works</Text>
        <Text style={styles.instruction}>
          1. The delivery person's app sends location updates to Firebase every 3-10 seconds
        </Text>
        <Text style={styles.instruction}>
          2. This component listens to Firebase Realtime Database
        </Text>
        <Text style={styles.instruction}>
          3. Location updates appear automatically when delivery guy moves
        </Text>
        <Text style={styles.instruction}>
          4. Check the map view for visual representation
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Refresh rate: 3-10 seconds based on delivery status
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.heading2,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    ...typography.heading4,
    marginBottom: 12,
    color: colors.primary,
  },
  dataLabel: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginTop: 8,
    fontWeight: '600',
  },
  dataValue: {
    ...typography.body,
    marginBottom: 4,
  },
  status: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: 18,
  },
  success: {
    color: '#22c55e',
    fontWeight: '600',
  },
  error: {
    ...typography.body,
    color: '#ef4444',
    marginBottom: 12,
  },
  noData: {
    ...typography.bodySmall,
    color: colors.lightText,
    fontStyle: 'italic',
  },
  info: {
    ...typography.bodySmall,
    color: colors.lightText,
    textAlign: 'center',
    marginTop: 8,
  },
  instruction: {
    ...typography.bodySmall,
    marginBottom: 8,
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerText: {
    ...typography.caption,
    color: colors.lightText,
    textAlign: 'center',
  },
});

export default DeliveryTrackingDemo;

