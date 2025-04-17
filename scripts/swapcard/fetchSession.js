const puppeteer = require('puppeteer');
const fs = require('fs');

let page;
let browser;

const EMAIL = "lakshmipriyasatheesh123@gmail.com";


async function startLogin() {
    browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    await page.goto('https://app.swapcard.com/login', { waitUntil: 'networkidle2' });

    await page.waitForSelector('input#lookup-email-input-id');
    await page.type('input#lookup-email-input-id', EMAIL, { delay: 100 });

    await page.click('button[data-hook="login-email-submit"]');
    console.log("Email filled and submitted. Waiting for OTP screen...");

    await page.waitForSelector('input.sc-csDkEv', { timeout: 60000 });
    console.log("OTP screen detected. Waiting for user to enter code in React.");
}

async function submitOtp(otp) {
    const otpInputs = await page.$$('input.sc-csDkEv');
    if (otpInputs.length !== 6) {
        console.error(`Expected 6 OTP inputs, but found ${otpInputs.length}`);
        return false;
    }

    for (let i = 0; i < otp.length; i++) {
        await otpInputs[i].type(otp[i], { delay: 50 });
    }

    console.log("✅ OTP entered. Waiting for successful login...");

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const cookies = await page.cookies();
    fs.writeFileSync('./cookies_json/swapcard_cookies.json', JSON.stringify(cookies, null, 2));

    console.log("Cookies saved to swapcard_cookies.json");

    await browser.close();
    page = null;
    browser = null;
    return true;
}

module.exports = { startLogin, submitOtp };
