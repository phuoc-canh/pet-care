import AsyncStorage from '@react-native-async-storage/async-storage';

/** Wrapper JSON cho AsyncStorage: mock "database" của các service. */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  pets: 'petpal:pets:v1',
  appointments: 'petpal:appointments:v1',
  appStore: 'petpal:app-store:v1',
  chatStore: 'petpal:chat-store:v1',
} as const;
