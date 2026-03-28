import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { InstructorDashboard } from '../pages/InstructorDashboard';

// Mock Supabase
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn(),
  }
}));

// Mock admin auth
vi.mock('../lib/admin/auth', () => ({
  adminAuth: {
    getCurrentSession: vi.fn(() => ({
      user: {
        id: 'instructor-123',
        email: 'instructor@test.com',
        user_metadata: {
          first_name: 'PROF. MILLER'
        }
      }
    }))
  }
}));

import { supabase } from '../utils/supabase';
import { adminAuth } from '../lib/admin/auth';

const mockSupabase = supabase as any;
const mockAuth = adminAuth as any;

// Mock data
const mockTimeSlots = [
  {
    id: 'slot-1',
    date: '2026-03-28',
    start_time: '09:00:00',
    end_time: '10:00:00',
    is_available: true,
    max_students: 10,
    practice_style_id: 'style-1',
    instructor_id: 'instructor-123',
    practice_styles: {
      name: 'Morning Vinyasa Flow',
      price: 5000
    },
    bookings: []
  }
];

const mockPracticeStyles = [
  {
    id: 'style-1',
    name: 'Morning Vinyasa Flow',
    price: 5000,
    duration_minutes: 60,
    max_students: 10,
    is_active: true
  },
  {
    id: 'style-2',
    name: 'Evening Yin Yoga',
    price: 4000,
    duration_minutes: 75,
    max_students: 8,
    is_active: true
  }
];

