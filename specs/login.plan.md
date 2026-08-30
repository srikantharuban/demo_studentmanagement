# Student Management System — Login Feature Test Plan

## Application Overview

The Student Management System (SMS) login page is served at /ui/login.html. It is a client-side-only authentication flow: credentials are validated in JavaScript against a hardcoded USERS map, and session state is persisted in sessionStorage. The page contains a single login card (form#login-form) and a read-only access-level reference panel. Authentication sets four sessionStorage keys (sms_auth, sms_user, sms_role, sms_label) then redirects to /ui/. On failure the error banner #login-error is un-hidden and the password field is cleared. All tests start from a clean browser session (sessionStorage empty, no pre-existing auth).

## Test Scenarios

### 1. Login — Authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC_LOGIN_P01 — Successful authentication for admin user

**File:** `tests/login/TC_LOGIN_P01.spec.js`

**Steps:**
  1. Clear sessionStorage to ensure a blank auth state: sessionStorage.clear()
    - expect: sessionStorage contains no sms_auth key
  2. Navigate to http://localhost:8000/ui/login.html
    - expect: Page loads successfully
    - expect: Page title is 'Sign In — Student Management System'
    - expect: The login card is visible with a 'SMS' logo, heading 'Student Management System', and sub-heading 'Sign in to your account'
    - expect: The error banner #login-error has class 'hidden' and is not visible
  3. Locate the Username input using selector #username (type='text', placeholder='Enter username', label text 'USERNAME') and type the value: admin
    - expect: The username field displays 'admin'
  4. Locate the Password input using selector #password (type='password', placeholder='Enter password', label text 'PASSWORD') and type the value: admin123
    - expect: The password field shows masked characters
  5. Click the submit button located via selector button[type='submit'].login-btn whose visible text is 'Sign In'
    - expect: The handleLogin function executes without error
    - expect: No error banner is shown
  6. Wait for navigation to complete and assert the current URL ends with /ui/ or /ui/index.html
    - expect: Browser is redirected to /ui/ (the dashboard)
    - expect: Login page is no longer visible
  7. Read sessionStorage key 'sms_auth' using page.evaluate(() => sessionStorage.getItem('sms_auth'))
    - expect: sms_auth equals the string 'true'
  8. Read sessionStorage key 'sms_role' using page.evaluate(() => sessionStorage.getItem('sms_role'))
    - expect: sms_role equals the string 'admin'
  9. Read sessionStorage key 'sms_user' using page.evaluate(() => sessionStorage.getItem('sms_user'))
    - expect: sms_user equals the string 'admin'
  10. Read sessionStorage key 'sms_label' using page.evaluate(() => sessionStorage.getItem('sms_label'))
    - expect: sms_label equals the string 'Administrator'

#### 1.2. TC_LOGIN_N01 — Invalid username and password shows error message

**File:** `tests/login/TC_LOGIN_N01.spec.js`

**Steps:**
  1. Clear sessionStorage to ensure a blank auth state: sessionStorage.clear()
    - expect: sessionStorage contains no sms_auth key
  2. Navigate to http://localhost:8000/ui/login.html
    - expect: Page loads successfully
    - expect: Page title is 'Sign In — Student Management System'
    - expect: The error banner #login-error has class 'hidden' and is not visible
  3. Locate the Username input using selector #username and type the value: wronguser
    - expect: The username field displays 'wronguser'
  4. Locate the Password input using selector #password and type the value: wrongpass
    - expect: The password field shows masked characters
  5. Click the submit button located via selector button[type='submit'].login-btn whose visible text is 'Sign In'
    - expect: The form submission is handled client-side (event.preventDefault() fires)
    - expect: No network authentication request is made (login is purely client-side)
  6. Assert that the error banner element #login-error is now visible (class 'hidden' has been removed) and read its text content
    - expect: The element #login-error is displayed (not hidden)
    - expect: The visible text of #login-error contains 'Invalid username or password'
    - expect: The full trimmed text of #login-error is '⚠ Invalid username or password. Please try again.'
  7. Assert the current page URL still contains /ui/login.html
    - expect: The browser has NOT navigated away — URL still ends with /ui/login.html
  8. Read the value of the password input using page.evaluate(() => document.getElementById('password').value)
    - expect: The password field value is an empty string '' (the field was cleared by the error handler)
    - expect: The password input has focus (browser focus moved to the password field)
  9. Assert that sessionStorage key 'sms_auth' was not set
    - expect: sessionStorage.getItem('sms_auth') returns null — no session was created

#### 1.3. TC_LOGIN_N02_FAIL — Intentionally broken test for healer practice (wrong page title assertion)

**File:** `tests/login/TC_LOGIN_N02_FAIL.spec.js`

**Steps:**
  1. Clear sessionStorage to ensure a blank auth state: sessionStorage.clear()
    - expect: sessionStorage contains no sms_auth key
  2. Navigate to http://localhost:8000/ui/login.html
    - expect: Page loads successfully
    - expect: The actual page title in the DOM is 'Sign In — Student Management System'
  3. Locate the Username input using selector #username and type the value: admin
    - expect: The username field displays 'admin'
  4. Locate the Password input using selector #password and type the value: admin123
    - expect: The password field shows masked characters
  5. Click the submit button located via selector button[type='submit'].login-btn whose visible text is 'Sign In'
    - expect: Login succeeds and the browser is redirected to /ui/
  6. Assert that the page title equals the string 'WRONG TITLE THAT DOES NOT EXIST'
    - expect: THIS ASSERTION INTENTIONALLY FAILS — the actual page title after redirect is 'Student Management System' (the dashboard), NOT 'WRONG TITLE THAT DOES NOT EXIST'
    - expect: A test healer should fix this assertion to match the real dashboard page title (e.g. 'Student Management System')
