const {chromium} = require('playwright');
const {spawn} = require('node:child_process');
const net = require('node:net');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const port = await new Promise(resolve => {
    const server = net.createServer().listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
  const server = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', path.resolve(__dirname, '..')], {stdio: 'ignore'});
  let browser;
  try {
    browser = await chromium.launch({headless: true, ...(process.platform === 'win32' ? {channel: 'chrome'} : {})});
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      const interval = window.setInterval;
      window.setInterval = (fn, delay, ...args) => {
        if (delay === 30000) { window.retryMaintenance = fn; return 0; }
        return interval(fn, delay, ...args);
      };
    });
    const response = await page.goto(`http://127.0.0.1:${port}/onderhoud.php`);
    assert.equal(response.status(), 200);
    assert(await page.getByRole('heading', {name: 'De website wordt verbeterd'}).isVisible());
    assert.equal(await page.locator('[data-copy="message"]').innerText(), 'Kom zo bij ons terug voor meer informatie.');
    await page.getByRole('img', {name: 'OptiCore Insights'}).evaluate(image => image.decode());
    await page.getByRole('button', {name: 'Start spel'}).click();
    await page.waitForTimeout(500);
    const before = Number((await page.locator('#gameStatus').innerText()).match(/\d+/)[0]);
    await page.keyboard.press('Space');
    await page.waitForTimeout(120);
    assert(Number((await page.locator('#gameStatus').innerText()).match(/\d+/)[0]) >= before);
    assert.equal(await page.locator('#dinoGame').evaluate(canvas => canvas.getContext('2d').getImageData(50,35,1,1).data.slice(0,3).join(',')), '35,107,88');
    for (const width of [320,393,1440]) {
      await page.setViewportSize({width, height: 900});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({path: path.join(os.tmpdir(), `opticore-website-maintenance-${width}.png`), fullPage: true});
    }
    await page.getByRole('button', {name: 'Vraag stellen'}).click();
    await page.getByLabel('Naam', {exact: true}).fill('Jan de Vries');
    await page.getByLabel('Je vraag', {exact: true}).fill('Wanneer zijn jullie terug?');
    let navigations = 0;
    page.on('framenavigated', () => navigations++);
    await page.evaluate(() => window.retryMaintenance());
    await page.waitForTimeout(100);
    assert.equal(navigations, 0);
    for (const width of [320,393,1440]) {
      await page.setViewportSize({width, height: 900});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    assert.deepEqual(errors, []);
    console.log('Website maintenance: mobile layout, game jump, support form and refresh verified.');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
