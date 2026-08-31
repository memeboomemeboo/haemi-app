const LOGIN_ID_KEY = 'haemi_login_id';
const ELDER_LOGIN_ID_KEY = 'haemi_elder_login_id';

export const pinStorage = {
  hasLoginId: async (): Promise<boolean> => Boolean(localStorage.getItem(LOGIN_ID_KEY)),
  saveLoginId: async (loginId: string): Promise<void> => {
    localStorage.setItem(LOGIN_ID_KEY, loginId);
  },
  getLoginId: async (): Promise<string | null> => localStorage.getItem(LOGIN_ID_KEY),
  hasElderLoginId: async (): Promise<boolean> => Boolean(localStorage.getItem(ELDER_LOGIN_ID_KEY)),
  saveElderLoginId: async (loginId: string): Promise<void> => {
    localStorage.setItem(ELDER_LOGIN_ID_KEY, loginId);
  },
  getElderLoginId: async (): Promise<string | null> => localStorage.getItem(ELDER_LOGIN_ID_KEY),
  clearElderLoginId: async (): Promise<void> => {
    localStorage.removeItem(ELDER_LOGIN_ID_KEY);
  },
};
