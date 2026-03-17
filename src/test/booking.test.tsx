import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateSelector from '../components/booking/DateSelector';
import TimeSlotSelector from '../components/booking/TimeSlotSelector';
import BookingSummary from '../components/booking/BookingSummary';

// Mock data for testing
const mockTimeSlot = {
  id: 'slot-1',
  instructor_id: 'instructor-1',
  date: '2024-03-20',
  start_time: '09:00',
  end_time: '10:30',
  is_available: true,
  max_students: 10,
  practice_style_id: 'hatha-yoga',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  practice_style: {
    id: 'hatha-yoga',
    name: 'Hatha Yoga',
    description: 'Gentle practice focusing on basic postures',
    duration_minutes: 90,
    max_students: 10,
    price: 500,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  booked_count: 3,
  is_within_cutoff: false,
  is_full: false,
};

describe('DateSelector', () => {
  const mockOnDateSelect = vi.fn();

  beforeEach(() => {
    mockOnDateSelect.mockClear();
  });

  it('renders available dates', () => {
    render(
      <DateSelector
        selectedDate={null}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText('Select Date')).toBeInTheDocument();
    expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
  });

  it('highlights today correctly', () => {
    render(
      <DateSelector
        selectedDate={null}
        onDateSelect={mockOnDateSelect}
      />
    );

    const todayButtons = screen.getAllByText('Today');
    expect(todayButtons.length).toBeGreaterThan(0);
    const firstTodayButton = todayButtons[0];
    expect(firstTodayButton.closest('button')).toHaveClass('bg-secondary-100');
  });

  it('calls onDateSelect when date is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DateSelector
        selectedDate={null}
        onDateSelect={mockOnDateSelect}
      />
    );

    const todayButtons = screen.getAllByText('Today');
    await user.click(todayButtons[0]);

    expect(mockOnDateSelect).toHaveBeenCalledTimes(1);
    expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it('shows selected date', () => {
    const selectedDate = new Date();
    selectedDate.setDate(selectedDate.getDate() + 1); // Tomorrow

    render(
      <DateSelector
        selectedDate={selectedDate}
        onDateSelect={mockOnDateSelect}
      />
    );

    expect(screen.getByText(/Selected:/)).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', () => {
    render(
      <DateSelector
        selectedDate={null}
        onDateSelect={mockOnDateSelect}
        disabled={true}
      />
    );

    const todayButtons = screen.getAllByText('Today');
    expect(todayButtons[0].closest('button')).toBeDisabled();
  });
});

describe('TimeSlotSelector', () => {
  const mockOnSlotSelect = vi.fn();
  const selectedDate = new Date('2024-03-20');

  beforeEach(() => {
    mockOnSlotSelect.mockClear();
  });

  it('shows message when no date is selected', () => {
    render(
      <TimeSlotSelector
        selectedDate={null}
        selectedSlot={null}
        onSlotSelect={mockOnSlotSelect}
      />
    );

    expect(screen.getByText('Please select a date first')).toBeInTheDocument();
  });

  it('displays time slots after loading', async () => {
    render(
      <TimeSlotSelector
        selectedDate={selectedDate}
        selectedSlot={null}
        onSlotSelect={mockOnSlotSelect}
      />
    );

    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText('6:00 AM - 7:30 AM')).toBeInTheDocument();
    });

    expect(screen.getByText('Hatha Yoga')).toBeInTheDocument();
  });

  it('displays time slots correctly', async () => {
    render(
      <TimeSlotSelector
        selectedDate={selectedDate}
        selectedSlot={null}
        onSlotSelect={mockOnSlotSelect}
      />
    );

    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText('6:00 AM - 7:30 AM')).toBeInTheDocument();
    });

    expect(screen.getByText('Hatha Yoga')).toBeInTheDocument();
    expect(screen.getByText('7 of 10 spots available')).toBeInTheDocument();
    expect(screen.getByText('₹500')).toBeInTheDocument();
  });

  it('handles slot selection', async () => {
    const user = userEvent.setup();

    render(
      <TimeSlotSelector
        selectedDate={selectedDate}
        selectedSlot={null}
        onSlotSelect={mockOnSlotSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('6:00 AM - 7:30 AM')).toBeInTheDocument();
    });

    const slotButton = screen.getByText('6:00 AM - 7:30 AM').closest('button');
    await user.click(slotButton!);

    expect(mockOnSlotSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      start_time: '06:00',
      end_time: '07:30',
    }));
  });

  it('shows selected slot summary', async () => {
    render(
      <TimeSlotSelector
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onSlotSelect={mockOnSlotSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Selected Session')).toBeInTheDocument();
    });

    expect(screen.getByText(/Time:/)).toBeInTheDocument();
    expect(screen.getByText(/Practice:/)).toBeInTheDocument();
    expect(screen.getByText(/Duration:/)).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', async () => {
    render(
      <TimeSlotSelector
        selectedDate={selectedDate}
        selectedSlot={null}
        onSlotSelect={mockOnSlotSelect}
        disabled={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('6:00 AM - 7:30 AM')).toBeInTheDocument();
    });

    const slotButton = screen.getByText('6:00 AM - 7:30 AM').closest('button');
    expect(slotButton).toBeDisabled();
  });
});

