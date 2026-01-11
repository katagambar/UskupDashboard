import { test, expect, Page } from '@playwright/test'

/**
 * Auth E2E Tests
 * 
 * Tests the login flow and authentication
 */

const TEST_EMAIL = 'uskup@keuskupan-sby.or.id'
const TEST_PASSWORD = 'UskupSBY2025!'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check login form elements are visible
    await expect(page.locator('h2:has-text("Dashboard Uskup")')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Fill login form
    await page.locator('#email').fill(TEST_EMAIL)
    await page.locator('#password').fill(TEST_PASSWORD)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/(dashboard)?$/, { timeout: 15000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Fill with wrong password
    await page.locator('#email').fill(TEST_EMAIL)
    await page.locator('#password').fill('wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.bg-red-50, .bg-red-900\\/30')).toBeVisible({ timeout: 5000 })
  })

  test('should redirect unauthenticated users to login', async ({ browser }) => {
    // Create a completely fresh context without any cookies
    const context = await browser.newContext()
    const page = await context.newPage()
    
    // Try to access protected page
    await page.goto('/agenda')
    
    // Should redirect to login
    await expect(page).toHaveURL(/auth\/signin/, { timeout: 10000 })
    
    await context.close()
  })
})
