import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach } from 'vitest';
import ContactPage from '../pages/ContactPage';

// Mock Supabase
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

import { supabase } from '../utils/supabase';
const mockSupabase = supabase as any;

describe('ContactPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock setup
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null })
    });
  });

  it('should render contact page with form and information', () => {
    render(<ContactPage />);

    // Basic page rendering
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Send us a Message')).toBeInTheDocument();

    // Form fields
    expect(screen.getByText('Your Name *')).toBeInTheDocument();
    expect(screen.getByText('Email Address *')).toBeInTheDocument();
    expect(screen.getByText('Phone Number (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Subject *')).toBeInTheDocument();
    expect(screen.getByText('Message *')).toBeInTheDocument();

    // Contact information
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText('info@omyogvidya.com')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();

    // Submit button
    expect(screen.getByRole('button', { name: /Send Message/ })).toBeInTheDocument();
  });

  it('should include all subject options', () => {
    render(<ContactPage />);

    // All subject options should be available
    expect(screen.getByText('General Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Class Questions')).toBeInTheDocument();
    expect(screen.getByText('Private Sessions')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should show character count for message field', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Should show initial character count
    expect(screen.getByText('0/2000 characters')).toBeInTheDocument();

    // Find message textarea and type content
    const textarea = screen.getByPlaceholderText('How can we help you?');
    await user.type(textarea, 'Test inquiry message');

    // Should update count
    expect(screen.getByText('20/2000 characters')).toBeInTheDocument();
  });

  it('should handle form submission with database integration', async () => {
    const user = userEvent.setup();
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockReturnValue({
      insert: mockInsert
    });

    render(<ContactPage />);

    // Fill form fields using placeholder text and input names
    const nameInputs = screen.getAllByDisplayValue('');
    const nameInput = nameInputs.find(input => input.getAttribute('name') === 'name');
    const emailInputs = screen.getAllByDisplayValue('');
    const emailInput = emailInputs.find(input => input.getAttribute('name') === 'email');

    if (nameInput && emailInput) {
      await user.type(nameInput, 'Jane Smith');
      await user.type(emailInput, 'jane@example.com');
    }

    // Select subject - find the select element by name attribute
    const selects = screen.getAllByRole('combobox');
    const subjectSelect = selects.find(select => select.getAttribute('name') === 'subject');
    if (subjectSelect) {
      await user.selectOptions(subjectSelect, 'classes');
    }

    // Fill message
    const messageTextarea = screen.getByPlaceholderText('How can we help you?');
    await user.type(messageTextarea, 'I am interested in your yoga classes.');

    // Submit form
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    // Verify database call was made
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  it('should show success message after submission', async () => {
    const user = userEvent.setup();
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from.mockReturnValue({
      insert: mockInsert
    });

    render(<ContactPage />);

    // Fill minimum required fields
    const inputs = screen.getAllByDisplayValue('');
    const nameInput = inputs.find(input => input.getAttribute('name') === 'name');
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email');
    const messageTextarea = screen.getByPlaceholderText('How can we help you?');

    if (nameInput && emailInput) {
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
    }
    await user.type(messageTextarea, 'This is a test contact message.');

    // Submit
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Thank you for your message!')).toBeInTheDocument();
    });
  });

  it('should handle database errors gracefully', async () => {
    const user = userEvent.setup();
    const mockInsert = vi.fn().mockResolvedValue({
      error: { message: 'Connection failed' }
    });

    mockSupabase.from.mockReturnValue({
      insert: mockInsert
    });

    render(<ContactPage />);

    // Fill and submit form
    const inputs = screen.getAllByDisplayValue('');
    const nameInput = inputs.find(input => input.getAttribute('name') === 'name');
    const emailInput = inputs.find(input => input.getAttribute('name') === 'email');
    const messageTextarea = screen.getByPlaceholderText('How can we help you?');

    if (nameInput && emailInput) {
      await user.type(nameInput, 'Test User');
      await user.type(emailInput, 'test@example.com');
    }
    await user.type(messageTextarea, 'Test message');

    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });
});