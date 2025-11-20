import { create } from 'zustand';
import { AddressType } from '@/types/address';
import { v4 as uuidv4 } from 'uuid';

interface UserStore {
  addresses: AddressType[];
  addAddress: (address: Omit<AddressType, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Omit<AddressType, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  addresses: [],
  
  addAddress: async (address) => {
    const newAddress: AddressType = {
      ...address,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      addresses: [...state.addresses, newAddress],
    }));
  },
  
  updateAddress: async (id, address) => {
    set((state) => ({
      addresses: state.addresses.map((addr) =>
        addr.id === id
          ? {
              ...addr,
              ...address,
              updatedAt: new Date().toISOString(),
            }
          : addr
      ),
    }));
  },
  
  deleteAddress: async (id) => {
    set((state) => ({
      addresses: state.addresses.filter((addr) => addr.id !== id),
    }));
  },
  
  setDefaultAddress: async (id) => {
    set((state) => ({
      addresses: state.addresses.map((addr) =>
        addr.id === id
          ? { ...addr, isDefault: true }
          : { ...addr, isDefault: false }
      ),
    }));
  },
}));
