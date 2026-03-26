import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { NavigationItem } from '../types';

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Book Session', href: '/booking' },
  { label: 'Contact', href: '/contact' },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
        mobileMenuButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Trap focus within mobile menu
      const firstFocusableElement = mobileMenuRef.current?.querySelector('button, a') as HTMLElement;
      firstFocusableElement?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-cream-50 text-stone-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-sage-100">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-sage-800 tracking-wide hover:text-sage-600 transition-colors">
              OMYOGVIDYA
            </Link>

            {/* Navigation */}
            <ul className="hidden md:flex space-x-8 text-sm font-medium uppercase tracking-widest text-stone-600">
              <li>
                <Link to="/" className={`hover:text-sage-600 transition-colors ${location.pathname === '/' ? 'text-sage-600' : ''}`}>
                  About
                </Link>
              </li>
              <li>
                <a href="#styles" className="hover:text-sage-600 transition-colors">
                  Styles
                </a>
              </li>
              <li>
                <Link to="/contact" className={`hover:text-sage-600 transition-colors ${location.pathname === '/contact' ? 'text-sage-600' : ''}`}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/booking" className={`hover:text-wood-500 transition-colors ${location.pathname === '/booking' ? 'text-wood-500' : ''}`}>
                  Book a Class
                </Link>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
              ref={mobileMenuButtonRef}
              className="md:hidden p-2 text-stone-600 hover:text-sage-600 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 rounded-md min-h-[44px] min-w-[44px]"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeMobileMenu}
            aria-hidden="true"
          ></div>

          {/* Mobile menu panel */}
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
          >
            <div className="flex items-center justify-between p-4 border-b border-secondary-100">
              <h2 id="mobile-menu-title" className="text-xl font-serif text-secondary-900">Menu</h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-secondary-800 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 rounded-md"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="p-4">
              <ul className="space-y-4">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={`mobile-nav-item ${
                        location.pathname === item.href
                          ? 'bg-secondary-50 text-secondary-600 border-l-4 border-secondary-600'
                          : 'text-secondary-800 hover:bg-secondary-50 hover:text-secondary-600'
                      }`}
                      aria-current={location.pathname === item.href ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-serif mb-4 text-accent-200">OmYogVidya</h3>
              <p className="text-secondary-200 leading-relaxed">
                Authentic yoga practice for mind, body, and spirit.
                Join us on a journey to inner peace and wellness.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-accent-200">Quick Links</h3>
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-secondary-200 hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-accent-200">Contact</h3>
              <div className="space-y-2 text-accent-200">
                <div>📧 info@omyogvidya.com</div>
                <div>📞 +91 98765 43210</div>
                <div>📍 Mumbai, Maharashtra</div>
              </div>
            </div>
          </div>

          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-200">
            <p>&copy; 2026 OmYogVidya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;