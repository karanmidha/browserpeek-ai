import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import TestimonialsPage from '../pages/TestimonialsPage';

// Mock Supabase
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

import { supabase } from '../utils/supabase';
const mockSupabase = supabase as any;

describe('TestimonialsPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock setup
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }),
      insert: vi.fn().mockResolvedValue({ error: null })
    });
  });

  it('should render testimonials page with form', async () => {
    render(<TestimonialsPage />);

    // Basic page rendering
    expect(screen.getByText('Student Testimonials')).toBeInTheDocument();
    expect(screen.getByText('Share Your Experience')).toBeInTheDocument();

    // Form elements should be present
    expect(screen.getByText('Your Name *')).toBeInTheDocument();
    expect(screen.getByText('Your Testimonial *')).toBeInTheDocument();
    expect(screen.getByText('Practice Style')).toBeInTheDocument();
    expect(screen.getByText('Rating *')).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: /Submit Testimonial/ })).toBeInTheDocument();
  });

  it('should include practice style field as required by QA', () => {
    render(<TestimonialsPage />);

    // Verify practice style options are present (as QA confirmed this was missing before)
    expect(screen.getByText('Hatha Yoga')).toBeInTheDocument();
    expect(screen.getByText('Vinyasa Flow')).toBeInTheDocument();
    expect(screen.getByText('Yin Yoga')).toBeInTheDocument();
    expect(screen.getByText('Restorative Yoga')).toBeInTheDocument();
  });

  it('should show character count for testimonial content', async () => {
    const user = userEvent.setup();
    render(<TestimonialsPage />);

    // Should show initial character count
    expect(screen.getByText('0/1000 characters')).toBeInTheDocument();

    // Find textarea by placeholder text and type content
    const textarea = screen.getByPlaceholderText('Share your experience with our yoga practice...');
    await user.type(textarea, 'Great experience!');

    // Should update count
    expect(screen.getByText('17/1000 characters')).toBeInTheDocument();
  });

  it('should handle form submission with database integration', async () => {
    const user = userEvent.setup();
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      }),
      insert: mockInsert
    });

    render(<TestimonialsPage />);

    // Fill form using more specific selectors
    const nameInputs = screen.getAllByDisplayValue('');
    const nameInput = nameInputs.find(input => input.getAttribute('name') === 'name');

    if (nameInput) {
      await user.type(nameInput, 'John Doe');
    }

    const textarea = screen.getByPlaceholderText('Share your experience with our yoga practice...');
    await user.type(textarea, 'Amazing yoga classes! Really helped my flexibility.');

    // Submit form
    await user.click(screen.getByRole('button', { name: /Submit Testimonial/ }));

    // Verify database call was made
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  it('should show success message after submission', async () => {
    const user = userEvent.setup();
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      }),
      insert: mockInsert
    });

    render(<TestimonialsPage />);

    // Fill minimum required fields
    const nameInputs = screen.getAllByDisplayValue('');
    const nameInput = nameInputs.find(input => input.getAttribute('name') === 'name');
    const textarea = screen.getByPlaceholderText('Share your experience with our yoga practice...');

    if (nameInput) {
      await user.type(nameInput, 'Test User');
    }
    await user.type(textarea, 'Great experience with the yoga classes!');

    // Submit
    await user.click(screen.getByRole('button', { name: /Submit Testimonial/ }));

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Thank you for your testimonial!')).toBeInTheDocument();
    });
  });
});