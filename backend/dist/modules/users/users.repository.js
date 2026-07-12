import { Role } from '@prisma/client';
export class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllAdmins() {
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
        });
    }
    async findAdminById(id) {
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
        });
    }
    async findUserByEmailOrUniversityId(email, universityId) {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { universityId }],
            },
        });
    }
    async createAdmin(data) {
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
        });
    }
    async updateAdmin(id, data) {
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
        });
    }
    async deleteAdmin(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
}
