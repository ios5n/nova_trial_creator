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
    // 1. فتح صفحة تسجيل الدخول
    await page.goto('https://panelres.novalivetv.com/login', { waitUntil: 'networkidle2' });

    // ✅ ننتظر ظهور العناصر حسب XPath
    await page.waitForXPath('//input[@id="username"]');
    const usernameInput = await page.$x('//input[@id="username"]');
    await usernameInput[0].type('hammadi2024');

    await page.waitForXPath('//input[@id="password"]');
    const passwordInput = await page.$x('//input[@id="password"]');
    await passwordInput[0].type('mtwajdan700');

    // 2. الضغط على زر "Sign in"
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Sign in'));
      btn?.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 3. فتح صفحة إضافة اشتراك
    await page.goto('https://panelres.novalivetv.com/subscriptions/add-subscription', { waitUntil: 'networkidle2' });

    // 4. تعبئة بيانات الاشتراك
    await page.type('input[formcontrolname="username"]', username);
    await page.type('input[formcontrolname="password"]', password);
    await page.type('input[formcontrolname="mobileNumber"]', '+966500000000');
    await page.type('textarea[formcontrolname="resellerNotes"]', 'تم الإنشاء تلقائيًا');

    // 5. الضغط على زر Next
    await page.evaluate(() => {
      const nextBtn = [...document.querySelectorAll('button')].find(btn => btn.textContent.includes('Next'));
      nextBtn?.click();
    });
    await page.waitForTimeout(2000);

    // 6. اختيار الباقة
    await page.click('mat-select[formcontrolname="package"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes('تجربه 12 ساعه مجانا'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 7. اختيار الدولة
    await page.click('mat-select[formcontrolname="country"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes('All Countries'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 8. اختيار قالب الباقات
    await page.click('mat-select[formcontrolname="bouquetTemplate"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes('تحويل الي المحتوي كامل'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 9. الضغط على زر Save
    await page.evaluate(() => {
      const saveBtn = [...document.querySelectorAll('button')].find(btn => btn.textContent.includes('Save'));
      saveBtn?.click();
    });

    await page.waitForTimeout(3000);
    await browser.close();

    res.json({ success: true, message: `✅ تم إنشاء الحساب بنجاح: ${username}` });
  } catch (err) {
    await browser.close();
    res.json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
