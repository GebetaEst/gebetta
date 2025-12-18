
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore, type User } from "@/store/useAuthStore";
import { useCartStore } from "@/store/cartStore";
import { useProfileStore } from "@/store/profileStore";

import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Edit2,
  LogOut,
  MapPin,
  Settings,
  ShoppingBag,
  UserMinus,
  UserPlus,
  Headset,
} from "lucide-react-native";

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Extend the User interface from useAuthStore
interface ExtendedUser extends Omit<User, 'id'> {
  _id: string;
  name?: string;
  avatar?: string;
  bio?: string;
  location?: string;


  reviews?: number;
}

export default function ProfileScreen() {
  const { user, isAuthenticated, isLoading: isAuthLoading, initializeAuth, debugAuthState } = useAuthStore();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Initialize auth state on mount (only if needed)
  useEffect(() => {
    const init = async () => {
      try {
        console.log('ProfileScreen: Checking auth state...');
        
        // Only initialize if user is not already set
        if (!user && !isAuthLoading) {
          console.log('ProfileScreen: Initializing auth...');
          await initializeAuth();
        }
        
        // Debug: Log the current auth state
        const debugData = await debugAuthState();
        setDebugInfo(debugData);
        console.log('ProfileScreen: Auth debug info:', debugData);
        
      } catch (error) {
        console.error('ProfileScreen: Error initializing auth:', error);
      } finally {
        setInitialized(true);
      }
    };
    
    init();
  }, []); // Remove dependencies to prevent re-initialization

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('ProfileScreen: Auth state changed', {
      initialized,
      isAuthLoading,
      isAuthenticated,
      hasUser: !!user
    });
  }, [initialized, isAuthLoading, isAuthenticated, user]);
  
  // Show loading state only while initially checking auth (not during profile updates)
  if (!initialized || (isAuthLoading && !user)) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading your profile...</Text>
        {debugInfo && (
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}>
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
              Debug: {JSON.stringify(debugInfo, null, 2)}
            </Text>
          </View>
        )}
      </View>
    );
  }
  
  // If not authenticated, show login prompt instead of redirecting
  if (!isAuthenticated || !user) {
    console.log('ProfileScreen: Not authenticated, showing login prompt');
    return <LoginPrompt />;
  }
  
  // Render the actual profile content
  return <ProfileContent />;
}

