export type AddressType = {
  id: string;
  name?: string;                    // From API: name field
  label: string;                    // From API: label field (not restricted to home/work/other)
  additionalInfo?: string;          // From API: additionalInfo field
  isDefault: boolean;               // From API: isDefault field
  coordinates?: {                   // From API: coordinates object
    lat: number;
    lng: number;
  };
  createdAt?: string;               // Optional, may not come from API
  updatedAt?: string;               // Optional, may not come from API
  
  // Legacy fields for backward compatibility (derived from API data)
  street?: string;                  // Can be derived from name or label
  city?: string;                    // Can be derived from additionalInfo
  customLabel?: string;             // Can be derived from label
  note?: string;                    // Can be derived from additionalInfo
};
