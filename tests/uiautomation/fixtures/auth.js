// @ts-check
'use strict';

const base = require('@playwright/test');

exports.test = base.test.extend({
  freshPage: async ({ page }, use) => {
    await page.goto('/ui/login.html');
    await page.evaluate(() => sessionStorage.clear());
    await use(page);
  },
});

exports.expect = base.expect;
