import { Address, PaymentMethod } from "@/types/restaurant";
import { currentUser } from "./users";

export const addresses: Address[] = [
  {
    id: "1",
    userId: currentUser.id,
    type: "Home",
    addressLine1: "Bole Road, Sunshine Apartments",
    addressLine2: "Building B, Apt 502",
    city: "Addis Ababa",
    instructions: "Gate code: 1234. Call when you arrive.",
    isDefault: true,
    location: {
      latitude: 9.0222,
      longitude: 38.7468,
    },
    street: "Bole Road",
    apt: "502",
    name: ""
  },
  {
    id: "2",
    userId: currentUser.id,
    type: "Work",
    addressLine1: "Meskel Square, Unity Building",
    addressLine2: "4th Floor, Office 405",
    city: "Addis Ababa",
    instructions: "Ask for Makeda at reception.",
    isDefault: false,
    location: {
      latitude: 9.0105,
      longitude: 38.7612,
    },
    name: "",
    street: "",
    apt: ""
  },
  {
    id: "3",
    userId: currentUser.id,
    type: "Friend's House",
    addressLine1: "Kazanchis, Green View Residences",
    city: "Addis Ababa",
    isDefault: false,
    location: {
      latitude: 9.0127,
      longitude: 38.7639,
    },
    name: "",
    addressLine2: "",
    street: "",
    apt: "",
    instructions: ""
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "1",
    userId: currentUser.id,
    type: "card",
    cardBrand: "visa",
    last4: "4242",
    lastFourDigits: "4242",
    expiryMonth: "12",
    expiryYear: "2025",
    isDefault: true,
    provider: ""
  },
  {
    id: "2",
    userId: currentUser.id,
    type: "mobile-money",
    provider: "telebirr",
    phoneNumber: "+251911234567",
    number: "+251911234567",
    isDefault: false,
    cardBrand: "",
    last4: "",
    lastFourDigits: "",
    expiryMonth: "",
    expiryYear: ""
  },
  {
    id: "3",
    userId: currentUser.id,
    type: "card",
    cardBrand: "mastercard",
    last4: "8765",
    lastFourDigits: "8765",
    expiryMonth: "09",
    expiryYear: "2024",
    isDefault: false,
    provider: ""
  },
];
