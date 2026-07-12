export class SettingsService {
    settingsRepo;
    constructor(settingsRepo) {
        this.settingsRepo = settingsRepo;
    }
    async getSettings() {
        let settings = await this.settingsRepo.getSettings();
        if (!settings) {
            settings = await this.settingsRepo.updateSettings(false);
        }
        return settings;
    }
    async updateSettings(isOrderingPaused, pauseMessage) {
        return this.settingsRepo.updateSettings(isOrderingPaused, pauseMessage);
    }
}
