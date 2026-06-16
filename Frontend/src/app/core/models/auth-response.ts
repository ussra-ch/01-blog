export interface AuthResponse {
  id : number;
  token: string;
  expiresIn: number;
  username: string;
  role: 'USER' | 'ADMIN';
}
