import { SettingsRepository } from './settings.repository.js';

export class SettingsService {
  constructor(private settingsRepo: SettingsRepository) {}

  async getSettings() {
    let settings = await this.settingsRepo.getSettings();
    if (!settings) {
      settings = await this.settingsRepo.updateSettings(false);
    }
    return settings;
  }

  async updateSettings(isOrderingPaused: boolean, pauseMessage?: string) {
    return this.settingsRepo.updateSettings(isOrderingPaused, pauseMessage);
  }
}
