export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // In dev or without keys, return a mock order ID
      return res.status(200).json({
        id: `order_dev_${Date.now()}`,
        amount: 10000,
        currency: 'INR',
        mock: true
      });
    }

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`
      },
      body: JSON.stringify({
        amount: 10000, // 100 INR in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn("Razorpay order API error:", data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Order creation server error:", error);
    return res.status(500).json({ error: 'Internal server error during order creation' });
  }
}
