# Habit Tracker - Production & Troubleshooting Guide

This guide covers environment configuration, production deployment, and troubleshooting for the **Habit Tracker Progressive Web Application (PWA)**.

---

## 1. Environment Configuration

Ensure your `.env` or Vercel Environment Variables include:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google OAuth (Optional override, defaults to registered client)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Razorpay Payments (Client Key)
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id

# Razorpay Serverless Webhook / Signature Secret (Stored only in serverless environment)
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## 2. Security & Backend Rules

### A. Deploying Firestore Security Rules
The repository includes a ready-to-deploy [firestore.rules](file:///c:/Users/saksh/OneDrive/Desktop/habbit%20tracker/firestore.rules) file. It ensures:
1. Authenticated users can only read and write their own habits (`user_habits/{userId}`).
2. Accountability buddies (`friends`) can read each other's habits for weekly progress display.
3. Profile updates are restricted so other users can only send or accept friend requests.

**Deployment via Firebase CLI:**
```bash
firebase deploy --only firestore:rules
```
*Alternatively, copy and paste the contents of `firestore.rules` directly into the Firebase Console Rules tab.*

---

## 3. Server-Side Payment Verification

When users upgrade to Pro via Razorpay, the transaction signature is validated server-side by the Vercel Serverless Function at [api/verify-payment.js](file:///c:/Users/saksh/OneDrive/Desktop/habbit%20tracker/api/verify-payment.js).
* Computes cryptographic HMAC SHA256 signature verification matching `razorpay_order_id` and `razorpay_payment_id`.
* Prevents client-side tampering or illegitimate status modifications.
* When testing locally in Vite dev mode, `vite.config.js` provides automatic development mock responses.

---

## 4. Browser Audio Autoplay Policy

Modern browsers require a user interaction (click, keypress, touch) before Web Audio oscillators can play sound:
* The application implements an automated unlocker in [src/utils/audioUtils.js](file:///c:/Users/saksh/OneDrive/Desktop/habbit%20tracker/src/utils/audioUtils.js).
* A single shared `AudioContext` is proactively resumed on the user's first click or touch anywhere on the page.
* This guarantees the Pomodoro session completion bell (`playPomodoroDing`) and daily reminder alarm (`playAlarmSound`) always play smoothly without browser console warnings or context hardware exhaustion.

---

## 5. Common Issues & Solutions

### A. Google Sign-In Origin Not Allowed
* **Symptoms**: Google login popup closes immediately or reports `origin_mismatch`.
* **Fix**:
  1. Open [Google Cloud Console](https://console.cloud.google.com/) -> APIs & Services -> Credentials.
  2. Under OAuth 2.0 Client IDs, add your development origin (`http://localhost:5173`) and your production Vercel domain (`https://your-domain.vercel.app`) to **Authorized JavaScript origins**.
  3. You can also use the direct **Sign in with Google Popup** button in the app.

### B. Daily Habit Reminders Not Appearing
* **Symptoms**: Configured reminder time passes without notifications.
* **Fix**:
  1. Check browser site permissions and ensure notifications are set to **Allow**.
  2. Verify that your system's "Do Not Disturb" or "Focus Assist" is turned off.
  3. Click **Test** on the Profile page to verify notification and audio chime dispatch.

### C. Single Page Application (SPA) 404s on Refresh (Vercel)
* **Symptoms**: Refreshing `/weekly-stats`, `/pomodoro`, or `/profile` on Vercel returns a 404.
* **Fix**: `vercel.json` contains rewrites directing all routes to `/index.html`:
```json
{
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 6. Production Build & Validation

```bash
# Install dependencies
npm install

# Build optimized production bundle
npm run build

# Preview production bundle locally
npm run preview
```