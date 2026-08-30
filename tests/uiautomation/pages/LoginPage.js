// @ts-check
'use strict';

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    // Locators — priority order: getByLabel > getByRole > getByPlaceholder > locator(id)
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton  = page.getByRole('button', { name: 'Sign In' });
    // Error banner has no semantic role — use stable id selector
    this.errorBanner   = page.locator('#login-error');
  }

  /**
   * Fills credentials and submits the login form.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /**
   * Returns the trimmed text content of the error banner.
   * @returns {Promise<string | null>}
   */
  async getErrorMessage() {
    return await this.errorBanner.textContent();
  }

  /**
   * Returns true when the error banner is currently visible.
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    return await this.errorBanner.isVisible();
  }
}

module.exports = { LoginPage };
