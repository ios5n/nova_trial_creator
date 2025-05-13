const puppeteer = require('puppeteer-extra');
puppeteer.use(require('puppeteer-extra-plugin-stealth')());

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://bot.sannysoft.com');
  await page.screenshot({ path: 'test.png' });
  await browser.close();
  console.log('✅ تم الاختبار بنجاح - راجع صورة test.png');
})();