function LoginPrompt() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <View style={styles.loginPromptContainer}>
        <Ionicons name="person-outline" size={80} color={colors.lightText} />
        <Text style={styles.loginPromptTitle}>Sign in to view your profile</Text>
        <Text style={styles.loginPromptText}>
          Access your orders, addresses, payment methods, and account settings
        </Text>
        
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)')}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.browseButtonText}>Continue Browsing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { addresses, paymentMethods, fetchAddresses, isLoading: isAddressLoading } = useProfileStore();
  const { orders, getCartItemsCount } = useCartStore();

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<ExtendedUser | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch addresses when user data is available
  useEffect(() => {
    if (user && user.token) {
      console.log('📍 Profile: Fetching addresses for user:', user._id);
      fetchAddresses(user.token).catch(error => {
        console.error('📍 Profile: Error fetching addresses:', error);
      });
    }
  }, [user, fetchAddresses]);

  // Log when addresses are loaded
  useEffect(() => {
    console.log('📍 Profile: Addresses loaded:', {
      count: addresses.length,
      addresses: addresses.map(addr => ({ id: addr.id, name: addr.name, label: addr.label, isDefault: addr.isDefault }))
    });
  }, [addresses]);

  // Update profile user when user data changes
  useEffect(() => {
    if (user) {
      console.log('Profile: User data changed:', {
        firstName: user.firstName,
        profilePicture: user.profilePicture,
        hasProfilePicture: !!user.profilePicture
      });
      
      const extendedUser: ExtendedUser = {
        ...user,
        name: user.firstName + (user.lastName ? ` ${user.lastName}` : ''),
        avatar: user.profilePicture,
        bio: '',
        location: '',
        reviews: 0,
      };
      setProfileUser(extendedUser);
    }
  }, [user]);

  // Show loading state while profile is loading
  if (isLoadingProfile || !profileUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Ensure we have a valid user before proceeding
  if (!user || !profileUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }


  
  const defaultAddress = addresses.find(a => a.isDefault);
  const defaultPaymentMethod = paymentMethods.find(p => p.isDefault);
  const recentOrders = orders.slice(0, 3);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => {
            logout();
            router.replace("/(auth)");
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    if (!user) return;
    
    router.push({
      pathname: "/profile/edit",
      params: { userId: user._id },
    });
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleFollowUser = async () => {
    if (!profileUser) return;
    
    try {
      setIsLoadingProfile(true);
      
      // Toggle follow state
      setProfileUser(prev => ({
        ...prev!
      }));
      
      setIsFollowingUser(!isFollowingUser);
      
      // Here you would typically make an API call to update follow status
      // await api.followUser(profileUser._id);
      
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Revert on error
      setProfileUser(prev => ({
        ...prev!
      }));
      setIsFollowingUser(isFollowingUser);
    } finally {
      setIsLoadingProfile(false);
    }
  };



  const handleFollowToggle = () => {
    handleFollowUser();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={handleSettings}>
        <Headset size={28  } color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
          <LogOut size={28  } color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{ 
              uri: profileUser?.avatar || user?.profilePicture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.firstName || 'User') + '&background=random&color=fff&size=150'
            }}
            style={styles.profileImage}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            onError={() => {
              console.log('Profile image failed to load, using fallback');
            }}
          />
          <Text style={styles.profileName}>
            {user.phone}
          </Text>
          {profileUser?.location && (
            <Text style={styles.profileLocation}>
              <Ionicons name="location-outline" size={14} color={colors.text} /> {profileUser.location}
            </Text>
          )}



          <View style={styles.profileActions}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Edit2 size={16} color={colors.text} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
            
            {profileUser && profileUser._id !== user._id && (
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowingUser && styles.unfollowButton
                ]}
                onPress={handleFollowToggle}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={isFollowingUser ? colors.text : colors.white} />
                ) : (
                  <>
                    {isFollowingUser ? (
                      <UserMinus size={16} color={colors.text} />
                    ) : (
                      <UserPlus size={16} color={colors.white} />
                    )}
                    <Text style={[
                      styles.followButtonText,
                      isFollowingUser && styles.unfollowButtonText
                    ]}>
                      {isFollowingUser ? "Unfollow" : "Follow"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/orders")}
          >
            <View style={styles.menuItemLeft}>
              <ShoppingBag size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>My Orders</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/addresses")}
          >
            <View style={styles.menuItemLeft}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>My Addresses</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
          
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/chatbot")}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.chatbotIcon}>
                <Text style={styles.chatbotIconText}>🍲</Text>
              </View>
              <Text style={styles.menuItemText}>AI Cuisine Assistant</Text>
            </View>
            <ChevronRight size={20} color={colors.lightText} />
          </TouchableOpacity>
        </View>
        
        {recentOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push("/profile/orders")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {recentOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => router.push(`/order/${order.id}`)}
              >
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>Order #{order.id.slice(-4)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.orderStatus}>
                  <Text
                    style={[
                      styles.orderStatusText,
                      order.status === "delivered" && styles.deliveredStatus,
                      order.status === "cancelled" && styles.cancelledStatus,
                    ]}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/-/g, " ")}
                  </Text>
                  <ChevronRight size={16} color={colors.lightText} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}


      </ScrollView>
      
      {/* Floating Cart Button - Only visible when there are items in cart */}
      {getCartItemsCount() > 0 && (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => router.push("/cart")}
        >
          <ShoppingBag size={24} color={colors.white} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{getCartItemsCount()}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  loginPromptTitle: {
    ...typography.heading2,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  loginPromptText: {
    ...typography.body,
    color: colors.lightText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.white,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  browseButtonText: {
    ...typography.button,
    color: colors.text,
    textAlign: 'center',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  iconButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    ...typography.heading2,
    marginBottom: 4,
  },
  profileLocation: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginBottom: 12,
  },
  profileBio: {
    ...typography.body,
    textAlign: "center",
    marginBottom: 24,
  },
  profileActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  editProfileText: {
    ...typography.bodySmall,
    marginLeft: 8,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  unfollowButton: {
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  followButtonText: {
    ...typography.bodySmall,
    color: colors.white,
    marginLeft: 8,
  },
  unfollowButtonText: {
    color: colors.text,
  },
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    ...typography.body,
    marginLeft: 12,
    color: colors.text,
  },
  menuItemSubtext: {
    ...typography.caption,
    marginLeft: 12,
    color: colors.lightText,
    marginTop: 2,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  orderDate: {
    ...typography.caption,
    color: colors.lightText,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderStatusText: {
    ...typography.caption,
    color: colors.info,
    marginRight: 4,
  },
  deliveredStatus: {
    color: colors.success,
  },
  cancelledStatus: {
    color: colors.error,
  },

  chatbotIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatbotIconText: {
    fontSize: 18,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 10,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Address styles
  addressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressName: {
    ...typography.body,
    fontWeight: "600",
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  addressLabel: {
    ...typography.caption,
    color: colors.lightText,
    marginBottom: 2,
  },
  addressNote: {
    ...typography.caption,
    color: colors.lightText,
    fontStyle: "italic",
  },
  seeMoreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  seeMoreText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.lightText,
    marginLeft: 8,
  },
  emptyStateItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyStateText: {
    ...typography.bodySmall,
    color: colors.lightText,
    fontStyle: "italic",
  },
});
