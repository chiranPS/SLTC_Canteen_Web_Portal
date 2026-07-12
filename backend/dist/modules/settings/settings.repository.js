export class SettingsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSettings() {
        return this.prisma.systemSettings.findUnique({
            where: { id: 'singleton' },
        });
    }
    async updateSettings(isOrderingPaused, pauseMessage) {
        return this.prisma.systemSettings.upsert({
            where: { id: 'singleton' },
            update: {
                isOrderingPaused,
                pauseMessage,
            },
            create: {
                id: 'singleton',
                isOrderingPaused,
                pauseMessage,
            },
        });
    }
}
