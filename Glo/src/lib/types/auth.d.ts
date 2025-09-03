type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  refreshToken: string;
  fullName?: string;
};

export type UserSession = Omit<User, 'password' | 'refreshToken'>;
