const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,  // Open visible browser so user can see they are logged in
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Load cookies from saved file
    const cookies = JSON.parse(fs.readFileSync('./cookies_json/swapcard_cookies.json', 'utf-8'));

    // Set cookies on the page before visiting Swapcard
    await page.setCookie(...cookies);

    // Now go to Swapcard
    await page.goto('https://app.swapcard.com/');

    console.log("✅ Browser opened with restored session cookies. User should be auto-logged in if cookies are still valid.");

    // Optional: Keep browser open so user can interact with it
})();
