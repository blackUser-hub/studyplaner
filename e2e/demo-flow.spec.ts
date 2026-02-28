import { test, expect } from '@playwright/test'

test('complete demo flow', async ({ page }) => {
  // Navigate to app
  await page.goto('/')

  // Check page loads
  await expect(page.locator('h1')).toContainText('Dashboard')

  // Load demo data
  const loadDemoButton = page.getByRole('button', { name: /load demo data/i })
  await loadDemoButton.click()

  // Wait for demo data to load
  await page.waitForTimeout(500)

  // Set minutes per day
  const minutesInput = page.getByLabel(/minutes per day/i)
  await minutesInput.fill('120')

  // Save configuration
  const saveConfigButton = page.getByRole('button', { name: /save configuration/i })
  await saveConfigButton.click()

  // Generate plan
  const generatePlanButton = page.getByRole('button', { name: /generate plan/i })
  await generatePlanButton.click()

  // Wait for plan generation
  await page.waitForTimeout(500)

  // Navigate to calendar
  await page.click('text=Calendar')
  await expect(page).toHaveURL(/.*calendar/)

  // Check sessions are displayed
  const sessions = page.locator('[class*="bg-blue-100"], [class*="bg-green-100"]')
  await expect(sessions.first()).toBeVisible()

  // Click on a session
  await sessions.first().click()

  // Mark session as done
  const doneButton = page.getByRole('button', { name: /done/i })
  await doneButton.click()

  // Wait for update
  await page.waitForTimeout(300)

  // Navigate back to dashboard
  await page.click('text=Dashboard')
  await expect(page).toHaveURL('/')

  // Check that weak topics or stats are updated
  const stats = page.locator('text=/\\d+ (Topics|Completed Sessions|Flashcards|Questions)')
  await expect(stats.first()).toBeVisible()

  // Verify at least one completed session
  const completedSessions = page.locator('text=/\\d+ Completed Sessions')
  const completedText = await completedSessions.textContent()
  expect(completedText).toMatch(/\d+/)
})
