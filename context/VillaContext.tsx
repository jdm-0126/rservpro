import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { VILLAS, Villa } from '@/constants/villaData';

type VillaContextType = {
  villas: Villa[];
  addVilla: (villa: Omit<Villa, 'id'>) => Promise<void>;
  updateVilla: (villa: Villa) => Promise<void>;
  deleteVilla: (id: string) => Promise<void>;
};

const VillaContext = createContext<VillaContextType>({} as VillaContextType);
const STORAGE_KEY = 'villa_listings';

export function VillaProvider({ children }: { children: React.ReactNode }) {
  const [villas, setVillas] = useState<Villa[]>(VILLAS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setVillas(JSON.parse(data));
    });
  }, []);

  const persist = async (data: Villa[]) => {
    setVillas(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addVilla = async (villa: Omit<Villa, 'id'>) => {
    await persist([...villas, { ...villa, id: Date.now().toString() }]);
  };

  const updateVilla = async (villa: Villa) => {
    await persist(villas.map((v) => (v.id === villa.id ? villa : v)));
  };

  const deleteVilla = async (id: string) => {
    await persist(villas.filter((v) => v.id !== id));
  };

  return (
    <VillaContext.Provider value={{ villas, addVilla, updateVilla, deleteVilla }}>
      {children}
    </VillaContext.Provider>
  );
}

export const useVillas = () => useContext(VillaContext);
