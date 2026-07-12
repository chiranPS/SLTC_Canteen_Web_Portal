import { PrismaClient, Prisma, TokenType, User, Token } from '@prisma/client';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findUserByEmailOrUniversityId(email: string, universityId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { universityId }],
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async updateUser(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  // Token Management
  async createToken(data: Prisma.TokenUncheckedCreateInput): Promise<Token> {
    return this.prisma.token.create({ data });
  }

  async findToken(token: string, type: TokenType): Promise<(Token & { user: User }) | null> {
    return this.prisma.token.findFirst({
      where: { token, type },
      include: { user: true },
    });
  }

  async deleteToken(token: string): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { token },
    });
  }

  async deleteAllTokensForUser(userId: string, type: TokenType): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { userId, type },
    });
  }
}
