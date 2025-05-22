const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-trial', async (req, res) => {
  const { username, password } = req.body;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // 1. تسجيل الدخول
    await page.goto('https://panelres.novalivetv.com/sign-in', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);

    await page.type('#username', 'hammadi2024', { delay: 50 });
    await page.type('#password', 'mtwajdan700', { delay: 50 });

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Sign in'));
      btn?.click();
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });

    // 2. الانتقال إلى صفحة الاشتراكات
    await page.goto('https://panelres.novalivetv.com/subscriptions/subscriptions-list', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);

    // 3. الضغط على زر Add
    const addSpan = await page.$x("//span[contains(text(), 'Add')]");
    if (addSpan.length > 0) {
      const addBtn = await addSpan[0].evaluateHandle(el => el.closest('button'));
      await addBtn.click();
    } else {
      throw new Error('❌ زر Add غير موجود');
    }

    // 4. إدخال اسم المستخدم وكلمة المرور
    await page.waitForSelector('input[formcontrolname="username"]', { visible: true, timeout: 15000 });
    await page.type('input[formcontrolname="username"]', username, { delay: 50 });
    await page.type('input[formcontrolname="password"]', password, { delay: 50 });

    // 5. الضغط على زر Next
    const nextBtn = await page.$x("//span[contains(text(), 'Next')]");
    if (nextBtn.length > 0) {
      const nextClick = await nextBtn[0].evaluateHandle(el => el.closest('button'));
      await nextClick.click();
    } else {
      throw new Error('❌ زر Next غير موجود');
    }

    await page.waitForTimeout(4000);

    // 6. اختيار تجربة 12 ساعة
    const trialInput = await page.$$('input[role="combobox"]');
    if (trialInput.length < 1) throw new Error("❌ خانة تجربة 12 ساعة غير موجودة");

    await trialInput[0].click();
    await trialInput[0].type('تجربه 12 ساعه مجانا', { delay: 50 });

    await page.waitForXPath("//span[contains(text(), 'تجربه 12 ساعه مجانا')]", { visible: true, timeout: 10000 });
    const trialOption = await page.$x("//span[contains(text(), 'تجربه 12 ساعه مجانا')]");
    if (trialOption.length > 0) {
      await trialOption[0].click();
    } else {
      throw new Error('❌ خيار تجربة 12 ساعة غير موجود');
    }

    await page.waitForTimeout(1000);

    // 7. اختيار تحويل إلى المحتوى كامل
    if (trialInput.length < 2) throw new Error("❌ خانة Bouquet templates غير موجودة");

    await trialInput[1].click();
    await trialInput[1].type('تحويل الي المحتوي كامل', { delay: 50 });

    await page.waitForXPath("//span[contains(text(), 'تحويل الي المحتوي كامل')]", { visible: true, timeout: 10000 });
    const bouquetOption = await page.$x("//span[contains(text(), 'تحويل الي المحتوي كامل')]");
    if (bouquetOption.length > 0) {
      await bouquetOption[0].click();
    } else {
      throw new Error('❌ خيار تحويل المحتوى غير موجود');
    }

    await page.waitForTimeout(1000);

    // ✅ الضغط على Save
    const saveBtn = await page.$x("//span[contains(text(), 'Save')]");
    if (saveBtn.length > 0) {
      const save = await saveBtn[0].evaluateHandle(el => el.closest('button'));
      await save.click();
    } else {
      throw new Error('❌ لم يتم العثور على زر Save');
    }

    await page.waitForTimeout(4000);
    await browser.close();

    res.json({ success: true, message: `✅ تم إنشاء الحساب بنجاح: ${username}` });

  } catch (err) {
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
    await browser.close();
    res.json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
