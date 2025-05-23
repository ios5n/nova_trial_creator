
# استخدم صورة Node الرسمية
FROM node:20

# تثبيت المتطلبات الخاصة بـ Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libxss1 \
    libgtk-3-0 \
    libxshmfence1 \
    libglu1 \
    fonts-liberation \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# إعداد المجلد الأساسي للتطبيق
WORKDIR /app

# نسخ الملفات
COPY . .

# تثبيت الحزم بدون تحميل Chromium الداخلي
ENV PUPPETEER_SKIP_DOWNLOAD true
RUN npm install

# تحديد مسار Chromium للـ Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# أمر التشغيل
CMD ["npm", "start"]
