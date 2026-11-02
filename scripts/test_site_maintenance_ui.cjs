const {chromium} = require('playwright');
const {spawn} = require('node:child_process');
const net = require('node:net');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

(async () => {
  const port = await new Promise(resolve => {
    const server = net.createServer().listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'opticore-support-test-'));
  const capture = path.join(fixture, 'mail.json');
  const router = path.join(fixture, 'router.php');
  fs.writeFileSync(router, `<?php
namespace OptiCore\\MaintenanceSupport;
function mail($to, $subject, $body, $headers, $parameters) {
  if (str_contains($body, '[fail-mail]')) return false;
  $file = getenv('SUPPORT_MAIL_CAPTURE');
  $messages = is_file($file) ? json_decode(file_get_contents($file), true) : [];
  $messages[] = compact('to','subject','body','headers','parameters');
  file_put_contents($file, json_encode($messages));
  return true;
}
if (parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) === '/maintenance/support.php') {
  require getenv('SUPPORT_TEST_ROOT') . '/maintenance/support.php';
  return true;
}
return false;
`);
  const server = spawn('php', ['-d', `sys_temp_dir=${fixture}`, '-d', `session.save_path=${fixture}`, '-S', `127.0.0.1:${port}`, '-t', path.resolve(__dirname, '..'), router], {
    stdio: 'ignore', env:{...process.env, SUPPORT_TEST_ROOT:path.resolve(__dirname, '..'), SUPPORT_MAIL_CAPTURE:capture}
  });
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
  await page.waitForFunction(() => { const pixels=document.getElementById('dinoGame').getContext('2d').getImageData(42,0,35,56).data; for(let i=0;i<pixels.length;i+=4){if(pixels[i]===35&&pixels[i+1]===107&&pixels[i+2]===88)return true;}return false; },null,{timeout:2000});
    for (const width of [320,393,1440]) {
      await page.setViewportSize({width, height: 900});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({path: path.join(os.tmpdir(), `opticore-website-maintenance-${width}.png`), fullPage: true});
    }
    await page.getByRole('button', {name: 'Vraag stellen'}).click();
    await page.getByLabel('Naam', {exact: true}).fill('Jan de Vries');
    await page.getByLabel('Bedrijf', {exact:true}).fill('Voorbeeld Bouw');
    await page.getByLabel('E-mailadres', {exact: true}).fill('jan@example.com');
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
    const submit = page.getByRole('button', {name:'Vraag versturen', exact:true});
    await submit.click();
    await page.getByText('Je vraag is verstuurd naar support@opticore-insights.nl. We reageren via je e-mailadres.').waitFor();
    assert.equal(await page.getByLabel('Je vraag',{exact:true}).inputValue(), '');
    let messages = JSON.parse(fs.readFileSync(capture, 'utf8'));
    assert.equal(messages.length, 1);
    assert.equal(messages[0].to, 'support@opticore-insights.nl');
    assert(messages[0].headers.includes('Reply-To: jan@example.com'));
    assert(messages[0].body.includes('Bedrijf: Voorbeeld Bouw'));
    assert(messages[0].body.includes('Wanneer zijn jullie terug?'));
    assert.equal(await page.evaluate(() => sessionStorage.getItem('opticore-maintenance-support-draft')), null);
    await page.getByLabel('Naam',{exact:true}).fill('Jan');
    await page.getByLabel('Bedrijf', {exact:true}).fill('Voorbeeld Bouw');
    await page.getByLabel('E-mailadres',{exact:true}).fill('jan@example.com');
    await page.getByLabel('Je vraag',{exact:true}).fill('[fail-mail] Bewaar mijn vraag');
    await submit.click();
    await page.getByText(/^De mailserver kon je vraag niet versturen/).waitFor();
    assert.equal(await page.getByLabel('Je vraag',{exact:true}).inputValue(), '[fail-mail] Bewaar mijn vraag');
    assert.equal(JSON.parse(fs.readFileSync(capture,'utf8')).length, 1);
    const endpointChecks = await page.evaluate(async () => {
      const endpoint = '/maintenance/support.php';
      const csrf = (await (await fetch(endpoint)).json()).csrf;
      const send = async body => {
        const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
        return response.status;
      };
      const body = {csrf, name:'Jan', company:'Voorbeeld Bouw', email:'jan@example.com', question:'Een vraag', submissionId:crypto.randomUUID()};
      const badToken = await send({...body,csrf:'invalid'});
      const badEmail = await send({...body,email:'bad\r\nBcc: victim@example.com'});
      const first = await send(body), duplicate = await send(body);
      const sent = [];
      for (let i=0;i<4;i++) sent.push(await send({...body,submissionId:crypto.randomUUID()}));
      return {badToken,badEmail,first,duplicate,sent};
    });
    assert.equal(endpointChecks.badToken,403);
    assert.equal(endpointChecks.badEmail,422);
    assert.equal(endpointChecks.first,200);
    assert.equal(endpointChecks.duplicate,200);
    assert.deepEqual(endpointChecks.sent,[200,200,429,429]);
    const preflight = await page.request.fetch(`http://127.0.0.1:${port}/maintenance/support.php`, {
      method:'OPTIONS', headers:{Origin:'https://vps.opticore-insights.nl','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}
    });
    assert.equal(preflight.status(),204);
    assert.equal(preflight.headers()['access-control-allow-origin'],'https://vps.opticore-insights.nl');
    assert.equal(preflight.headers()['access-control-allow-credentials'],'true');
    const foreignOrigin = await page.request.get(`http://127.0.0.1:${port}/maintenance/support.php`,{headers:{Origin:'https://example.org'}});
    assert.equal(foreignOrigin.status(),403);
    messages = JSON.parse(fs.readFileSync(capture,'utf8'));
    assert.equal(messages.length,4,'A retried submission must not send a second email');
    assert.deepEqual(errors, []);
    console.log('Website maintenance: mobile layout, jump, direct mail, reply address, failure retention, CSRF, idempotency and rate limit verified.');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
