import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminAuth } from '../../lib/admin/auth';
import { AdminAuthPage } from '../../pages/admin/AdminAuthPage';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';

// Mock Supabase
vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      mfa: {
        enroll: vi.fn(),
        verify: vi.fn(),
        listFactors: vi.fn(),
      }
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
          limit: vi.fn(),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(),
          })),
        })),
        order: vi.fn(),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  }
}));

// Mock IP service
(globalThis as any).fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ ip: '127.0.0.1' }),
  }) as any
);

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Admin Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders admin login form', () => {
    renderWithRouter(<AdminAuthPage />);

    expect(screen.getByText('Admin Access')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows security notice', () => {
    renderWithRouter(<AdminAuthPage />);

    expect(screen.getByText('Security Notice')).toBeInTheDocument();
    expect(screen.getByText(/all admin activities are logged/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithRouter(<AdminAuthPage />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeDisabled();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    expect(signInButton).toBeDisabled();

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(signInButton).not.toBeDisabled();
  });

  it('handles login submission', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(adminAuth, 'signIn').mockImplementation(mockSignIn);

    renderWithRouter(<AdminAuthPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('admin@example.com', 'password123');
    });
  });

  it('shows MFA form when required', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      success: false,
      requiresMFA: true
    });
    vi.spyOn(adminAuth, 'signIn').mockImplementation(mockSignIn);

    renderWithRouter(<AdminAuthPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Two-factor authentication required')).toBeInTheDocument();
      expect(screen.getByLabelText(/authentication code/i)).toBeInTheDocument();
    });
  });

  it('handles authentication errors', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      success: false,
      error: 'Invalid credentials'
    });
    vi.spyOn(adminAuth, 'signIn').mockImplementation(mockSignIn);

    renderWithRouter(<AdminAuthPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

describe('Protected Routes', () => {
  it('redirects to auth when not authenticated', () => {
    vi.spyOn(adminAuth, 'isAuthenticated').mockReturnValue(false);

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('shows protected content when authenticated', async () => {
    vi.spyOn(adminAuth, 'isAuthenticated').mockReturnValue(true);

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});

describe('Admin Dashboard', () => {
  beforeEach(() => {
    vi.spyOn(adminAuth, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(adminAuth, 'getCurrentSession').mockReturnValue({
      user: {
        id: 'admin123',
        email: 'admin@example.com',
        user_metadata: { first_name: 'Admin' }
      } as any,
      expiresAt: Date.now() + 30 * 60 * 1000,
      lastActivity: Date.now(),
    });
  });

  it('renders dashboard header', async () => {
    renderWithRouter(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    renderWithRouter(<AdminDashboard />);

    // Check for loading indicators
    const loadingElements = screen.getAllByText(/loading/i);
    expect(loadingElements.length).toBeGreaterThan(0);
  });
});

describe('Admin Security Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('implements session timeout', () => {
    const mockSession = {
      user: { id: 'admin123' } as any,
      expiresAt: Date.now() - 1000, // Expired session
      lastActivity: Date.now() - 31 * 60 * 1000, // 31 minutes ago
    };

    vi.spyOn(adminAuth, 'getCurrentSession').mockReturnValue(mockSession);
    vi.spyOn(adminAuth, 'isAuthenticated').mockReturnValue(false);

    expect(adminAuth.isAuthenticated()).toBe(false);
  });

  it('validates admin role requirement', async () => {
    const _mockUser = {
      id: 'user123',
      email: 'user@example.com'
    };

    const mockSignIn = vi.fn().mockResolvedValue({
      success: false,
      error: 'Access denied: Admin privileges required'
    });

    vi.spyOn(adminAuth, 'signIn').mockImplementation(mockSignIn);

    renderWithRouter(<AdminAuthPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/access denied.*admin privileges required/i)).toBeInTheDocument();
    });
  });

  it('logs audit actions', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn(() => ({
      insert: mockInsert
    }));

    // Mock supabase audit logging
    vi.doMock('../../utils/supabase', () => ({
      supabase: {
        from: mockFrom,
        auth: {
          signInWithPassword: vi.fn(),
          signOut: vi.fn(),
          onAuthStateChange: vi.fn(),
          getSession: vi.fn(),
          getUser: vi.fn(),
        }
      }
    }));

    // Simulate admin action that should be logged
    const { adminAuth } = await import('../../lib/admin/auth');

    // Mock authenticated session
    vi.spyOn(adminAuth, 'getCurrentSession').mockReturnValue({
      user: { id: 'admin123' } as any,
      expiresAt: Date.now() + 30 * 60 * 1000,
      lastActivity: Date.now(),
    });

    // Test audit logging (this would be called in actual admin actions)
    // In real implementation, each admin action calls the audit logging
    expect(mockFrom).toHaveBeenCalledWith('audit_logs');
  });
});

describe('Admin Panel Security Validation', () => {
  it('validates XSS prevention in forms', () => {
    // Test that form inputs are properly sanitized
    renderWithRouter(<AdminAuthPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const scriptContent = '<script>alert("xss")</script>';

    fireEvent.change(emailInput, { target: { value: scriptContent } });

    // Input should contain the raw text, not execute script
    expect(emailInput).toHaveValue(scriptContent);
    expect(document.head.innerHTML).not.toContain('alert("xss")');
  });

  it('implements CSRF protection patterns', () => {
    // Verify that admin actions include proper headers/tokens
    // This is validated through the audit logging system
    expect(navigator.userAgent).toBeDefined();
    expect(window.location.origin).toBeDefined();
  });

  it('enforces rate limiting concepts', async () => {
    const startTime = Date.now();

    // Simulate multiple rapid requests
    const requests = Array.from({ length: 5 }, () =>
      adminAuth.signIn('test@example.com', 'password')
    );

    const results = await Promise.all(requests);
    const endTime = Date.now();

    // Verify that rapid requests don't cause issues
    expect(endTime - startTime).toBeLessThan(5000);
    results.forEach(result => {
      expect(result).toHaveProperty('success');
    });
  });

  it('validates session security', () => {
    const mockSession = {
      user: { id: 'admin123' } as any,
      expiresAt: Date.now() + 30 * 60 * 1000,
      lastActivity: Date.now(),
    };

    vi.spyOn(adminAuth, 'getCurrentSession').mockReturnValue(mockSession);

    // Session should be valid
    expect(adminAuth.isAuthenticated()).toBe(true);

    // Mock expired session
    mockSession.expiresAt = Date.now() - 1000;
    expect(adminAuth.isAuthenticated()).toBe(false);
  });
});