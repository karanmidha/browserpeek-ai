import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { z } from 'zod';

// Input validation schema
const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  slotId: z.string().uuid(),
  userEmail: z.string().email(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Input validation
    const validatedData = verifyPaymentSchema.parse(req.body);

    // Get RazorPay webhook secret
    const razorPayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!razorPayWebhookSecret) {
      console.error('RazorPay webhook secret not configured');
      return res.status(500).json({ error: 'Payment verification not configured' });
    }

    // CRITICAL: Verify payment signature using HMAC-SHA256
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = validatedData;

    // Create expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorPayWebhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures securely
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(razorpay_signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isSignatureValid) {
      console.error('Payment signature verification failed', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        providedSignature: razorpay_signature,
        expectedSignature: expectedSignature,
      });

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed',
        message: 'Invalid payment signature',
      });
    }

    // Signature is valid - payment is legitimate
    console.log('Payment signature verified successfully', {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    // TODO: Additional checks for production:
    // 1. Verify payment status with RazorPay API
    // 2. Check if payment was already processed (idempotency)
    // 3. Verify payment amount matches expected amount
    // 4. Update booking status in database with proper locking

    // For now, we'll simulate successful booking
    const bookingId = `booking_${Date.now()}`;

    // In production, this would:
    // 1. Check slot availability with database locks (SELECT FOR UPDATE)
    // 2. Create booking record
    // 3. Update slot capacity
    // 4. Send confirmation email
    // 5. Create audit log entry

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      bookingId,
      paymentDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        status: 'verified',
        verifiedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Payment verification error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}