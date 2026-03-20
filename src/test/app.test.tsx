import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock Supabase
vi.mock('../utils/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
  },
}));

// Mock all page components to avoid complex dependencies
vi.mock('../pages/HomePage', () => ({
  default: () => <main><h1>Home Page</h1></main>,
}));

vi.mock('../pages/BookingPage', () => ({
  default: () => <main><h1>Booking Page</h1></main>,
}));


vi.mock('../pages/ContactPage', () => ({
  default: () => <main><h1>Contact Page</h1></main>,
}));

vi.mock('../pages/AdminPage', () => ({
  default: () => <main><h1>Admin Page</h1></main>,
}));

vi.mock('../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>
      <nav>Navigation</nav>
      {children}
    </div>
  ),
}));

describe('App Integration', () => {
  const renderApp = () => {
    return render(<App />);
  };

  it('should render without crashing', () => {
    expect(() => renderApp()).not.toThrow();
  });

  it('should display navigation elements', () => {
    renderApp();

    // Check for common navigation elements that should be present
    expect(document.querySelector('nav')).toBeInTheDocument();
  });

  it('should handle routing without errors', () => {
    renderApp();

    // The app should render without throwing router errors
    expect(screen.getByRole('main') || document.body).toBeInTheDocument();
  });
});