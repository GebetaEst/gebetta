# 🏗️ System Architecture - Real-Time Delivery Tracking

## Overview

This document provides a visual and technical overview of how the real-time delivery tracking system works across both the delivery guy mobile app and the user mobile app.

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GEBETA DELIVERY SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                    ┌──────────────────────┐
│  Delivery Guy App    │                    │   User Mobile App    │
│  (Location Sender)   │                    │  (Location Viewer)   │
│                      │                    │                      │
│  • GPS Tracking      │                    │  • Map Display       │
│  • Location Service  │                    │  • Real-time Updates │
│  • Status Updates    │                    │  • Route Display     │
└──────────┬───────────┘                    └───────────┬──────────┘
           │                                            │
           │ Sends every 3-10s                         │ Listens continuously
           │                                            │
           └────────────────┬───────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Firebase Realtime     │
              │       Database          │
              │                         │
              │  • deliveryOrders/      │
              │  • deliveryGuys/        │
              │  • locationHistory/     │
              └─────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Location Update Flow (Delivery Guy → Firebase)

```
┌─────────────────────────────────────────────────────────────┐
│ DELIVERY GUY APP                                             │
└─────────────────────────────────────────────────────────────┘

Step 1: Get Current Location
┌──────────────────┐
│ Location Service │  ← GPS/Network
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Current Location │
│ {lat, lng, acc}  │
└────────┬─────────┘
         │
         ▼

Step 2: Send to Firebase (Every 3-10 seconds)
┌──────────────────┐
│  Firebase Update │
│                  │
│  Path 1:         │
│  deliveryOrders/ │
│    {orderId}/    │
│                  │
│  Path 2:         │
│  deliveryGuys/   │
│    {userId}/     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Firebase Realtime│  ✅ Data stored
│    Database      │
└──────────────────┘
```

### 2. Location Receive Flow (Firebase → User App)

```
┌─────────────────────────────────────────────────────────────┐
│ USER MOBILE APP                                              │
└─────────────────────────────────────────────────────────────┘

Step 1: Initialize Firebase Listener
┌──────────────────────┐
│ useDeliveryTracking  │  Hook initialized with orderId
│      Hook            │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Firebase onValue    │  Listen to:
│     Listener         │  • deliveryOrders/{orderId}
└─────────┬────────────┘  • deliveryGuys/{userId}
          │
          │ Real-time updates
          ▼
┌──────────────────────┐
│   State Update       │  currentLocation updated
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Map Re-render       │  Marker moves to new location
└──────────────────────┘
```

---

## 📦 Component Architecture

### Delivery Guy App Components

```
delivery-provider.tsx
├── Location Tracking Service
│   ├── getCurrentLocation()
│   ├── startLocationTracking()
│   └── stopLocationTracking()
│
├── Firebase Integration
│   ├── updateDeliveryOrder()
│   ├── updateDeliveryGuyLocation()
│   └── addToLocationHistory()
│
└── Status Management
    ├── updateDeliveryStatus()
    ├── acceptOrder()
    └── completeDelivery()
```

### User App Components (This Project)

```
app/delivery-tracking/[id].tsx
├── useDeliveryTracking() Hook
│   ├── Firebase Listeners
│   │   ├── deliveryOrders/{orderId}
│   │   └── deliveryGuys/{userId}
│   │
│   ├── State Management
│   │   ├── deliveryOrder
│   │   ├── deliveryGuy
│   │   ├── currentLocation
│   │   └── isLoading/error
│   │
│   └── Auto-cleanup on unmount
│
├── MapView Component
│   ├── Restaurant Marker
│   ├── Driver Marker (live updates)
│   ├── Destination Marker
│   ├── User Location Marker
│   └── Polylines (route)
│
├── Status Indicator
│   ├── "LIVE" badge
│   ├── Last update time
│   └── Tracking active status
│
└── Driver Information
    ├── Name & Photo
    ├── Phone & Vehicle
    ├── Call/Message buttons
    └── Online status
```

---

## 🔥 Firebase Database Schema

### Node: `deliveryOrders/{orderId}`

