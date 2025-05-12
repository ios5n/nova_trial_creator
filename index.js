const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

// إعدادات Puppeteer لـ Railway
const puppeteerOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--single-process' // مهم لبيئات محدودة الذاكرة
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
};

app.post('/create-trial', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "يجب تقديم اسم المستخدم وكلمة السر" 
    });
  }

  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000); // 60 ثانية

  try {
    // 1. تسجيل الدخول إلى لوحة التحكم
    console.log("جارٍ تسجيل الدخول...");
    await page.goto('https://panelres.novalivetv.com/login', { waitUntil: 'networkidle2' });
    await page.type('input[name="username"]', 'hammadi2024'); // استبدل ببياناتك
    await page.type('input[name="password"]', 'mtwajdan700'); // استبدل ببياناتك
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 2. الانتقال إلى صفحة إنشاء اشتراك
    console.log("جارٍ إنشاء الحساب...");
    await page.goto('https://panelres.novalivetv.com/subscriptions/add-subscription', { waitUntil: 'networkidle2' });

    // 3. تعبئة بيانات الحساب
    await page.type('input[formcontrolname="username"]', username);
    await page.type('input[formcontrolname="password"]', password);
    await page.type('input[formcontrolname="mobileNumber"]', '+966500000000'); // رقم افتراضي
    await page.type('textarea[formcontrolname="resellerNotes"]', 'تم الإنشاء تلقائيًا');

    // 4. الضغط على "Next"
    const nextBtn = await page.waitForXPath('//button//span[contains(text(), "Next")]');
    await nextBtn.click();

    // 5. اختيار الباقة (12 ساعة تجريبية)
    await page.click('mat-select[formcontrolname="package"]');
    const packageOption = await page.waitForXPath('//mat-option//span[contains(text(), "12 ساعة")]');
    await packageOption.click();

    // 6. اختيار "All Countries"
    await page.click('mat-select[formcontrolname="country"]');
    const countryOption = await page.waitForXPath('//mat-option//span[contains(text(), "All Countries")]');
    await countryOption.click();

    // 7. اختيار القالب
    await page.click('mat-select[formcontrolname="bouquetTemplate"]');
    const templateOption = await page.waitForXPath('//mat-option//span[contains(text(), "تحويل المحتوى كامل")]');
    await templateOption.click();

    // 8. حفظ البيانات
    const saveBtn = await page.waitForXPath('//button//span[contains(text(), "Save")]');
    await saveBtn.click();

    // 9. التحقق من النجاح
    await page.waitForSelector('.alert-success', { timeout: 5000 });
    console.log("تم إنشاء الحساب بنجاح!");

    res.json({ 
      success: true,
      data: {
        username: username,
        password: password,
        message: "تم إنشاء الحساب التجريبي بنجاح"
      }
    });

  } catch (err) {
    console.error("حدث خطأ:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "فشل في إنشاء الحساب" 
    });
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ الخادم يعمل على المنفذ ${PORT}`));
