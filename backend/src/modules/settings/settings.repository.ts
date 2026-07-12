import { PrismaClient } from '@prisma/client';

export class SettingsRepository {
  constructor(private prisma: PrismaClient) {}

  async getSettings() {
    return this.prisma.systemSettings.findUnique({
      where: { id: 'singleton' },
    });
  }

  async updateSettings(isOrderingPaused: boolean, pauseMessage?: string) {
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
