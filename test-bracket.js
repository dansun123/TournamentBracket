import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5174');

  // Wait for the page to load
  await page.waitForTimeout(1000);

  // Enter 8 participant names
  const names = [
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
    'Player 5',
    'Player 6',
    'Player 7',
    'Player 8'
  ];

  await page.fill('textarea.participant-input', names.join('\n'));

  // Click generate bracket
  await page.click('button.generate-btn');

  // Wait for bracket to render
  await page.waitForTimeout(1000);

  // Click Finals Center button
  await page.click('button.toggle-btn:has-text("Finals Center")');

  // Wait for view to update
  await page.waitForTimeout(500);

  // Take screenshot with wider viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: 'finals-center-view.png', fullPage: true });

  console.log('Screenshot saved as finals-center-view.png');

  await browser.close();
})();
