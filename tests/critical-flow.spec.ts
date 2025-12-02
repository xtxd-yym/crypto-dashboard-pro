import { test, expect } from '@playwright/test';

test.describe('Critical User Journey', () => {

  test('User can login, navigate to portfolio, and see critical actions', async ({ page }) => {
    // 1. Attempt to visit the protected Dashboard
    // Our router should redirect this to /login
    await page.goto('/');

    // 2. Verify we are on the Login Page
    // We check for the specific H1 text from your component
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    // 3. Fill Credentials
    // Best Practice: Use getByLabel to ensure your inputs are accessible
    await page.getByLabel('Email Address').fill('demo@user.com');
    await page.getByLabel('Password').fill('password');

    // 4. Click Sign In
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 5. Verify Successful Login
    // Should be redirected back to '/' (Dashboard)
    await expect(page).toHaveURL('/');
    
    // Verify the Sidebar is visible by checking for a unique dashboard element
    // (e.g., the 'Dashboard' link in the sidebar)
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

    // 6. Navigate to Portfolio
    // Click the sidebar link
    await page.getByRole('link', { name: 'Portfolio' }).click();

    // 7. Verify Portfolio Page
    await expect(page).toHaveURL('/portfolio');
    
    // Check for the "Add Asset" button seen in your screenshot
    // We use a regex /add asset/i to match "+ Add Asset" case-insensitively
    await expect(page.getByRole('button', { name: /add asset/i })).toBeVisible();
  });

});