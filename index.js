const express = require('express');
const cors = require('cors'); // تمكين CORS
const puppeteer = require('puppeteer');

const app = express();
app.use(cors()); // تمكين CORS
app.use(express.json());

app.post('/create-trial', async (req, res) => {
  const { username, password } = req.body;

  // إطلاق المتصفح مع الخيارات المناسبة
  const browser = await puppeteer.launch({
    headless: true, // تشغيل المتصفح بدون واجهة رسومية
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // إضافات لتشغيله في بيئات الخوادم
  });

  const page = await browser.newPage();

  try {
    // الانتقال إلى صفحة تسجيل الدخول
    await page.goto('https://panelres.novalivetv.com/login', { waitUntil: 'networkidle2' });

    // تعبئة بيانات تسجيل الدخول
    await page.type('input[name="username"]', 'hammadi2024');
    await page.type('input[name="password"]', 'mtwajdan700');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // الانتقال إلى صفحة إضافة الاشتراك
    await page.goto('https://panelres.novalivetv.com/subscriptions/add-subscription', { waitUntil: 'networkidle2' });

    // تعبئة بيانات المستخدم
    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // تحديد الخيارات المطلوبة
    // اختيار تجربة 12 ساعة مجانية
    await page.waitForSelector('input[name="trial_time"]'); // التأكد من ظهور الحقل
    await page.click('input[name="trial_time"]'); // تحديد 12 ساعة تجربة مجانية

    // اختيار "All Countries"
    await page.waitForSelector('input[name="all_countries"]'); // التأكد من ظهور الحقل
    await page.click('input[name="all_countries"]'); // تحديد All Countries

    // اختيار تحويل المحتوى كامل
    await page.waitForSelector('input[name="convert_all"]'); // التأكد من ظهور الحقل
    await page.click('input[name="convert_all"]'); // تحويل المحتوى كامل

    // الضغط على زر الحفظ
    await page.waitForSelector('button#save'); // الانتظار حتى يظهر زر الحفظ
    await page.click('button#save'); // الضغط على زر الحفظ
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const url = await page.url(); // جلب الرابط بعد إتمام الاشتراك
    await browser.close(); // إغلاق المتصفح

    res.json({ success: true, message: 'تم إنشاء الاشتراك بنجاح', url });
  } catch (err) {
    await browser.close();
    res.json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
