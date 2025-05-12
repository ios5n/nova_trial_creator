const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-trial', async (req, res) => {
  const { username, password } = req.body;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  try {
    await page.goto('https://panelres.novalivetv.com/login', { waitUntil: 'networkidle2' });

    await page.type('input[name="username"]', 'hammadi2024');
    await page.type('input[name="password"]', 'mtwajdan700');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.goto('https://panelres.novalivetv.com/subscriptions/add-subscription', { waitUntil: 'networkidle2' });

    await page.type('input[formcontrolname="username"]', username);
    await page.type('input[formcontrolname="password"]', password);
    await page.type('input[formcontrolname="mobileNumber"]', '+966500000000');
    await page.type('textarea[formcontrolname="resellerNotes"]', 'تم الإنشاء تلقائيًا');

    // الضغط على زر Next
    await page.evaluate(() => {
      const nextBtn = [...document.querySelectorAll('button span')].find(el => el.textContent.includes("Next"));
      if (nextBtn) nextBtn.click();
    });
    await page.waitForTimeout(1000);

    // اختيار باقة "12 ساعة تجربة مجانية"
    await page.click('mat-select[formcontrolname="package"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes("12 ساعة")).click();
    });

    // اختيار All Countries
    await page.click('mat-select[formcontrolname="country"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes("All Countries")).click();
    });

    // اختيار قالب "تحويل المحتوى كامل"
    await page.click('mat-select[formcontrolname="bouquetTemplate"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes("تحويل المحتوى كامل")).click();
    });

    // الضغط على زر Save
    await page.evaluate(() => {
      const saveBtn = [...document.querySelectorAll('button span')].find(el => el.textContent.includes("Save"));
      if (saveBtn) saveBtn.click();
    });
    await page.waitForTimeout(3000);

    await browser.close();
    res.json({ success: true, message: `تم إنشاء الحساب: ${username}` });
  } catch (err) {
    await browser.close();
    res.json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
