require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const app = express();

// إعدادات متقدمة لـ Puppeteer
puppeteer.use(StealthPlugin());
app.use(cors());
app.use(express.json());

// تحسين توليد بيانات الاعتماد
const generateCredentials = () => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 9000) + 1000;
  return {
    username: trial_${timestamp}${random}.slice(0, 15),
    password: Pass${random}${timestamp}!
  };
};

// نظام المحاولات المتعددة
const retryOperation = async (operation, maxRetries = 3, delay = 2000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

app.post('/api/create-account', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--single-process'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(90000);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  try {
    // 1. تسجيل الدخول مع إعادة المحاولة
    await retryOperation(async () => {
      console.log('محاولة تسجيل الدخول...');
      await page.goto('https://panelres.novalivetv.com/login', {
        waitUntil: 'networkidle2',
        timeout: 45000
      });

      await page.evaluate(() => {
        document.querySelector('input[name="username"]').value = '';
        document.querySelector('input[name="password"]').value = '';
      });

      await page.type('input[name="username"]', process.env.ADMIN_USERNAME, { delay: 30 });
      await page.type('input[name="password"]', process.env.ADMIN_PASSWORD, { delay: 30 });
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
      ]);

      if (page.url().includes('login')) {
        throw new Error('فشل في تسجيل الدخول: لم يتم التوجيه');
      }
    });

    // 2. إنشاء الحساب
    const { username, password } = generateCredentials();
    console.log(إنشاء حساب جديد: ${username});

    await retryOperation(async () => {
      await page.goto('https://panelres.novalivetv.com/subscriptions/add-subscription', {
        waitUntil: 'networkidle2',
        timeout: 45000
      });

      // تعبئة البيانات الأساسية
      await page.evaluate((data) => {
        document.querySelector('input[formcontrolname="username"]').value = data.username;
        document.querySelector('input[formcontrolname="password"]').value = data.password;
        document.querySelector('input[formcontrolname="mobileNumber"]').value = '+966500000000';
        document.querySelector('textarea[formcontrolname="resellerNotes"]').value = 'تم الإنشاء تلقائيًا';
      }, { username, password });

      // الضغط على Next
      const nextBtn = await page.waitForSelector('button:has-text("Next")', { timeout: 10000 });
      await Promise.all([
        nextBtn.click(),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
      ]);

      // اختيار الباقة
      await page.click('mat-select[formcontrolname="package"]');
      await page.waitForSelector('mat-option', { visible: true, timeout: 5000 });
      const trialOption = await page.$x('//span[contains(., "12 ساعة")]/ancestor::mat-option');
      await trialOption[0].click();

      // اختيار الدولة
      await page.click('mat-select[formcontrolname="country"]');
      await page.waitForSelector('mat-option', { visible: true, timeout: 5000 });
      const countryOption = await page.$x('//span[contains(., "All Countries")]/ancestor::mat-option');
      await countryOption[0].click();

      // اختيار القالب
      await page.click('mat-select[formcontrolname="bouquetTemplate"]');
      await page.waitForSelector('mat-option', { visible: true, timeout: 5000 });
      const templateOption = await page.$x('//span[contains(., "تحويل المحتوى كامل")]/ancestor::mat-option');
      await templateOption[0].click();

      // الحفظ النهائي
      const saveBtn = await page.waitForSelector('button:has-text("Save")', { timeout: 10000 });
      await Promise.all([
        saveBtn.click(),
        page.waitForResponse(response => 
          response.url().includes('subscriptions') && 
          response.status() === 200,
          { timeout: 30000 }
        )
      ]);

      // التحقق من النجاح
      await page.waitForSelector('.alert-success, .subscription-details', { timeout: 15000 });
    }, 3, 3000);

    // 3. استخراج بيانات الحساب
    const accountData = await page.evaluate(() => {
      const extractValue = (labelText) => {
        const element = [...document.querySelectorAll('.detail-row')].find(el => 
          el.textContent.includes(labelText)
        );
        return element?.querySelector('.value')?.textContent?.trim() || 'غير متوفر';
      };

      return {
        m3u: extractValue('M3U') || extractValue('رابط التشغيل'),
        expiry: extractValue('Expiry') || extractValue('تاريخ الانتهاء'),
        status: extractValue('Status') || extractValue('الحالة')
      };
    });

    // 4. إرسال النتيجة
    res.json({
      success: true,
      account: {
        username,
        password,
        m3u_url: accountData.m3u,
        expiry_date: accountData.expiry || '12 ساعة',
        status: accountData.status || 'نشط',
        created_at: new Date().toLocaleString('ar-SA')
      }
    });

  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    
    // التقاط لقطة شاشة
    const screenshotPath = errors/error-${Date.now()}.png;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء الحساب',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        screenshot: screenshotPath
      } : undefined,
      suggestion: 'الرجاء المحاولة مرة أخرى بعد دقيقتين'
    });
  } finally {
    await browser.close();
  }
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(🚀 الخادم يعمل على http://localhost:${PORT});
  console.log('🔧 وضع التشغيل:', process.env.NODE_ENV || 'development');
});
