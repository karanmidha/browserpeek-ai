import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { NavigationItem } from '../types';

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Book Session', href: '/booking' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact', href: '/contact' },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-primary-200">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-serif text-secondary-900 hover:text-secondary-700 transition-colors">
              OmYogVidya
            </Link>

            {/* Navigation */}
            <ul className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`font-medium transition-colors ${
                      location.pathname === item.href
                        ? 'text-secondary-600'
                        : 'text-secondary-800 hover:text-secondary-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-secondary-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

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
              <h3 className="text-xl font-serif mb-4">OmYogVidya</h3>
              <p className="text-secondary-200 leading-relaxed">
                Authentic yoga practice for mind, body, and spirit.
                Join us on a journey to inner peace and wellness.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
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
              <h3 className="text-lg font-medium mb-4">Contact</h3>
              <div className="space-y-2 text-secondary-200">
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