```json
{
  "orderId": "order_abc123",
  "orderCode": "ORD-12345",
  "status": "PickedUp",
  "acceptedAt": "2025-10-20T10:30:00.000Z",
  
  "deliveryPerson": {
    "id": "driver_xyz789",
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
  
  "lastLocationUpdate": "2025-10-20T10:35:00.000Z",
  "trackingEnabled": true,
  "deliveryFee": 25,
  "tip": 5,
  
  "locationHistory": {
    "-NxKjHgF": {
      "latitude": 9.0125,
      "longitude": 38.7635,
      "accuracy": 10,
      "timestamp": 1729419000000,
      "status": "Accepted",
      "recordedAt": "2025-10-20T10:30:00.000Z"
    },
    "-NxKjHgG": {
      "latitude": 9.0128,
      "longitude": 38.7637,
      "accuracy": 8,
      "timestamp": 1729419003000,
      "status": "PickedUp",
      "recordedAt": "2025-10-20T10:30:03.000Z"
    }
  }
}
```

### Node: `deliveryGuys/{userId}`

```json
{
  "currentLocation": {
    "latitude": 9.0130,
    "longitude": 38.7640,
    "accuracy": 10,
    "timestamp": 1729419000000
  },
  
  "lastLocationUpdate": "2025-10-20T10:35:00.000Z",
  
  "deliveryPerson": {
    "id": "driver_xyz789",
    "name": "John Doe",
    "phone": "+251912345678",
    "deliveryMethod": "Motor"
  },
  
  "isOnline": true,
  "isTracking": true,
  "activeOrderId": "order_abc123",
  "status": "PickedUp",
  
  "locationHistory": {
    "-NxKjHgF": {
      "latitude": 9.0130,
      "longitude": 38.7640,
      "accuracy": 10,
      "timestamp": 1729419000000,
      "status": "PickedUp",
      "recordedAt": "2025-10-20T10:35:00.000Z",
      "activeOrderId": "order_abc123"
    }
  }
}
```

---

## 🔄 Status Update Flow

```
Order Created
     │
     ▼
┌─────────────────┐
│    Pending      │  No tracking yet
└────────┬────────┘
         │
         │ Delivery guy accepts order
         ▼
┌─────────────────┐
│    Accepted     │  📍 Location updates every 10s
│                 │  Driver heading to restaurant
└────────┬────────┘
         │
         │ Delivery guy picks up food
         ▼
┌─────────────────┐
│   PickedUp      │  📍 Location updates every 5s
│                 │  Driver heading to customer
└────────┬────────┘
         │
         │ Driver starts delivery
         ▼
┌─────────────────┐
│   InTransit     │  📍 Location updates every 3s
│                 │  Active delivery
└────────┬────────┘
         │
         │ Driver arrives at destination
         ▼
┌─────────────────┐
│   Delivered     │  ⏹️ Tracking stops
│                 │  Order completed
└─────────────────┘
```

---

## 🗺️ Map Visualization

### Marker Types

```
🍴 Restaurant Marker
   • Color: Orange (#FF6347)
   • Icon: MapPin
   • Shows: Restaurant name
   • Position: Fixed (restaurant location)

🚗 Driver Marker
   • Color: Blue (#4285F4)
   • Icon: Navigation
   • Shows: Driver name, status
   • Position: Dynamic (updates every 3-10s)

📍 Destination Marker
   • Color: Green (#10B981)
   • Icon: MapPin
   • Shows: Delivery address
   • Position: Fixed (customer address)

🔵 User Location Marker
   • Color: Blue with transparency
   • Icon: Dot
   • Shows: Your location
   • Position: User's GPS location
```

### Polyline Routes

```
Status: "Accepted"
───────────────────
Restaurant ········> Driver (Dashed line, Orange)
(Driver going to restaurant)

Status: "PickedUp" or "InTransit"
──────────────────────────────────
Driver ━━━━━━━> Destination (Solid line, Blue)
(Driver delivering to customer)
```

---

## ⚡ Performance Optimization

### Location Update Intervals

```javascript
// From Delivery Guy App
switch (status) {
  case 'Accepted':
    interval = 10000;  // 10 seconds
    break;
  case 'PickedUp':
    interval = 5000;   // 5 seconds
    break;
  case 'InTransit':
    interval = 3000;   // 3 seconds
    break;
  case 'Delivered':
    // Stop updates
    break;
}
```

### Firebase Listener Optimization

