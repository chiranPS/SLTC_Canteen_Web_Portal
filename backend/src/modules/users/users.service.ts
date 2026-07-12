import bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import { CreateAdminDto, UpdateAdminDto } from './users.validation.js';

export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

  async getAllAdmins() {
    return this.usersRepo.findAllAdmins();
  }

  async getAdminById(id: string) {
    const admin = await this.usersRepo.findAdminById(id);
    if (!admin) {
      throw new AppError('Admin not found', 404, 'NOT_FOUND');
    }
    return admin;
  }

  async createAdmin(data: CreateAdminDto) {
    const existingUser = await this.usersRepo.findUserByEmailOrUniversityId(data.email, data.universityId);
    if (existingUser) {
      throw new AppError('User with this email or university ID already exists', 400, 'USER_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const admin = await this.usersRepo.createAdmin({
      name: data.name,
      email: data.email,
      universityId: data.universityId,
      passwordHash,
      phoneNumber: data.phoneNumber,
      nic: data.nic,
      isEmailVerified: true, // Auto verify admins created by other admins
    });

    return admin;
  }

  async updateAdmin(id: string, data: UpdateAdminDto) {
    const admin = await this.usersRepo.findAdminById(id);
    if (!admin) {
      throw new AppError('Admin not found', 404, 'NOT_FOUND');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.universityId !== undefined) updateData.universityId = data.universityId;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.nic !== undefined) updateData.nic = data.nic;

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(data.password, salt);
    }

    return this.usersRepo.updateAdmin(id, updateData);
  }

  async deleteAdmin(id: string, requesterId: string) {
    if (id === requesterId) {
      throw new AppError('Cannot delete yourself', 400, 'BAD_REQUEST');
    }

    const admin = await this.usersRepo.findAdminById(id);
    if (!admin) {
      throw new AppError('Admin not found', 404, 'NOT_FOUND');
    }

    await this.usersRepo.deleteAdmin(id);
  }
}
