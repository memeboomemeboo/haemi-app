const LOGIN_ID_KEY = 'haemi_login_id';

export const pinStorage = {
  hasLoginId: async (): Promise<boolean> => Boolean(localStorage.getItem(LOGIN_ID_KEY)),
  saveLoginId: async (loginId: string): Promise<void> => {
    localStorage.setItem(LOGIN_ID_KEY, loginId);
  },
  getLoginId: async (): Promise<string | null> => localStorage.getItem(LOGIN_ID_KEY),
};
