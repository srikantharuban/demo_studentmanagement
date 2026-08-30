// @ts-check
'use strict';
const { test } = require('@playwright/test');

test('seed', async ({ page }) => {
  await page.goto('/ui/login.html');
});
