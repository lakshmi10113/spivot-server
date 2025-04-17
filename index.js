const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { startLogin, submitOtp } = require('./scripts/swapcard/fetchSession');

const app = express();
app.use(cors());
app.use(express.json());



app.use(cors());
app.use(express.json());

app.post('/run-python', async (req, res) => {
    const { eventUrl } = req.body;  // ✅ Read eventUrl from frontend

    if (!eventUrl) {
        return res.status(400).json({ success: false, message: "Event URL is required." });
    }

    console.log("🔗 Received event URL:", eventUrl);  // Debug log to confirm it's working

    try {
        if (eventUrl.includes("swapcard.com")) {
            // This is Swapcard flow (open Puppeteer, fill email, wait for OTP)
            await startLogin();
            return res.json({ success: true, message: "OTP screen detected. Enter OTP in React." });
        } else {
            // For other platforms (Airmeet, Zoom, etc.)
            // const result = await runPythonScriptForOther();
            // return res.json({ success: true, message: result });
        }
    } catch (error) {
        console.error("❌ Error running automation script:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/submit-otp', async (req, res) => {
    const { otp } = req.body;
    if (!otp) {
        return res.status(400).json({ success: false, message: "OTP is required." });
    }

    try {
        const success = await submitOtp(otp);
        if (success) {
            res.json({ success: true, message: "✅ Login complete. Cookies saved!" });
        } else {
            res.status(500).json({ success: false, message: "❌ Login failed after OTP." });
        }
    } catch (error) {
        console.error("❌ Submit OTP Error:", error);
        res.status(500).json({ success: false, message: "Error processing OTP." });
    }
});



app.post('/restore-session', (req, res) => {
    const process = exec('node ./scripts/swapcard/restoreSession.js', (error) => {
        if (error) {
            console.error('Failed to restore session:', error);
            res.status(500).json({ success: false, message: 'Failed to restore session.' });
        } else {
            res.json({ success: true, message: 'Browser opened with saved session.' });
        }
    });
});

app.listen(5005, () => console.log("Backend running at http://localhost:5005"));
