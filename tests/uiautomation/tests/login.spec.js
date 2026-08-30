// @ts-check
// spec: specs/plan.md — Login feature
// seed: tests/seed.spec.js
'use strict';

const { test, expect } = require('../fixtures/auth');
const { LoginPage }    = require('../pages/LoginPage');
const testData         = require('../test-data/login.json');

test.describe('Login', () => {

  test('TC_LOGIN_P01 — Successful authentication for admin user', async ({ freshPage }) => {
    const loginPage = new LoginPage(freshPage);

    // Fill admin credentials and submit the login form
    await loginPage.login(testData.admin.username, testData.admin.password);

    // Verify redirect to the dashboard URL
    await freshPage.waitForURL('**/ui/');
    await expect(freshPage).toHaveURL(/\/ui\//);

    // Verify sessionStorage records the authenticated session and role
    const auth = await freshPage.evaluate(() => sessionStorage.getItem('sms_auth'));
    expect(auth).toBe('true');

    const role = await freshPage.evaluate(() => sessionStorage.getItem('sms_role'));
    expect(role).toBe('admin');
  });

  test('TC_LOGIN_N01 — Invalid username/password', async ({ freshPage }) => {
    const loginPage = new LoginPage(freshPage);

    // Fill invalid credentials and submit the login form
    await loginPage.login(testData.invalid.username, testData.invalid.password);

    // Verify the error banner is visible with the exact error message
    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toHaveText(testData.expectedErrorText);

    // Verify the URL has not changed — user remains on the login page
    await expect(freshPage).toHaveURL(/login\.html/);

    // Verify password field is cleared after a failed attempt
    const passwordValue = await freshPage.evaluate(() => document.getElementById('password').value);
    expect(passwordValue).toBe('');

    // Verify sessionStorage was not populated
    const auth = await freshPage.evaluate(() => sessionStorage.getItem('sms_auth'));
    expect(auth).toBeNull();
  });

  test('TC_LOGIN_N02 — Dashboard title is correct after admin login', async ({ freshPage }) => {
    const loginPage = new LoginPage(freshPage);

    // Login with valid admin credentials
    await loginPage.login(testData.admin.username, testData.admin.password);

    // Wait for redirect to dashboard
    await freshPage.waitForURL('**/ui/');

    // Verify the dashboard page title matches the real application title
    await expect(freshPage).toHaveTitle(testData.wrongTitle);
  });

});
