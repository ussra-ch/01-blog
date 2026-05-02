export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  role: 'USER' | 'ADMIN';
}
