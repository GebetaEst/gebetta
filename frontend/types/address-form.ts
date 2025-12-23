export type AddressFormData = {
  street: string;
  city: string;
  label: 'home' | 'work' | 'other';
  customLabel?: string;
  isDefault: boolean;
};

export interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  initialData?: AddressFormData;
}
