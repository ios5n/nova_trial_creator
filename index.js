const express = require('express');
const cors = require('cors'); // أضفنا cors
const puppeteer = require('puppeteer');

const app = express();
app.use(cors()); // تمكين CORS
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

    await page.type('input[name="username"]', username);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const url = await page.url();
    await browser.close();

    res.json({ success: true, message: 'تم إنشاء الاشتراك بنجاح', url });
  } catch (err) {
    await browser.close();
    res.json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
