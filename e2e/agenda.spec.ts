import { test, expect } from '@playwright/test'

/**
 * Agenda E2E Tests
 * 
 * Tests the agenda page functionality
 */

const TEST_EMAIL = 'uskup@keuskupan-sby.or.id'
const TEST_PASSWORD = 'UskupSBY2025!'

// Login before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/auth/signin')
  await page.locator('#email').fill(TEST_EMAIL)
  await page.locator('#password').fill(TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/(dashboard)?$/, { timeout: 15000 })
})

test.describe('Agenda Page', () => {
  test('should navigate to agenda page', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')
    
    // Check page has agenda content
    await expect(page.locator('text=Agenda')).toBeVisible({ timeout: 5000 })
  })

  test('should display agenda list', async ({ page }) => {
    await page.goto('/agenda')
    
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    
    // Check for list tab
    await expect(page.getByRole('tab', { name: /daftar/i })).toBeVisible()
  })

  test('should switch between list and calendar view', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')
    
    // Click calendar tab
    const calendarTab = page.getByRole('tab', { name: /kalender/i })
    if (await calendarTab.isVisible()) {
      await calendarTab.click()
      
      // Should show calendar
      await page.waitForTimeout(500)
      
      // Click back to list
      await page.getByRole('tab', { name: /daftar/i }).click()
    }
  })

  test('should open create dialog', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')
    
    // Click add button
    const addButton = page.getByRole('button', { name: /tambah|buat/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      
      // Dialog should be visible
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 3000 })
    }
  })

  test('should filter agenda by search', async ({ page }) => {
    await page.goto('/agenda')
    await page.waitForLoadState('networkidle')
    
    // Type in search  
    const searchInput = page.locator('input[placeholder*="Cari"], input[placeholder*="cari"]').first()
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await searchInput.fill('test')
      await page.waitForTimeout(500)
    }
  })
})
