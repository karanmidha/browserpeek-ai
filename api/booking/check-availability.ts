import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Input validation schema
const checkAvailabilitySchema = z.object({
  slotId: z.string().uuid(),
  dateRequested: z.string().datetime(),
});

// Business rules validation
function validateBookingRules(slotData: any): { isValid: boolean; reason?: string } {
  const now = new Date();
  const slotTime = new Date(slotData.date_time);

  // 24-hour cutoff rule
  const hoursUntilSlot = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilSlot < 24) {
    return {
      isValid: false,
      reason: 'Booking must be made at least 24 hours in advance',
    };
  }

  // Capacity check
  if (slotData.booked_count >= slotData.capacity) {
    return {
      isValid: false,
      reason: 'This slot is fully booked',
    };
  }

  return { isValid: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Input validation
    const validatedData = checkAvailabilitySchema.parse(req.body);

    // TODO: Replace with actual database queries
    // For now, simulate database lookup and locking

    // In a real implementation, this would:
    // 1. BEGIN TRANSACTION
    // 2. SELECT ... FROM time_slots WHERE id = ? FOR UPDATE
    // 3. Validate business rules
    // 4. Check actual availability
    // 5. COMMIT or ROLLBACK

    // Mock slot data (replace with actual DB query)
    const slotData = {
      id: validatedData.slotId,
      date_time: validatedData.dateRequested,
      capacity: 8,
      booked_count: 3, // Would come from actual count in bookings table
      practice_style_id: 'hatha-yoga',
      price: 500,
    };

    // Validate business rules server-side
    const ruleValidation = validateBookingRules(slotData);
    if (!ruleValidation.isValid) {
      return res.status(400).json({
        available: false,
        reason: ruleValidation.reason,
      });
    }

    // Slot is available
    return res.status(200).json({
      available: true,
      slot: {
        id: slotData.id,
        capacity: slotData.capacity,
        bookedCount: slotData.booked_count,
        remainingSpots: slotData.capacity - slotData.booked_count,
        price: slotData.price,
      },
      message: 'Slot is available for booking',
    });

  } catch (error) {
    console.error('Availability check error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        available: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }

    return res.status(500).json({
      available: false,
      error: 'Internal server error',
    });
  }
}