import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(1000);

  const names = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8'];
  await page.fill('textarea.participant-input', names.join('\n'));
  await page.click('button.generate-btn');
  await page.waitForTimeout(1000);

  // Get all match participants
  const matchups = await page.evaluate(() => {
    const matches = document.querySelectorAll('.match-container');
    return Array.from(matches).slice(0, 4).map(match => {
      const names = Array.from(match.querySelectorAll('.name')).map(n => n.textContent);
      return names.join(' vs ');
    });
  });

  console.log('Traditional Seeding Matchups (Round 1):');
  matchups.forEach((matchup, i) => {
    console.log(`Match ${i + 1}: ${matchup}`);
  });

  await page.waitForTimeout(5000);
  await browser.close();
})();
