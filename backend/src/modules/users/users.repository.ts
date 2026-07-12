import { PrismaClient, Prisma, User, Role } from '@prisma/client';

export class UsersRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllAdmins(): Promise<Partial<User>[]> {
    return this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        universityId: true,
        email: true,
        role: true,
        phoneNumber: true,
        nic: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Partial<User>[];
  }

  async findAdminById(id: string): Promise<Partial<User> | null> {
    return this.prisma.user.findUnique({
      where: { id, role: Role.ADMIN },
      select: {
        id: true,
        name: true,
        universityId: true,
        email: true,
        role: true,
        phoneNumber: true,
        nic: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Partial<User> | null;
  }

  async findUserByEmailOrUniversityId(email: string, universityId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { universityId }],
      },
    });
  }

  async createAdmin(data: Prisma.UserCreateInput): Promise<Partial<User>> {
    return this.prisma.user.create({
      data: { ...data, role: Role.ADMIN },
      select: {
        id: true,
        name: true,
        universityId: true,
        email: true,
        role: true,
        phoneNumber: true,
        nic: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Partial<User>;
  }

  async updateAdmin(id: string, data: Prisma.UserUpdateInput): Promise<Partial<User>> {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        universityId: true,
        email: true,
        role: true,
        phoneNumber: true,
        nic: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Partial<User>;
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