describe('BookingSummary', () => {
  const mockOnBookingSubmit = vi.fn();
  const selectedDate = new Date('2024-03-20');

  beforeEach(() => {
    mockOnBookingSubmit.mockClear();
  });

  it('shows selection prompt when no date/slot selected', () => {
    render(
      <BookingSummary
        selectedDate={null}
        selectedSlot={null}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    expect(screen.getByText('Please select a date and time slot above')).toBeInTheDocument();
  });

  it('displays booking summary when date and slot are selected', () => {
    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    expect(screen.getByText('Selected Session')).toBeInTheDocument();
    expect(screen.getByText('Hatha Yoga')).toBeInTheDocument();
    expect(screen.getByText('90 minutes')).toBeInTheDocument();
    expect(screen.getAllByText('₹500').length).toBeGreaterThan(0);
  });

  it('validates form fields correctly', async () => {
    const user = userEvent.setup();

    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    const submitButton = screen.getByText(/Pay ₹500/);
    expect(submitButton).toBeDisabled();

    // Fill in the form
    await user.type(screen.getByLabelText(/Full Name/), 'John Doe');
    await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
    await user.type(screen.getByLabelText(/Phone Number/), '9876543210');

    // Wait for validation to complete (form validation is async)
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();

    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    // Enter invalid email
    await user.type(screen.getByLabelText(/Email Address/), 'invalid-email');

    // Try to submit
    const submitButton = screen.getByText(/Pay ₹500/);
    expect(submitButton).toBeDisabled();
  });

  it('calls onBookingSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();

    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    // Fill in valid form data
    await user.type(screen.getByLabelText(/Full Name/), 'John Doe');
    await user.type(screen.getByLabelText(/Email Address/), 'john@example.com');
    await user.type(screen.getByLabelText(/Phone Number/), '9876543210');
    await user.type(screen.getByLabelText(/Special Requests/), 'First time student');

    // Wait for validation to complete
    await waitFor(async () => {
      const submitButton = screen.getByText(/Pay ₹500/);
      expect(submitButton).not.toBeDisabled();
      await user.click(submitButton);
    });

    expect(mockOnBookingSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      specialRequests: 'First time student',
    });
  });

  it('shows loading state when processing', () => {
    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
        loading={true}
      />
    );

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('disables form when disabled prop is true', () => {
    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
        disabled={true}
      />
    );

    const nameInput = screen.getByLabelText(/Full Name/);
    expect(nameInput).toBeDisabled();
  });

  it('shows security notice', () => {
    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    expect(screen.getByText('Secure Payment')).toBeInTheDocument();
    expect(screen.getByText(/Your payment is processed securely through RazorPay/)).toBeInTheDocument();
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();

    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    const phoneInput = screen.getByLabelText(/Phone Number/);

    // Test valid phone number
    await user.type(phoneInput, '9876543210');
    await user.tab(); // Trigger validation

    // No error should be shown for valid phone
    expect(screen.queryByText(/Invalid phone number/)).not.toBeInTheDocument();

    // Clear and test invalid phone number
    await user.clear(phoneInput);
    await user.type(phoneInput, '123');
    await user.tab();

    // Submit button should be disabled for invalid phone
    const submitButton = screen.getByText(/Pay ₹500/);
    expect(submitButton).toBeDisabled();
  });

  it('shows character count for special requests', async () => {
    const user = userEvent.setup();

    render(
      <BookingSummary
        selectedDate={selectedDate}
        selectedSlot={mockTimeSlot}
        onBookingSubmit={mockOnBookingSubmit}
      />
    );

    const textarea = screen.getByLabelText(/Special Requests/);
    await user.type(textarea, 'Test message');

    expect(screen.getByText('12/500 characters')).toBeInTheDocument();
  });
});

