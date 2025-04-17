
const puppeteer = require('puppeteer');
const fs = require('fs');

let browser;
let page;

async function startLogin() {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();

    await page.goto('https://app.swapcard.com/');

    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', 'your-email@example.com');

    await page.waitForSelector('input[name="password"]');
    await page.type('input[name="password"]', 'your-password');

    await page.click('button[type="submit"]');

    // Wait for the OTP input field
    await page.waitForSelector('input[name="otp"]', { timeout: 100000 });
}

async function submitOtp(otp) {
    if (!page) {
        console.error("❌ No active Puppeteer session.");
        return false;
    }

    await page.type('input[name="otp"]', otp);
    await page.click('button[type="submit"]');

    // Wait for final dashboard load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const cookies = await page.cookies();
    fs.writeFileSync('swapcard_cookies.json', JSON.stringify(cookies, null, 2));

    await browser.close();
    return true;
}

module.exports = { startLogin, submitOtp };
