// Usage: node cap.js test t1,t2,...   |   node cap.js run <fromFrame> <toFrame>
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const FPS = 30;
(async () => {
  const mode = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, process.env.REEL || 'reel.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  if (mode === 'test') {
    const ts = process.argv[3].split(',').map(Number);
    fs.mkdirSync('test', { recursive: true });
    for (const t of ts) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: `test/t_${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 85 });
    }
  } else {
    const from = +process.argv[3], to = +process.argv[4];
    fs.mkdirSync('frames', { recursive: true });
    for (let f = from; f < to; f++) {
      await page.evaluate(t => window.seek(t), f / FPS);
      await page.screenshot({ path: `frames/${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
    }
  }
  await browser.close();
})();