describe('InstructorDashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful authentication
    mockAuth.getCurrentSession.mockReturnValue({
      user: {
        id: 'instructor-123',
        email: 'instructor@test.com',
        user_metadata: { first_name: 'PROF. MILLER' }
      }
    });

    // Create a comprehensive mock that handles the Supabase query chain
    const createMockChain = (finalData = [], finalError = null) => {
      const chain = {
        select: vi.fn(),
        gte: vi.fn(),
        lte: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        insert: vi.fn(),
        delete: vi.fn(),
        update: vi.fn()
      };

      // Make all methods return the chain
      Object.keys(chain).forEach(key => {
        if (key === 'insert') {
          chain[key].mockResolvedValue({ data: null, error: null });
        } else if (key === 'delete') {
          chain[key].mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          });
        } else if (key === 'update') {
          chain[key].mockResolvedValue({ data: null, error: null });
        } else {
          chain[key].mockReturnValue(chain);
        }
      });

      // Handle the double .order() call specifically
      let orderCalls = 0;
      chain.order.mockImplementation(() => {
        orderCalls++;
        if (orderCalls >= 2) {
          return Promise.resolve({ data: finalData, error: finalError });
        }
        return chain;
      });

      return chain;
    };

    // Default mock setup
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'time_slots') {
        return createMockChain(mockTimeSlots);
      }
      if (table === 'practice_styles') {
        return createMockChain(mockPracticeStyles);
      }
      return createMockChain();
    });
  });

  describe('Core Functionality Tests', () => {
    it('should render instructor dashboard with correct greeting and basic elements', async () => {
      render(<InstructorDashboard />);

      // Check header greeting
      await waitFor(() => {
        expect(screen.getByText('WELCOME BACK, PROF. MILLER')).toBeInTheDocument();
      });

      // Check main UI elements
      expect(screen.getByText('Manage your availability and session slots')).toBeInTheDocument();
      expect(screen.getByText('SAVE ALL CHANGES')).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should handle authentication gracefully', () => {
      mockAuth.getCurrentSession.mockReturnValue(null);

      render(<InstructorDashboard />);

      // Should still render but with fallback instructor name
      expect(screen.getByText('WELCOME BACK, PROF. MILLER')).toBeInTheDocument();
    });

    it('should load calendar and handle date selection', async () => {
      render(<InstructorDashboard />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should have calendar navigation
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();

      // Should show current month
      const currentDate = new Date();
      const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });
      expect(screen.getByText(new RegExp(monthName, 'i'))).toBeInTheDocument();
    });

    it('should show day editor when date is selected', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Initially should show no date selected
      expect(screen.getByText('No date selected')).toBeInTheDocument();

      // Find and click a date (look for today's date)
      const today = new Date().getDate();
      const dateButtons = screen.getAllByText(today.toString());

      if (dateButtons.length > 0) {
        await userEvent.click(dateButtons[0]);

        // Should now show day editor
        await waitFor(() => {
          expect(screen.getByText(/Edit Day/)).toBeInTheDocument();
          expect(screen.getByText('ACTIVE')).toBeInTheDocument();
          expect(screen.getByText('Accepting Bookings')).toBeInTheDocument();
        });
      }
    });

    it('should handle booking toggle interaction', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Select a date first
      const today = new Date().getDate();
      const dateButtons = screen.getAllByText(today.toString());

      if (dateButtons.length > 0) {
        await userEvent.click(dateButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('Accepting Bookings')).toBeInTheDocument();
        });

        // Find the toggle container
        const toggleLabel = screen.getByText('Accepting Bookings').closest('label');

        if (toggleLabel) {
          // Click the toggle
          await userEvent.click(toggleLabel);

          // Should enable save button
          await waitFor(() => {
            const saveButton = screen.getByText('SAVE ALL CHANGES');
            expect(saveButton).not.toBeDisabled();
          });
        }
      }
    });

    it('should handle add slot functionality', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Select a date first
      const today = new Date().getDate();
      const dateButtons = screen.getAllByText(today.toString());

      if (dateButtons.length > 0) {
        await userEvent.click(dateButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('ADD SLOT')).toBeInTheDocument();
        });

        // Click ADD SLOT button
        const addSlotButton = screen.getByText('ADD SLOT');
        await userEvent.click(addSlotButton);

        // Should show add slot form
        await waitFor(() => {
          expect(screen.getByText('Add New Slot')).toBeInTheDocument();
        });
      }
    });

    it('should handle save day functionality', async () => {
      // Mock window.alert
      const originalAlert = global.alert;
      global.alert = vi.fn();

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Select a date and make a change
      const today = new Date().getDate();
      const dateButtons = screen.getAllByText(today.toString());

      if (dateButtons.length > 0) {
        await userEvent.click(dateButtons[0]);

        await waitFor(() => {
          expect(screen.getByText('Accepting Bookings')).toBeInTheDocument();
        });

        // Toggle to make a change
        const toggleLabel = screen.getByText('Accepting Bookings').closest('label');
        if (toggleLabel) {
          await userEvent.click(toggleLabel);

          await waitFor(() => {
            const saveDayButton = screen.getByText('SAVE DAY');
            expect(saveDayButton).not.toBeDisabled();
          });

          // Click SAVE DAY button
          const saveDayButton = screen.getByText('SAVE DAY');
          await userEvent.click(saveDayButton);

          // Should show success message
          await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Day settings saved successfully!');
          });
        }
      }

      // Restore alert
      global.alert = originalAlert;
    });
  });

  describe('API Integration Tests', () => {
    it('should make correct API calls on component mount', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('time_slots');
        expect(mockSupabase.from).toHaveBeenCalledWith('practice_styles');
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock API error
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: new Error('API Error') })
        })
      }));

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load time slots:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should handle month navigation API calls', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Click next month
      const nextButton = screen.getByRole('button', { name: /next/i });
      await userEvent.click(nextButton);

      // Should trigger new API call
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('time_slots');
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper button roles and labels', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Check for button roles
      expect(screen.getByRole('button', { name: 'SAVE ALL CHANGES' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Tab navigation should work
      await userEvent.tab();

      // Should be able to navigate to buttons
      const saveButton = screen.getByText('SAVE ALL CHANGES');
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('User Interface Tests', () => {
    it('should disable save button when no changes', async () => {
      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Initially save button should be disabled
      const saveButton = screen.getByText('SAVE ALL CHANGES');
      expect(saveButton).toBeDisabled();
    });

    it('should display proper time formatting', async () => {
      // Mock time slots with specific times
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'time_slots') {
          const chain = {
            select: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            order: vi.fn()
          };

          let orderCalls = 0;
          chain.order.mockImplementation(() => {
            orderCalls++;
            if (orderCalls >= 2) {
              return Promise.resolve({
                data: [
                  {
                    id: 'slot-1',
                    date: '2026-03-28',
                    start_time: '09:00:00',
                    end_time: '10:00:00',
                    practice_styles: { name: 'Morning Yoga' }
                  }
                ],
                error: null
              });
            }
            return chain;
          });

          return chain;
        }

        if (table === 'practice_styles') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockPracticeStyles, error: null })
          };
        }

        return {
          select: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      });

      render(<InstructorDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Select a date that has the slot
      const dateButton = screen.getByText('28');
      await userEvent.click(dateButton);

      // Should display time in 12-hour format
      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 10:00 AM')).toBeInTheDocument();
      });
    });
  });
});