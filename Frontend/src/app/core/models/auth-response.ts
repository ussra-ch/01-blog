export interface AuthResponse {
  id : number;
  token: string;
  type: string;
  username: string;
  role: 'USER' | 'ADMIN';
}
