import { CountryCode } from "@/types/auth";

const countryCodes: CountryCode[] = [
  { 
    name: "United States", 
    code: "+1", 
    flag: "🇺🇸",
    format: "(XXX) XXX-XXXX",
    minLength: 10,
    maxLength: 10
  },
  { 
    name: "United Kingdom", 
    code: "+44", 
    flag: "🇬🇧",
    format: "XXXX XXXXXX",
    minLength: 10,
    maxLength: 10
  },
  { 
    name: "India", 
    code: "+91", 
    flag: "🇮🇳",
    format: "XXXXX XXXXX",
    minLength: 10,
    maxLength: 10
  },
  { 
    name: "Ethiopia", 
    code: "+251", 
    flag: "🇪🇹",
    format: "XX XXX XXXX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Kenya", 
    code: "+254", 
    flag: "🇰🇪",
    format: "XXX XXX XXX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Nigeria", 
    code: "+234", 
    flag: "🇳🇬",
    format: "XXX XXX XXXX",
    minLength: 10,
    maxLength: 10
  },
  { 
    name: "South Africa", 
    code: "+27", 
    flag: "🇿🇦",
    format: "XX XXX XXXX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Egypt", 
    code: "+20", 
    flag: "🇪🇬",
    format: "XXX XXX XXXX",
    minLength: 10,
    maxLength: 10
  },
  { 
    name: "France", 
    code: "+33", 
    flag: "🇫🇷",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Germany", 
    code: "+49", 
    flag: "🇩🇪",
    format: "XXXX XXXXXXX",
    minLength: 11,
    maxLength: 11
  },
  { 
    name: "Spain", 
    code: "+34", 
    flag: "🇪🇸",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Italy", 
    code: "+39", 
    flag: "🇮🇹",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Portugal", 
    code: "+351", 
    flag: "🇵🇹",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Switzerland", 
    code: "+41", 
    flag: "🇨🇭",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Austria", 
    code: "+43", 
    flag: "🇦🇹",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Austria", 
    code: "+43", 
    flag: "🇦🇹",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
  { 
    name: "Austria", 
    code: "+43", 
    flag: "🇦🇹",
    format: "X XX XX XX XX",
    minLength: 9,
    maxLength: 9
  },
];

export const formatPhoneNumber = (text: string, countryCode: string): string => {
  // Remove all non-digit characters
  const digitsOnly = text.replace(/\D/g, "");
  
  // Format based on country code
  switch (countryCode) {
    case "+1": // US
      if (digitsOnly.length <= 3) {
        return digitsOnly;
      } else if (digitsOnly.length <= 6) {
        return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
      } else {
        return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
      }
    case "+44": // UK
      if (digitsOnly.length <= 4) {
        return digitsOnly;
      } else {
        return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 10)}`;
      }
    case "+91": // India
      if (digitsOnly.length <= 5) {
        return digitsOnly;
      } else {
        return `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5, 10)}`;
      }
    default:
      // Generic formatting with spaces every 3 digits
      return digitsOnly.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }
};

export default countryCodes;
