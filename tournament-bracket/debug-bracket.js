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
  await page.click('button.toggle-btn:has-text("Finals Center")');
  await page.waitForTimeout(2000);

  // Check SVG width
  const svgWidth = await page.evaluate(() => {
    const svg = document.querySelector('.bracket-svg');
    return svg ? svg.getAttribute('width') : 'not found';
  });
  
  console.log('SVG Width:', svgWidth);

  // Count round headers
  const roundHeaders = await page.evaluate(() => {
    const headers = document.querySelectorAll('.round-header');
    return Array.from(headers).map(h => h.textContent);
  });

  console.log('Round Headers:', roundHeaders);

  // Get foreignObject positions
  const foreignObjects = await page.evaluate(() => {
    const fos = document.querySelectorAll('.bracket-svg foreignObject');
    return Array.from(fos).map(fo => {
      const x = fo.getAttribute('x');
      const y = fo.getAttribute('y');
      const width = fo.getAttribute('width');
      const textContent = fo.textContent?.trim().slice(0, 50) || '';
      return { x: parseFloat(x), y: parseFloat(y), width: parseFloat(width), preview: textContent };
    });
  });

  console.log('\nForeignObject Positions:');
  foreignObjects.forEach(fo => {
    console.log(`x: ${fo.x}, width: ${fo.width}, right edge: ${fo.x + fo.width}, preview: ${fo.preview.substring(0, 30)}`);
  });

  await page.waitForTimeout(30000);
  await browser.close();
})();
