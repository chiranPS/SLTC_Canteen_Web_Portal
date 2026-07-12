export class AuthRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserByEmailOrUniversityId(email, universityId) {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { universityId }],
            },
        });
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async createUser(data) {
        return this.prisma.user.create({ data });
    }
    async updateUser(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    // Token Management
    async createToken(data) {
        return this.prisma.token.create({ data });
    }
    async findToken(token, type) {
        return this.prisma.token.findFirst({
            where: { token, type },
            include: { user: true },
        });
    }
    async deleteToken(token) {
        await this.prisma.token.deleteMany({
            where: { token },
        });
    }
    async deleteAllTokensForUser(userId, type) {
        await this.prisma.token.deleteMany({
            where: { userId, type },
        });
    }
}
