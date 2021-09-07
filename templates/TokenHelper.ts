class TokenHelper {
  private token?: string;
  withToken() {
    return this.token;
  }
  resetToken() {
    this.token = undefined;
  }

  setToken(token: string) {
    this.token = token;
  }
}

export default new TokenHelper();
