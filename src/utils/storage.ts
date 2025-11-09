export const storage = {
  setAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  },
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },
  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
  setUserId(userId: number) {
    localStorage.setItem('userId', userId.toString());
  },
  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  },
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

