# 🚀 Quick Start - Real-Time Delivery Tracking

Get your delivery tracking system up and running in 5 minutes!

## Prerequisites

- ✅ Firebase project created
- ✅ React Native development environment
- ✅ Expo installed (if using Expo)
- ✅ Delivery guy mobile app sending location updates

## Step 1: Install Dependencies

```bash
npm install firebase
```

Already done! ✅

## Step 2: Configure Firebase

Your Firebase is already configured in `firebase.js`:

```javascript
import { database } from './firebase';
```

## Step 3: Use the Tracking Hook

In any component:

```typescript
import { useDeliveryTracking } from '@/hooks/useDeliveryTracking';

function MyTrackingScreen() {
  const orderId = "order_123"; // Your order ID
  
  const { 
    currentLocation,    // Current driver location
    deliveryOrder,      // Order details
    deliveryGuy,        // Driver info
    isLoading,          // Loading state
    error               // Error message
  } = useDeliveryTracking(orderId);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <View>
      <Text>Driver at: {currentLocation?.latitude}, {currentLocation?.longitude}</Text>
      <Text>Status: {deliveryOrder?.status}</Text>
    </View>
  );
}
```

## Step 4: Navigate to Tracking Screen

```typescript
import { useRouter } from 'expo-router';

function OrderConfirmation() {
  const router = useRouter();
  const orderId = "order_123";

  return (
    <TouchableOpacity 
      onPress={() => router.push(`/delivery-tracking/${orderId}`)}
    >
      <Text>Track Your Order</Text>
    </TouchableOpacity>
  );
}
```

## Step 5: Test It!

### From Delivery Guy App:
1. Accept an order
2. Start location tracking
3. Move around (or use location simulation)

### From User App:
1. Navigate to `/delivery-tracking/[orderId]`
2. See the driver's location on the map
3. Watch it update every 3-10 seconds

## 🎯 What You Get

✅ **Real-time location updates** from Firebase  
✅ **Interactive map** with markers  
✅ **Route visualization** with polylines  
✅ **Live status indicator**  
✅ **Driver information** (name, phone, vehicle)  
✅ **Auto-refresh** every 3-10 seconds  
✅ **Error handling** and loading states  

## 🧪 Quick Test

Use the demo component to verify everything works:

```typescript
import DeliveryTrackingDemo from '@/components/DeliveryTrackingDemo';

<DeliveryTrackingDemo orderId="your_order_id" />
```

This shows:
- Current location data
- Order status
- Driver information
- Firebase connection status

## 📱 Full Screen Example

See the complete implementation in:
```
app/delivery-tracking/[id].tsx
```

Features:
- Interactive map with Google Maps
- Restaurant, driver, and destination markers
- Route polylines
- Driver contact buttons (call/message)
- Real-time status updates
- Delivery address and order summary

## 🔍 Verify Firebase Data

Check Firebase Console:

1. Go to Firebase Console → Realtime Database
2. Find `deliveryOrders/{your_order_id}`
3. Should see:
   ```json
   {
     "deliveryLocation": {
       "latitude": 9.0130,
       "longitude": 38.7640
     },
     "status": "PickedUp",
     "lastLocationUpdate": "2025-10-20T10:35:00Z"
   }
   ```

## 🐛 Troubleshooting

### Location Not Updating?
1. Check delivery guy app is running
2. Verify Firebase security rules allow reads
3. Check internet connection
4. Verify order ID is correct

### "Order Not Found"?
- Order hasn't been accepted yet
- Firebase node doesn't exist
- Check Firebase Console for data

### Map Not Showing?
- Verify Google Maps API key
- Check `react-native-maps` installed
- iOS: Run `pod install`
- Android: Add Maps API key to AndroidManifest.xml

## 📚 Next Steps

1. **Customize the UI** - Match your brand colors
2. **Add notifications** - Alert when status changes
3. **Implement geofencing** - Auto-detect arrival
4. **Add ETA calculation** - Show accurate delivery time
5. **Location history** - Show complete route

## 💡 Pro Tips

### Optimize Battery
- Updates are already optimized (3-10s intervals)
- Stops when delivery completed

### Reduce Data Usage
- Only essential location data sent
- Efficient Firebase WebSocket connection

### Improve Accuracy
- Request high-accuracy location in delivery guy app
- Use GPS + Network location

## 🎓 Learn More

- **Full Guide**: See `DELIVERY_TRACKING_GUIDE.md`
- **Hook Documentation**: See `hooks/useDeliveryTracking.ts`
- **Screen Implementation**: See `app/delivery-tracking/[id].tsx`

## 🆘 Need Help?

1. Check the full documentation
2. Review Firebase Console logs
3. Test with the demo component
4. Verify delivery guy app is sending data

---

**You're all set!** 🎉

Your real-time delivery tracking system is ready to use. Start tracking orders and watch the magic happen! ✨

