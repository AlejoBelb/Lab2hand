// client/src/services/auth.service.ts
// Servicio de autenticación contra el backend usando Axios. Envía cookies.

import { http } from '../lib/http';

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  status: 'ok';
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>('/api/auth/login', payload);
  return data;
}

// Exportar con el nombre que espera loginPage.jsx
export const loginService = login;
