const colors = {
  // Primary colors
  primary: "#000000",
  secondary: "#333333",
  accent: "#666666",
  
  // Background colors
  background: "#FFFFFF",
  cardBackground: "#F5F5F5",
  inputBackground: "#F0F0F0",
  
  // Text colors
  text: "#000000",
  textSecondary: "#666666",
  lightText: "#666666",
  placeholderText: "#757575", // Darker gray for better visibility
  
  // Status colors (using grayscale)
  success: "#888888",
  error: "#555555",
  warning: "#777777",
  danger: "#555555",
  info: "#999999",
  
  // Common colors
  white: "#FFFFFF",
  black: "#000000",
  gray: "#CCCCCC",
  lightGray: "#EEEEEE",
  darkGray: "#333333",
  orangeyellow: "#FFB347", // A warm orange-yellow color
  orangeyellowBold: "#FFA000", // A bolder, more saturated orange-yellow
  
  // Border colors
  border: "#E0E0E0",
  divider: "#E0E0E0",
  
  // Role-specific colors
  owner: "#000000",
  manager: "#333333",
};

export default colors;

// Dark mode color palette
export const darkColors = {
  // Primary colors
  primary: "#FFFFFF",
  secondary: "#D1D5DB",
  accent: "#93C5FD",

  // Background colors
  background: "#0F172A", // dark background
  cardBackground: "#111827",
  inputBackground: "#1F2937",

  // Text colors
  text: "#E5E7EB",
  textSecondary: "#9CA3AF",
  placeholderText: "#6B7280",

  // Status colors
  success: "#34D399",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#93C5F9",

    // Common colors
  white: "#FFFFFF",
  black: "#000000",
  gray: "#4B5563",
  lightGray: "#6B7280",
  darkGray: "#111827",
} as const;