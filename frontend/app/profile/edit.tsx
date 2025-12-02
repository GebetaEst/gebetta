import Button from "@/components/Button";
import Input from "@/components/Input";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/useAuthStore";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ChevronLeft , Pencil } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatar, setAvatar] = useState(user?.profilePicture || "");
  const [loading, setLoading] = useState(false);

  // Pick image from gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please enter both first and last name");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);

      // Add selected image if exists
      if (avatar && avatar.startsWith("file://")) {
        const filename = avatar.split("/").pop() || "profile.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
        const type =
          ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

        formData.append("profilePicture", {
          uri: avatar,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(
        "https://api.bahirandelivery.cloud/api/v1/users/updateMe",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      // console.log("✅ Update response:", data);
      setUser({...user, ...data.data.user});
      // console.log("%%%%%%%" , user?.profilePicture);
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }


      Alert.alert("✅ Success", "Profile updated successfully!");

      // Go back or redirect to profile tab
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/profile");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert("❌ Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/profile");
          }}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatar || "https://via.placeholder.com/120" }}
            style={styles.avatar}
            contentFit="cover"
          />
          <TouchableOpacity style={styles.fileInputButton} onPress={pickImage}>
            <Pencil size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
          />

          <Button
            title={loading ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            loading={loading}
            variant="primary"
            fullWidth
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.heading3,
  },
  scrollContent: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  fileInputButton: {
    width: 40,
    height: 40,
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
    transform: [{ translateX: 30 } , { translateY: -50 }],


  },
  fileInputText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  saveButton: {
    marginTop: 16,
  },
});
