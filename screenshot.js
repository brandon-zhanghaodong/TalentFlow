import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('正在访问应用...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  
  console.log('等待页面渲染...');
  await page.waitForTimeout(3000);
  
  console.log('截取屏幕...');
  await page.screenshot({ path: '/home/ubuntu/TalentFlow/app-screenshot.png', fullPage: true });
  
  console.log('✅ 截图已保存到: /home/ubuntu/TalentFlow/app-screenshot.png');
  
  await browser.close();
})();
