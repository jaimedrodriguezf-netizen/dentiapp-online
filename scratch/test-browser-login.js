const { chromium } = require('/home/jaimepop/.nvm/versions/node/v22.22.0/lib/node_modules/@playwright/mcp/node_modules/playwright');
const path = require('path');

async function run() {
  console.log('🚀 Iniciando navegador Chrome del sistema en modo headless...');
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.setViewportSize({ width: 1280, height: 720 });
  
  console.log('🔑 Navegando a la página de login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  
  console.log('✍️ Completando credenciales...');
  await page.fill('input[type="email"]', 'admin@dentiapp.online');
  await page.fill('input[type="password"]', 'danro32676');
  
  console.log('🖱️ Haciendo click en iniciar sesión...');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  
  console.log('📍 URL actual después del login:', page.url());
  
  // Guardar screenshot para validar visualmente
  const screenshotPath = path.join(__dirname, 'login_success.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Captura de pantalla guardada en: ${screenshotPath}`);
  
  await browser.close();
}

run().catch(err => {
  console.error('💥 Error de ejecución:', err);
  process.exit(1);
});