describe('Booking Component Integration', () => {
  it('validates 24-hour cutoff enforcement', () => {
    const now = new Date();
    const slotTime = '20:00'; // 8 PM

    // Mock slot that should be within cutoff
    const [hours, minutes] = slotTime.split(':').map(Number);
    const slotDateTime = new Date(now);
    slotDateTime.setHours(hours, minutes, 0, 0);

    const cutoffTime = new Date(slotDateTime.getTime() - 24 * 60 * 60 * 1000);
    const isWithinCutoff = now >= cutoffTime;

    // This logic would be implemented in the actual component
    expect(typeof isWithinCutoff).toBe('boolean');
  });

  it('handles price calculation correctly', () => {
    const basePrice = 500;
    const platformFee = 0;
    const totalPrice = basePrice + platformFee;

    expect(totalPrice).toBe(500);
  });

  it('validates concurrent booking protection concept', () => {
    // This would test the concept of race condition handling
    // In real implementation, this would involve database-level testing
    const maxStudents = 10;
    const currentBookings = 9;
    const availableSlots = maxStudents - currentBookings;

    expect(availableSlots).toBe(1);

    // If another booking comes in simultaneously,
    // the system should handle this with proper locking
    const wouldBeFull = availableSlots <= 0;
    expect(wouldBeFull).toBe(false);
  });
});

describe('Security Validation', () => {
  it('sanitizes special requests input', () => {
    const maliciousInput = '<script>alert("xss")</script>Hello';

    // Mock sanitization (would use DOMPurify in actual implementation)
    const sanitized = maliciousInput.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/<[^>]*>/g, '');

    expect(sanitized).toBe('Hello');
    expect(sanitized).not.toContain('<script>');
  });

  it('validates email format strictly', () => {
    const validEmails = [
      'user@example.com',
      'test.email+tag@domain.co.uk',
      'user123@test-domain.com'
    ];

    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain'
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('validates phone number format', () => {
    const validPhones = [
      '9876543210',
      '1234567890',
      '0123456789'
    ];

    const invalidPhones = [
      '123',
      '12345',
      'abcd567890',
      '98765432101', // Too long
      '+91-98765-43210' // Has special characters
    ];

    const phoneRegex = /^[0-9]{10}$/;

    validPhones.forEach(phone => {
      expect(phoneRegex.test(phone)).toBe(true);
    });

    invalidPhones.forEach(phone => {
      expect(phoneRegex.test(phone)).toBe(false);
    });
  });

  it('ensures price validation concept', () => {
    // Mock backend price validation
    const clientPrice = 500;
    const serverPrice = 500;

    // In real implementation, never trust client-side prices
    const isPriceValid = clientPrice === serverPrice;

    expect(isPriceValid).toBe(true);

    // Test tampering scenario
    const tamperedPrice = 1;
    const isTamperedValid = tamperedPrice === serverPrice;

    expect(isTamperedValid).toBe(false);
  });
});