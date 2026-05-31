const { chromium } = require('/home/jaimepop/.nvm/versions/node/v22.22.0/lib/node_modules/@playwright/mcp/node_modules/playwright');

async function run() {
  console.log('Connecting to browser via WS URL:', process.env.AGY_BROWSER_WS_URL);
  const browser = await chromium.connectOverCDP(process.env.AGY_BROWSER_WS_URL);
  const contexts = browser.contexts();
  
  if (contexts.length === 0) {
    console.log('No contexts found.');
    return;
  }
  
  const pages = contexts[0].pages();
  console.log(`Found ${pages.length} pages in the first context.`);
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    console.log(`Page ${i}: URL = ${page.url()}, Title = ${await page.title()}`);
    
    // Check if we are on localhost
    if (page.url().includes('localhost')) {
      const cookies = await contexts[0].cookies(page.url());
      console.log(`Cookies for page ${i}:`, cookies);
      const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage, null, 2));
      console.log(`LocalStorage for page ${i}:`, localStorage);
    }
  }
}

run().catch(console.error);
