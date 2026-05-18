import api, { authAPI } from './client';
import { TEST_USERS } from '../../constants';
import { User } from '../../types';

const AUTH_TOKEN_KEY = 'imel_token';
const REFRESH_TOKEN_KEY = 'imel_refresh_token';
const USER_KEY = 'imel_user';

const generateMockToken = () => `mock-token-${Date.now()}`;

export const login = async (processNumber: string, password: string) => {
  try {
    const { data } = await authAPI.login({ processNumber, password });
    // Check if user is active
    if (data.user.isActive === false) {
      throw new Error('Usuário desativado. Entre em contacto com o administrador ou secretaria para a ativação da sua conta');
    }
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken || '');
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  } catch (err: any) {
    const isNetworkError =
      !err.response ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'ERR_NETWORK' ||
      err.message?.includes('Network Error');

    if (isNetworkError) {
      const mockUser = TEST_USERS.find(
        (u) => u.processNumber === processNumber && u.password === password
      );
      if (mockUser) {
        if (mockUser.isActive === false) {
          throw new Error('Usuário desativado. Entre em contacto com o administrador ou secretaria para a ativação da sua conta');
        }

        const mockData = {
          token: generateMockToken(),
          refreshToken: '',
          user: mockUser,
        };

        localStorage.setItem(AUTH_TOKEN_KEY, mockData.token);
        localStorage.setItem(REFRESH_TOKEN_KEY, '');
        localStorage.setItem(USER_KEY, JSON.stringify(mockData.user));

        return mockData;
      }

      throw new Error('Credenciais inválidas');
    }

    const isInactiveError =
      err.response?.data?.error?.includes('desativado') ||
      err.response?.data?.error?.includes('inativa') ||
      err.message?.includes('desativado') ||
      err.message?.includes('inativa');
    if (isInactiveError) {
      throw err;
    }

    throw err;
  }
};

export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (err) {
    // Ignore errors on logout
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const refreshAuthToken = async (refreshToken: string) => {
  const { data } = await authAPI.refresh(refreshToken);
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  return data;
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!localStorage.getItem(AUTH_TOKEN_KEY);

export const register = (data: unknown) => authAPI.register(data);
export const forgotPassword = (data: unknown) => authAPI.forgotPassword(data);
export const resetPassword = (data: unknown) => authAPI.resetPassword(data);

export default {
  login,
  logout,
  refreshAuthToken,
  getCurrentUser,
  isAuthenticated,
  register,
  forgotPassword,
  resetPassword,
};
