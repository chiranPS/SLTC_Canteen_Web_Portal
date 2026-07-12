export interface AdminUser {
  id: string;
  name: string;
  universityId: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
  nic?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminDto {
  name: string;
  universityId: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  nic?: string;
}

export interface UpdateAdminDto {
  name?: string;
  universityId?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  nic?: string;
}
