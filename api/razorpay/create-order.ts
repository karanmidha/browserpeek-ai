import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { z } from 'zod';

// Rate limiting - simple in-memory store (for production use Redis/KV)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// Validate rate limiting
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Input validation schema
const createOrderSchema = z.object({
  slotId: z.string().uuid(),
  practiceStyleId: z.string().uuid(),
  amount: z.number().min(1).max(10000), // Min ₹1, Max ₹100 (reasonable bounds)
  currency: z.string().default('INR'),
  userEmail: z.string().email(),
  userName: z.string().min(1).max(100),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ipString = Array.isArray(ip) ? ip[0] : ip;

    if (!checkRateLimit(ipString)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Maximum 5 booking attempts per hour',
      });
    }

    // Input validation
    const validatedData = createOrderSchema.parse(req.body);

    // CRITICAL: Server-side price validation
    // In production, lookup actual price from database
    const practiceStylePrices: Record<string, number> = {
      'hatha-yoga': 500,
      'vinyasa-flow': 600,
      'meditation': 400,
      // Also support the names as they appear in the frontend
      'Hatha Yoga': 500,
      'Vinyasa Flow': 600,
      'Meditation & Mindfulness': 400,
    };

    // Validate the practice style exists and get server-side price
    const serverSidePrice = practiceStylePrices[validatedData.practiceStyleId];
    if (!serverSidePrice) {
      console.error('Unknown practice style:', validatedData.practiceStyleId, 'Available styles:', Object.keys(practiceStylePrices));
      return res.status(400).json({
        error: 'Invalid practice style',
        providedId: validatedData.practiceStyleId,
        availableStyles: Object.keys(practiceStylePrices),
      });
    }

    // CRITICAL: Reject if client price doesn't match server price
    if (validatedData.amount !== serverSidePrice) {
      return res.status(400).json({
        error: 'Price validation failed',
        message: `Expected ₹${serverSidePrice}, received ₹${validatedData.amount}`,
      });
    }

    // TODO: Check slot availability and implement database locking
    // For now, we'll create the order but this needs proper DB integration

    // Create RazorPay order using their API
    const razorPayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorPayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorPayKeyId || !razorPayKeySecret) {
      console.error('RazorPay credentials not configured');
      return res.status(500).json({ error: 'Payment service not configured' });
    }

    // Create RazorPay order payload
    const razorPayOrder = {
      amount: validatedData.amount * 100, // Convert to paise
      currency: validatedData.currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        slotId: validatedData.slotId,
        practiceStyleId: validatedData.practiceStyleId,
        userEmail: validatedData.userEmail,
      },
    };

    // Call RazorPay API to create order
    const auth = Buffer.from(`${razorPayKeyId}:${razorPayKeySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorPayOrder),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('RazorPay API error:', errorData);
      return res.status(500).json({ error: 'Failed to create payment order' });
    }

    const order = await response.json();

    // Return the order details
    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      },
      razorPayKeyId, // Frontend needs this for checkout
    });

  } catch (error) {
    console.error('Create order error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}