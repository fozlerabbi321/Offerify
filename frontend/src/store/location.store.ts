import { create } from 'zustand';
import storage from '../lib/storage';

interface LocationState {
    cityId: number | null;
    cityName: string;
    latitude: number | null;
    longitude: number | null;
    setLocation: (cityId: number, name: string, lat: number, long: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    cityId: 1, // Default to Dhaka (assuming ID 1)
    cityName: 'Dhaka',
    latitude: 23.8103,
    longitude: 90.4125,
    setLocation: (cityId, cityName, latitude, longitude) => {
        set({ cityId, cityName, latitude, longitude });
        // Persist if needed
    },
}));
