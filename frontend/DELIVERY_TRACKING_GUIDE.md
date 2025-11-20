# 🚚 Real-Time Delivery Tracking System - User Mobile Application

This guide explains how the **user mobile application** tracks delivery orders in real-time using Firebase Realtime Database. The delivery person's location is sent from the delivery guy mobile app and displayed live on the user's map.

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Firebase Database Structure](#firebase-database-structure)
- [How It Works](#how-it-works)
- [Features](#features)
- [Implementation](#implementation)
- [Usage](#usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The delivery tracking system consists of two main parts:

1. **Delivery Guy Mobile App** - Sends real-time location updates to Firebase
2. **User Mobile App (This App)** - Displays the delivery person's location on a map

### Flow:
```
Delivery Guy App → Firebase Realtime Database → User Mobile App
     (Sends location)         (Stores data)        (Displays on map)
```

---

## 🏗️ Architecture

### Components

1. **Firebase Configuration** (`firebase.js`)
   - Initializes Firebase app
   - Configures Realtime Database connection

2. **Custom Hook** (`hooks/useDeliveryTracking.ts`)
   - Listens to Firebase real-time updates
   - Manages delivery order and location state
   - Auto-updates when delivery guy sends location

3. **Delivery Tracking Screen** (`app/delivery-tracking/[id].tsx`)
   - Displays interactive map
   - Shows delivery person's live location
   - Displays route polylines
   - Shows delivery status and information

---

## 🔥 Firebase Database Structure

The delivery guy app sends data to two main nodes:

### 1. Order-Specific Tracking: `deliveryOrders/{orderId}/`

```json
{
  "orderId": "order_123",
  "orderCode": "ORD-001",
  "status": "PickedUp",
  "acceptedAt": "2025-10-20T10:30:00Z",
  "deliveryPerson": {
    "id": "driver_456",
    "name": "John Doe",
    "phone": "+251912345678",
    "deliveryMethod": "Motor"
  },
  "restaurantLocation": {
    "latitude": 9.0125,
    "longitude": 38.7635
  },
  "deliveryLocation": {
    "latitude": 9.0130,
    "longitude": 38.7640,
    "accuracy": 10,
    "timestamp": 1729419000000
  },
  "lastLocationUpdate": "2025-10-20T10:35:00Z",
  "trackingEnabled": true,
  "locationHistory": {
    "timestamp_1": {
      "latitude": 9.0125,
      "longitude": 38.7635,
      "accuracy": 10,
      "timestamp": 1729419000000,
      "status": "PickedUp",
      "recordedAt": "2025-10-20T10:35:00Z"
    }
  }
}
```

### 2. Delivery Guy Direct Tracking: `deliveryGuys/{userId}/`

```json
{
  "currentLocation": {
    "latitude": 9.0130,
    "longitude": 38.7640,
    "accuracy": 10,
    "timestamp": 1729419000000
  },
  "lastLocationUpdate": "2025-10-20T10:35:00Z",
  "deliveryPerson": {
    "id": "driver_456",
    "name": "John Doe",
    "phone": "+251912345678",
    "deliveryMethod": "Motor"
  },
  "isOnline": true,
  "isTracking": true,
  "activeOrderId": "order_123",
  "status": "PickedUp",
  "locationHistory": {
    "timestamp_1": {
      "latitude": 9.0130,
      "longitude": 38.7640,
      "accuracy": 10,
      "timestamp": 1729419000000,
      "status": "PickedUp",
      "recordedAt": "2025-10-20T10:35:00Z",
      "activeOrderId": "order_123"
    }
  }
}
```

---

## 🔄 How It Works

### Step-by-Step Flow:

1. **Order Placement**
   - User places an order in the app
   - Order ID is generated (e.g., "order_123")

2. **Order Acceptance**
   - Delivery guy accepts the order in their app
   - Firebase `deliveryOrders/{orderId}` node is created
   - Status: `"Accepted"`
   - Location updates start every **10 seconds**

3. **Real-Time Tracking Begins**
   - User navigates to tracking screen: `/delivery-tracking/[id]`
   - `useDeliveryTracking` hook initializes Firebase listeners
   - Listens to both `deliveryOrders/{orderId}` and `deliveryGuys/{userId}`

4. **Location Updates (from Delivery Guy App)**
   ```javascript
   // Delivery Guy App sends this every 3-10 seconds:
   {
     latitude: 9.0130,
     longitude: 38.7640,
     accuracy: 10,
     timestamp: Date.now()
   }
   ```

5. **User App Receives Update**
   - Firebase triggers `onValue` listener
   - `useDeliveryTracking` hook updates state
   - Map marker position updates automatically
   - "LIVE" indicator shows last update time

6. **Status Changes**
   - **Accepted** → Driver heading to restaurant (10s updates)
   - **PickedUp** → Driver heading to customer (5s updates)
   - **InTransit** → Actively delivering (3s updates)
   - **Delivered** → Tracking stops

---

## ✨ Features

### 🗺️ Interactive Map
- **Restaurant Marker** (Orange 🍴) - Where the order is being prepared
- **Delivery Person Marker** (Blue 🚗) - Live location of driver
- **Destination Marker** (Green 📍) - Customer's delivery address
- **User Location Marker** (Blue Dot) - Your current location (optional)

### 📍 Route Visualization
- **Dashed Line** (Orange) - Restaurant → Driver (when status is "Accepted")
- **Solid Line** (Blue) - Driver → Customer (when status is "PickedUp" or "InTransit")

### 🔴 Live Status Indicator
- **Green "LIVE" badge** - Shows active tracking
- **Last Update Time** - Shows when location was last updated
- **Auto-refresh** - Updates every 3-10 seconds based on status

### 📊 Delivery Information
- **Current Status** - Shows delivery status from Firebase
- **Estimated Arrival** - Calculated delivery time
- **Driver Details** - Name, phone, vehicle type
- **Call/Message Driver** - Quick contact buttons
- **Delivery Address** - Your delivery location

---

## 💻 Implementation

### 1. Firebase Configuration

First, ensure Firebase is configured in `firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export default app;
```

### 2. Using the Tracking Hook

```typescript
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';

const MyComponent = () => {
  const { 
    deliveryOrder,      // Complete order data from Firebase
    deliveryGuy,        // Delivery person's data
    isLoading,          // Loading state
    error,              // Error message if any
    currentLocation     // Current delivery person location
  } = useDeliveryTracking(orderId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <MapView>
      {currentLocation && (
        <Marker coordinate={currentLocation} />
      )}
    </MapView>
  );
};
```

### 3. Displaying on Map

```typescript
<MapView>
  {/* Driver location marker */}
  {currentLocation && (
    <Marker
      coordinate={currentLocation}
      title={deliveryGuy?.deliveryPerson?.name || "Driver"}
      description={`Status: ${deliveryOrder?.status}`}
    >
      <View style={styles.driverMarker}>
        <Navigation size={24} color="#fff" />
      </View>
    </Marker>
  )}

  {/* Route polyline */}
  {currentLocation && destinationLocation && (
    <Polyline
      coordinates={[currentLocation, destinationLocation]}
      strokeColor="#4285F4"
      strokeWidth={4}
    />
  )}
</MapView>
```

---

## 📱 Usage

### For Users:

1. **Place an Order**
   ```typescript
   // Order is created with unique ID
   const orderId = "order_123";
   ```

2. **Navigate to Tracking**
   ```typescript
   router.push(`/delivery-tracking/${orderId}`);
   ```

3. **View Live Tracking**
   - Map automatically loads
   - Firebase listeners activate
   - Location updates appear in real-time

4. **Monitor Delivery**
   - Watch driver's live location
   - See route and estimated time
   - Contact driver if needed

### For Developers:

```typescript
// Basic implementation
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';

function DeliveryTracker({ orderId }: { orderId: string }) {
  const { 
    currentLocation, 
    deliveryOrder, 
    isLoading 
  } = useDeliveryTracking(orderId);

  return (
    <View>
      {isLoading && <Text>Loading...</Text>}
      {currentLocation && (
        <Text>
          Driver at: {currentLocation.latitude}, {currentLocation.longitude}
        </Text>
      )}
      <Text>Status: {deliveryOrder?.status}</Text>
    </View>
  );
}
```

---

## 🧪 Testing

### Test Scenario 1: Order Acceptance

1. Create test order in user app
2. Accept order in delivery guy app
3. Verify Firebase `deliveryOrders/{orderId}` node created
4. Check user app shows "Order Accepted" status

### Test Scenario 2: Location Updates

1. Open tracking screen in user app
2. Move delivery guy app to different location
3. Wait 3-10 seconds
4. Verify marker moves on user's map
5. Check "LIVE" indicator shows recent update

### Test Scenario 3: Status Changes

1. Accept order → Check map shows dashed line to restaurant
2. Pick up order → Check map shows solid line to customer
3. Complete delivery → Check tracking stops

### Firebase Database Rules Testing

```json
{
  "rules": {
    "deliveryOrders": {
      "$orderId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "deliveryGuys": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

---

## 🔧 Troubleshooting

### Issue: Location Not Updating

**Symptoms:**
- Map shows old location
- "LIVE" indicator not updating
- Marker not moving

**Solutions:**
1. Check Firebase connection:
   ```typescript
   console.log('Firebase database:', database);
   ```

2. Verify order ID is correct:
   ```typescript
   console.log('Tracking order:', orderId);
   ```

3. Check Firebase Console:
   - Go to Firebase Console
   - Navigate to Realtime Database
   - Find `deliveryOrders/{your_order_id}`
   - Verify data exists and is updating

4. Check delivery guy app is sending updates:
   ```javascript
   // Should see this in delivery guy app logs:
   console.log('📍 Location sent to server:', currentLocation);
   console.log('🔥 Location sent to Firebase for order:', orderId);
   ```

### Issue: "Order Not Found or Not Being Tracked Yet"

**Solutions:**
1. Delivery guy hasn't accepted order yet
2. Order ID doesn't exist in Firebase
3. Firebase security rules blocking read access
4. Check Firebase rules allow authenticated reads

### Issue: Map Not Showing

**Solutions:**
1. Check Google Maps API key configured
2. Verify `react-native-maps` installed
3. Check platform-specific setup:
   ```bash
   # iOS
   cd ios && pod install
   
   # Android - check AndroidManifest.xml has Maps API key
   ```

### Issue: Delayed Updates

**Solutions:**
1. Check internet connection
2. Verify delivery guy app is running
3. Check Firebase hosting region (closer = faster)
4. Optimize update intervals in delivery guy app

---

## 📊 Performance Optimization

### Battery Optimization
- Updates are dynamic: 10s → 5s → 3s based on status
- Stops updates when delivery completed
- Uses background location efficiently

### Data Efficiency
- Only essential location data sent
- Location history capped per order
- Old history auto-cleaned after delivery

### Network Optimization
- Firebase uses efficient WebSocket connection
- Real-time updates with minimal latency
- Automatic reconnection on network loss

---

## 🎓 Advanced Usage

### Custom Location History

```typescript
import { useDeliveryLocationHistory } from '@/hooks/useDeliveryTracking';

function RouteHistory({ orderId }: { orderId: string }) {
  const locationHistory = useDeliveryLocationHistory(orderId);

  return (
    <MapView>
      <Polyline
        coordinates={locationHistory}
        strokeColor="#FF6B6B"
        strokeWidth={2}
      />
    </MapView>
  );
}
```

### Manual Refresh

```typescript
const { deliveryOrder, currentLocation } = useDeliveryTracking(orderId);

// Firebase auto-updates, but you can force UI refresh:
useEffect(() => {
  // Will trigger when currentLocation changes
  console.log('Location updated:', currentLocation);
}, [currentLocation]);
```

### Custom Markers

```typescript
<Marker
  coordinate={currentLocation}
  anchor={{ x: 0.5, y: 0.5 }}
  tracksViewChanges={false} // Performance optimization
>
  <Image 
    source={require('./delivery-bike.png')} 
    style={{ width: 40, height: 40 }}
  />
</Marker>
```

---

## 📞 Support

For issues or questions:
1. Check Firebase Console for data
2. Review delivery guy app logs
3. Verify Firebase rules
4. Check network connectivity

---

## 🎉 Summary

You now have a **fully functional real-time delivery tracking system**!

- ✅ Firebase Realtime Database configured
- ✅ Custom hooks for real-time updates
- ✅ Interactive map with live markers
- ✅ Route visualization with polylines
- ✅ Status tracking and driver information
- ✅ Auto-updating every 3-10 seconds
- ✅ Error handling and loading states

**Next Steps:**
1. Test with real orders
2. Customize UI to match your brand
3. Add notifications when status changes
4. Implement geofencing for auto-status updates

Happy tracking! 🚚📍

