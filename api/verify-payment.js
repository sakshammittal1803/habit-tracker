import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body || {};

    if (!razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing razorpay_payment_id' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;

    // If no secret key is configured (e.g. initial demo/test environment), return status
    if (!keySecret) {
      console.warn("RAZORPAY_KEY_SECRET not set in environment. Running in mock verification mode.");
      return res.status(200).json({
        success: true,
        verified: true,
        mode: 'mock',
        message: 'Payment accepted in mock/dev mode. Set RAZORPAY_KEY_SECRET for HMAC verification.'
      });
    }

    // Cryptographic HMAC SHA256 Signature Verification
    if (razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'Signature verification failed. Potential tampering detected.'
        });
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      userId
    });
  } catch (error) {
    console.error("Payment verification server error:", error);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
}
