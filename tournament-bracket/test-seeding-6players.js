import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(1000);

  const names = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'];

  console.log('\n=== TESTING AUTO-ADVANCE WITH BYES (6 players) ===');
  await page.fill('textarea.participant-input', names.join('\n'));
  await page.click('button.generate-btn');
  await page.waitForTimeout(1500);

  // Get Round 1 matchups
  let round1Matchups = await page.evaluate(() => {
    const matches = document.querySelectorAll('.match-container');
    return Array.from(matches).slice(0, 4).map(match => {
      const names = Array.from(match.querySelectorAll('.name')).map(n => n.textContent);
      const winners = Array.from(match.querySelectorAll('.winner .name')).map(n => n.textContent);
      return {
        matchup: names.join(' vs '),
        winners: winners
      };
    });
  });

  console.log('\nRound 1:');
  round1Matchups.forEach((data, i) => {
    console.log(`Match ${i + 1}: ${data.matchup}${data.winners.length > 0 ? ' (Winner: ' + data.winners[0] + ')' : ''}`);
  });

  // Get Round 2 participants
  let round2Matchups = await page.evaluate(() => {
    const matches = document.querySelectorAll('.match-container');
    return Array.from(matches).slice(4, 6).map(match => {
      const names = Array.from(match.querySelectorAll('.name')).map(n => n.textContent);
      return names.join(' vs ');
    });
  });

  console.log('\nRound 2 (Semifinals):');
  round2Matchups.forEach((matchup, i) => {
    console.log(`Match ${i + 1}: ${matchup}`);
  });

  await page.waitForTimeout(10000);
  await browser.close();
})();
