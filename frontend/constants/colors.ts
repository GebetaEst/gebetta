const colors = {
  // Primary colors
  primary: "#5D4037",      // Dark Brown
  secondary: "#8D6E63",   // Medium Brown
  accent: "#A1887F",      // Light Brown
  
  // Background colors
  background: "#FFFFFF",
  cardBackground: "#F5F0ED",  // Very light brown/beige
  inputBackground: "#F5F0ED", 
  
  // Text colors
  text: "#3E2723",        // Very dark brown for main text
  textSecondary: "#5D4037", // Slightly lighter dark brown
  lightText: "#8D6E63",    // Medium brown for less important text
  placeholderText: "#A1887F", // Light brown for placeholders
  
  // Status colors (using brown tones)
  success: "#689F38",     // Keeping green for success
  error: "#D32F2F",       // Keeping red for errors
  warning: "#FFA000",     // Amber for warnings
  danger: "#D32F2F",      // Red for danger
  info: "#0288D1",        // Blue for info
  
  // Common colors
  white: "#FFFFFF",
  black: "#000000",
  gray: "#BCAAA4",        // Light brown-gray
  lightGray: "#D7CCC8",   // Very light brown
  darkGray: "#4E342E",    // Dark brown as dark gray replacement
  
  // Border colors
  border: "#D7CCC8",      // Light brown border
  divider: "#BCAAA4",     // Slightly darker light brown for dividers
  
  // Role-specific colors
  owner: "#3E2723",       // Very dark brown for owner
  manager: "#5D4037",     // Dark brown for manager
};

export default colors;

// Dark mode color palette
export const darkColors = {
  // Primary colors
  primary: "#D7CCC8",     // Light brown text on dark
  secondary: "#BCAAA4",   // Slightly darker light brown
  accent: "#A1887F",      // Medium brown for accents

  // Background colors
  background: "#1B1B1B",  // Very dark background
  cardBackground: "#2D2424",  // Dark brown background for cards
  inputBackground: "#3E2723", // Dark brown for inputs

  // Text colors
  text: "#EFEBE9",       // Very light beige for text
  textSecondary: "#D7CCC8", // Light brown for secondary text
  placeholderText: "#8D6E63", // Medium brown for placeholders

  // Status colors
  success: "#81C784",    // Light green for success
  error: "#E57373",      // Light red for errors
  warning: "#FFD54F",    // Light amber for warnings
  info: "#64B5F6",       // Light blue for info

  // Common colors
  white: "#FFFFFF",
  black: "#000000",
  gray: "#5D4037",       // Dark brown as gray
  lightGray: "#8D6E63",  // Medium brown as light gray
  darkGray: "#3E2723",   // Very dark brown as dark gray
} as const;