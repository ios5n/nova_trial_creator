<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>إنشاء حساب IPTV تجريبي</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(to bottom, #0f2027, #203a43, #2c5364);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    h1 {
      margin-bottom: 20px;
      font-size: 2em;
    }
    button {
      background-color: #00c6ff;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #007acc;
    }
    #status {
      margin-top: 30px;
      font-size: 18px;
      line-height: 1.6;
      color: #aeeeee;
    }
  </style>
</head>
<body>

  <h1>احصل على حساب IPTV تجريبي</h1>
  <button onclick="createTrial()">إنشاء حساب تلقائي</button>

  <div id="status"></div>

  <script>
    function generateRandom(length = 6) {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    async function createTrial() {
      const username = "user" + generateRandom();
      const password = generateRandom(8);
      const status = document.getElementById("status");
      status.style.color = "#aeeeee";
      status.innerHTML = "جاري إنشاء الحساب، الرجاء الانتظار...";

      try {
        const response = await fetch("https://novatrialcreator-production.up.railway.app/create-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
          status.innerHTML = `
            <strong>تم إنشاء الحساب بنجاح:</strong><br>
            <b>اسم المستخدم:</b> ${username}<br>
            <b>كلمة المرور:</b> ${password}
          `;
        } else {
          status.style.color = "orange";
          status.innerHTML = "حدث خطأ أثناء إنشاء الحساب، الرجاء المحاولة لاحقًا.";
        }
      } catch (error) {
        status.style.color = "red";
        status.innerHTML = "فشل الاتصال بالخادم. تأكد من الاتصال بالإنترنت.";
      }
    }
  </script>

</body>
</html>
