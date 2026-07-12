export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  universityId: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: 'STUDENT' | 'STAFF' | 'ADMIN';
      universityId: string;
    }
  }
}
