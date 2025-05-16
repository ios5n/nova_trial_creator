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

    // 2. إدخال بيانات تسجيل الدخول باستخدام ID
    await page.waitForSelector('#username');
    await page.type('#username', 'hammadi2024');

    await page.waitForSelector('#password');
    await page.type('#password', 'mtwajdan700');

    // 3. الضغط على زر الدخول
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 4. فتح صفحة إضافة اشتراك جديد
    await page.goto('https://panelres.novalivetv.com/subscriptions/add-subscription', { waitUntil: 'networkidle2' });

    // 5. تعبئة البيانات الأساسية
    await page.type('input[formcontrolname="username"]', username);
    await page.type('input[formcontrolname="password"]', password);
    await page.type('input[formcontrolname="mobileNumber"]', '+966500000000');
    await page.type('textarea[formcontrolname="resellerNotes"]', 'تم الإنشاء تلقائيًا');

    // 6. الضغط على "Next"
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Next'));
      nextBtn?.click();
    });
    await page.waitForTimeout(2000);

    // 7. اختيار الباقة
    await page.click('mat-select[formcontrolname="package"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = Array.from(document.querySelectorAll('mat-option')).find(el => el.textContent.includes('تجربه 12 ساعه مجانا'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 8. اختيار الدولة
    await page.click('mat-select[formcontrolname="country"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = Array.from(document.querySelectorAll('mat-option')).find(el => el.textContent.includes('All Countries'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 9. اختيار قالب الباقات
    await page.click('mat-select[formcontrolname="bouquetTemplate"]');
    await page.waitForSelector('mat-option');
    await page.evaluate(() => {
      const option = Array.from(document.querySelectorAll('mat-option')).find(el => el.textContent.includes('تحويل الي المحتوي كامل'));
      option?.click();
    });
    await page.waitForTimeout(1000);

    // 10. الضغط على زر Save
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('Save'));
      saveBtn?.click();
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
