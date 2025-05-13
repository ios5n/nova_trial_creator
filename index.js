require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const generateCredentials = () => ({
  username: user_${Math.floor(Math.random() * 9000) + 1000},
  password: pass_${Math.floor(Math.random() * 9000) + 1000}
});

app.post('/create-account', async (req, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://panelres.novalivetv.com/login', { waitUntil: 'networkidle2' });
    
    // ... (أضف باقي خطوات التسجيل وإنشاء الحساب هنا كما في السكربت السابق)
    
    res.json({ success: true, username: 'test', password: 'test123' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(Server running on port ${PORT}));
