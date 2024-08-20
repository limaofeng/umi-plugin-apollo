class TokenHelper {
  withToken() {
    return localStorage.getItem('credentials');
  }
  resetToken() {
    localStorage.removeItem('credentials');
  }

  setToken(token: string) {
    localStorage.setItem('credentials', token);
  }
}

export default new TokenHelper();
