import { ServiceRequest, Settings } from './types';

const STORAGE_KEYS = {
  ACTIVE_REQUESTS: 'restaurant_active_requests',
  COMPLETED_REQUESTS: 'restaurant_completed_requests',
  SETTINGS: 'restaurant_settings',
} as const;

const DEFAULT_SETTINGS: Settings = {
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  requestTypes: ['Service', 'Bill'],
  soundEnabled: true,
  notificationVolume: 0.5,
};

export const storage = {
  getActiveRequests: (): ServiceRequest[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  setActiveRequests: (requests: ServiceRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_REQUESTS, JSON.stringify(requests));
  },

  getCompletedRequests: (): ServiceRequest[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_REQUESTS);
    return data ? JSON.parse(data) : [];
  },

  setCompletedRequests: (requests: ServiceRequest[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COMPLETED_REQUESTS, JSON.stringify(requests));
  },

  addCompletedRequest: (request: ServiceRequest) => {
    const completed = storage.getCompletedRequests();
    completed.push(request);
    storage.setCompletedRequests(completed);
  },

  getSettings: (): Settings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },

  setSettings: (settings: Settings) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_REQUESTS);
  },
};