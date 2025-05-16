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
    // 1. افتح صفحة تسجيل الدخول
    await page.goto('https://panelres.novalivetv.com/login', { waitUntil: 'networkidle2' });

    // 2. انتظر حقول اسم المستخدم وكلمة المرور (XPath من الجذر)
    const [usernameInput] = await page.waitForXPath('//input[@id="username"]', { timeout: 30000 });
    await usernameInput.type('hammadi2024');

    const [passwordInput] = await page.waitForXPath('//input[@id="password"]', { timeout: 30000 });
    await passwordInput.type('mtwajdan700');

    // 3. الضغط على زر Sign in
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Sign in'));
      btn?.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 4. افتح صفحة إضافة اشتراك
    await page.goto('https://panelres.novalivetv.com/subscriptions/add-subscription', { waitUntil: 'networkidle2' });

    // 5. أدخل بيانات الحساب الجديد
    await page.type('input[formcontrolname="username"]', username);
    await page.type('input[formcontrolname="password"]', password);
    await page.type('input[formcontrolname="mobileNumber"]', '+966500000000');
    await page.type('textarea[formcontrolname="resellerNotes"]', 'تم الإنشاء تلقائيًا');

    // 6. اضغط على Next
    await page.evaluate(() => {
      const nextBtn = [...document.querySelectorAll('button')].find(btn => btn.textContent.includes('Next'));
      nextBtn?.click();
    });
    await page.waitForTimeout(2000);

    // 7. اختر الباقة
    await page.click('mat-select[formcontrolname="package"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes('تجربه 12 ساعه مجانا'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 8. اختر الدولة
    await page.click('mat-select[formcontrolname="country"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes('All Countries'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 9. اختر قالب الباقات
    await page.click('mat-select[formcontrolname="bouquetTemplate"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = [...document.querySelectorAll('mat-option')].find(el => el.textContent.includes('تحويل الي المحتوي كامل'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 10. اضغط على زر Save
    await page.evaluate(() => {
      const saveBtn = [...document.querySelectorAll('button')].find(btn => btn.textContent.includes('Save'));
      saveBtn?.click();
    });

    await page.waitForTimeout(3000);
    await browser.close();

    res.json({ success: true, message: `✅ تم إنشاء الحساب: ${username}` });
  } catch (err) {
    await browser.close();
    res.json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
