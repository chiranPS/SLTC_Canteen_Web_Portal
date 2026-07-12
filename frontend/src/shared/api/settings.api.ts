import { api } from '../../config/api';

export interface SystemSettings {
  id: string;
  isOrderingPaused: boolean;
  pauseMessage: string | null;
  updatedAt: string;
}

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const { data } = await api.get('/settings');
  return data.data;
};

export const updateSystemSettings = async (isOrderingPaused: boolean, pauseMessage?: string): Promise<SystemSettings> => {
  const { data } = await api.put('/settings', { isOrderingPaused, pauseMessage });
  return data.data;
};
