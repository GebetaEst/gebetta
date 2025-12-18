import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  FlatList
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
 
export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const isTablet = width > 768;
 
  // State for card carousel
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList>(null);
 
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const logoAccentAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const floatAnim = React.useRef(new Animated.Value(0)).current;
 
  React.useEffect(() => {
    // Staggered animations for a more engaging entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
              Animated.timing(logoAccentAnim, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
 
    // Start subtle pulse animation for feature cards
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
 
    // Start floating animation for title
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
 
  const handleGetStarted = () => {
     router.push("/(auth)/login");
      // router.replace("/(tabs)");
  };
 
 
 
  const handleSkip = () => {
    router.push("/(auth)/login");
  };
 
  const handleNextCard = () => {
    if (currentCardIndex < features.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };
 
  const handleCardChange = (index: number) => {
    setCurrentCardIndex(index);
  };
 
  const features = [
    {
      icon: "restaurant-outline",
      title: "Authentic Ethiopian Cuisine",
      description: "Discover traditional flavors from the heart of Ethiopia"
    },
    {
      icon: "fast-food-outline",
      title: "Fresh & Local Ingredients",
      description: "Made with the finest locally sourced ingredients"
    },
    {
      icon: "heart-outline",
      title: "Made with Love",
      description: "Every dish prepared with care and tradition"
    }
  ];
 
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
     
      {/* Background Image with Enhanced Gradient */}
      <Image
        source={require("@/assets/images/background.jpg")}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.3)',
          'rgba(0, 0, 0, 0.5)',
          'rgba(0, 0, 0, 0.7)',
          'rgba(0, 0, 0, 0.8)'
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradientOverlay}
      />
     
      <SafeAreaView style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Animated.Text
                style={[
                  styles.title,
                  {
                    transform: [{ translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8]
                    })}]
                  }
                ]}
              >
                ባህራን
              </Animated.Text>
              <Animated.View
                style={[
                  styles.logoAccent,
                  {
                    opacity: logoAccentAnim,
                    transform: [{ scaleX: logoAccentAnim }]
                  }
                ]}
              />
            </View>
           
            <Text style={styles.subtitle}>
              Discover authentic Ethiopian flavors
                 
 
            </Text>
           
           
          </Animated.View>
 
          {/* Features Section */}
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.featuresHeader}>
              <Text style={styles.featuresTitle}>Why Choose ባህራን?</Text>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            </View>
           
            <View style={styles.carouselContainer}>
              <FlatList
                ref={flatListRef}
                data={features}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  handleCardChange(index);
                }}
                renderItem={({ item, index }) => (
                  <View style={styles.carouselCard}>
                    <Animated.View
                      style={[
                        styles.featureCard,
                        {
                          transform: [{ scale: pulseAnim }]
                        }
                      ]}
                    >
                      <View style={styles.featureIconContainer}>
                        <Ionicons name={item.icon as any} size={32} color={colors.white} />
                      </View>
                      <Text style={styles.featureTitle}>{item.title}</Text>
                      <Text style={styles.featureDescription}>{item.description}</Text>
                    </Animated.View>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
 
            {/* Card Indicators */}
            <View style={styles.cardIndicators}>
              {features.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentCardIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
 
            {/* Navigation Buttons */}
            <View style={styles.navigationButtons}>
              {currentCardIndex < features.length - 1 ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={handleNextCard}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </TouchableOpacity>
              ) : (
                <>
                <TouchableOpacity
                  style={styles.getStartedButton}
                  onPress={handleGetStarted}
                  activeOpacity={0.8}
                >
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
                </TouchableOpacity>
                </>
              )}
 
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    zIndex: -1,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    ...typography.heading1,
    color: colors.white,
    fontSize: 62,
    textAlign: "center",
    fontWeight: "900",
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  logoAccent: {
    width: 60,
    height: 4,
    backgroundColor: colors.white,
    borderRadius: 2,
    marginTop: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  description: {
    ...typography.body,
    color: colors.white,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
    maxWidth: 320,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
 
  featuresSection: {
    marginTop: 50,
    paddingHorizontal: 24,
  },
  featuresHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuresTitle: {
    ...typography.heading2,
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    flex: 1,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  carouselContainer: {
    height: 250,
    marginBottom: 4,
  },
  carouselCard: {
    width: Dimensions.get('window').width - 48, // Full width minus padding
    paddingHorizontal: 12,
    transform: [{ translateY: 10 }],    
   
  },
  cardIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
   
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: {
    backgroundColor: colors.white,
    width: 24,
  },
  navigationButtons: {
    alignItems: 'center',
    marginBottom: 6,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    gap: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedButtonText: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "600",
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 200,
    justifyContent: 'center',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    ...typography.subtitle,
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featureDescription: {
    ...typography.body,
    color: colors.white,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ctaSection: {
    marginTop: 15,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  ctaTitle: {
    ...typography.heading2,
    color: colors.white,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  ctaSubtitle: {
    ...typography.body,
    color: colors.white,
    textAlign: "center",
    fontSize: 16,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
 
 
 
 
 
});
 
 