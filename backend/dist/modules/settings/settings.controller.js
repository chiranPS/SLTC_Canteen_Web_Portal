import { successResponse } from '../../shared/responses/apiResponse.js';
import { z } from 'zod';
const updateSettingsSchema = z.object({
    isOrderingPaused: z.boolean(),
    pauseMessage: z.string().optional().nullable(),
});
export class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getSettings = async (req, res) => {
        const settings = await this.settingsService.getSettings();
        res.status(200).json(successResponse('Settings fetched successfully', settings));
    };
    updateSettings = async (req, res) => {
        const data = updateSettingsSchema.parse(req.body);
        const settings = await this.settingsService.updateSettings(data.isOrderingPaused, data.pauseMessage || undefined);
        res.status(200).json(successResponse('Settings updated successfully', settings));
    };
}