```typescript
// User App - Efficient listeners
useEffect(() => {
  const orderRef = ref(database, `deliveryOrders/${orderId}`);
  
  // Single listener for real-time updates
  const unsubscribe = onValue(orderRef, (snapshot) => {
    // Update state only when data changes
    setDeliveryOrder(snapshot.val());
  });
  
  // Cleanup on unmount
  return () => off(orderRef);
}, [orderId]);
```

### Map Rendering Optimization

```typescript
// Only re-render when location changes
<Marker
  coordinate={currentLocation}
  tracksViewChanges={false}  // Don't track view changes
/>

// Animate map to new location smoothly
mapRef.current.animateToRegion(newRegion, 1000);
```

---

## 🔐 Security & Permissions

### Firebase Security Rules

```json
{
  "rules": {
    "deliveryOrders": {
      "$orderId": {
        ".read": "auth != null",
        ".write": "auth != null && (
          data.child('deliveryPerson/id').val() == auth.uid ||
          !data.exists()
        )"
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

### Mobile App Permissions

**Delivery Guy App:**
- ✅ Location Permission (Foreground & Background)
- ✅ Internet Access

**User Mobile App:**
- ✅ Location Permission (Optional, for "Your Location")
- ✅ Internet Access

---

## 📊 Data Synchronization

### Real-time Sync Flow

```
Delivery Guy Location Change
         │
         ▼
    Send to Firebase
    (update, push)
         │
         ▼
  Firebase Processes
  (validates, stores)
         │
         ▼
   Trigger onValue
   (real-time event)
         │
         ▼
   User App Listener
   (receives update)
         │
         ▼
    State Updated
    (React re-renders)
         │
         ▼
     Map Updates
   (marker moves)
```

### Offline Handling

```
Network Lost
     │
     ▼
Firebase Queues Updates
(stores locally)
     │
     │ Network Restored
     ▼
Auto-sync Queued Data
(sends to database)
     │
     ▼
User App Receives
(shows latest location)
```

---

## 🧪 Testing Architecture

### Test Layers

```
┌─────────────────────────────────────┐
│  Integration Testing                │
│  • End-to-end order flow            │
│  • Real Firebase connection         │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Component Testing                  │
│  • useDeliveryTracking hook         │
│  • MapView rendering                │
│  • Marker positioning               │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Unit Testing                       │
│  • Firebase listeners               │
│  • State updates                    │
│  • Location calculations            │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Considerations

### Environment Setup

```javascript
// Development
const firebaseConfig = {
  databaseURL: "https://gebeta-dev.firebaseio.com"
};

// Production
const firebaseConfig = {
  databaseURL: "https://gebeta-prod.firebaseio.com"
};
```

### Monitoring

```
Firebase Console
├── Realtime Database Usage
│   ├── Read operations/min
│   ├── Write operations/min
│   └── Data stored (GB)
│
├── Analytics
│   ├── Active tracking sessions
│   ├── Average update frequency
│   └── Error rate
│
└── Performance
    ├── Database response time
    ├── Network latency
    └── Connection reliability
```

---

## 📈 Scalability

### Current Capacity

- **Concurrent tracking sessions**: 1000+
- **Updates per second**: 100+
- **Location history per order**: Unlimited
- **Firebase RTD limit**: 100k simultaneous connections

### Optimization Strategies

1. **Data pruning**: Auto-delete old location history
2. **Indexing**: Index by orderId, userId for fast queries
3. **Caching**: Cache frequently accessed data
4. **Load balancing**: Distribute across Firebase regions

---

## 🎯 Success Metrics

- ✅ **Real-time updates**: < 3 seconds latency
- ✅ **Location accuracy**: < 10 meters
- ✅ **Uptime**: 99.9%
- ✅ **Battery impact**: < 5% per hour
- ✅ **Data usage**: < 1MB per delivery

---

## 🔮 Future Enhancements

1. **ML-based ETA**: Predict arrival time using historical data
2. **Route optimization**: Suggest fastest routes
3. **Geofencing**: Auto-detect pickup/delivery
4. **Push notifications**: Real-time status alerts
5. **Analytics dashboard**: Delivery performance metrics

---

This architecture provides a solid foundation for real-time delivery tracking with room for future enhancements and scaling! 🚀

