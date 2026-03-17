import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../pages/HomePage';

// Mock global window scrollTo to prevent errors
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

describe('Homepage Integration Tests', () => {
  describe('Hero Section', () => {
    it('should render hero section with main headline', () => {
      render(<HomePage />);

      expect(screen.getByText('Find Your Inner')).toBeInTheDocument();
      expect(screen.getByText('Peace')).toBeInTheDocument();
    });

    it('should have hero image with correct path', () => {
      render(<HomePage />);

      const heroImage = screen.getByAltText('Yoga instructor in peaceful meditation pose');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute('src', '/hero.png');
    });

    it('should have call-to-action buttons', () => {
      render(<HomePage />);

      expect(screen.getByRole('button', { name: /book your session/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
    });
  });

  describe('Instructor Bio Section', () => {
    it('should display instructor information', () => {
      render(<HomePage />);

      expect(screen.getByText('Meet Your Instructor')).toBeInTheDocument();
      expect(screen.getByText('Priya Sharma, RYT-500')).toBeInTheDocument();
    });

    it('should have instructor photo', () => {
      render(<HomePage />);

      const instructorPhoto = screen.getByAltText('Priya Sharma - Certified Yoga Instructor');
      expect(instructorPhoto).toBeInTheDocument();
      expect(instructorPhoto).toHaveAttribute('src', '/hero.png');
    });

    it('should have social media links', () => {
      render(<HomePage />);

      // Social media links don't have accessible names, so we find them by href
      const links = screen.getAllByRole('link');
      const instagramLink = links.find(link => link.getAttribute('href')?.includes('instagram.com'));
      const facebookLink = links.find(link => link.getAttribute('href')?.includes('facebook.com'));

      expect(instagramLink).toBeTruthy();
      expect(facebookLink).toBeTruthy();
      expect(instagramLink?.getAttribute('href')).toBe('https://instagram.com/omyogvidya');
      expect(facebookLink?.getAttribute('href')).toBe('https://facebook.com/omyogvidya');
    });
  });

  describe('Practice Styles Grid', () => {
    it('should display three practice styles', () => {
      render(<HomePage />);

      expect(screen.getByText('Hatha Yoga')).toBeInTheDocument();
      expect(screen.getByText('Vinyasa Flow')).toBeInTheDocument();
      expect(screen.getByText('Meditation & Mindfulness')).toBeInTheDocument();
    });

    it('should have booking buttons for each style', () => {
      render(<HomePage />);

      expect(screen.getByRole('button', { name: /book hatha session/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /book flow session/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /book meditation session/i })).toBeInTheDocument();
    });

    it('should have descriptions for each practice style', () => {
      render(<HomePage />);

      expect(screen.getByText(/gentle, slow-paced practice/i)).toBeInTheDocument();
      expect(screen.getByText(/dynamic sequences that link movement/i)).toBeInTheDocument();
      expect(screen.getByText(/cultivate inner peace and mental clarity/i)).toBeInTheDocument();
    });
  });

  describe('Testimonials Carousel', () => {
    it('should display testimonial content', () => {
      render(<HomePage />);

      expect(screen.getByText('What Our Students Say')).toBeInTheDocument();
      // Should show at least one testimonial initially
      expect(screen.getByText(/transformed my life/i)).toBeInTheDocument();
    });

    it('should have star ratings', () => {
      render(<HomePage />);

      // Stars are SVG elements, check for 5 star SVGs
      const starSvgs = document.querySelectorAll('svg[viewBox="0 0 20 20"]');
      const starElements = Array.from(starSvgs).filter(svg =>
        svg.querySelector('path[d*="M9.049 2.927"]') // Star path
      );
      expect(starElements.length).toBe(5); // Should have 5 stars for rating
    });

    it('should have navigation dots', () => {
      render(<HomePage />);

      // Find the carousel navigation dots
      const dots = document.querySelectorAll('[class*="w-3 h-3 rounded-full"]');
      expect(dots.length).toBe(3); // Should have 3 testimonials
    });
  });

  describe('CTA Banner Section', () => {
    it('should have call-to-action banner', () => {
      render(<HomePage />);

      expect(screen.getByText('Ready to Transform')).toBeInTheDocument();
      expect(screen.getByText('Your Life?')).toBeInTheDocument();
    });

    it('should display social proof statistics', () => {
      render(<HomePage />);

      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('15+')).toBeInTheDocument();
      expect(screen.getByText('1000+')).toBeInTheDocument();
    });

    it('should have booking button in CTA section', () => {
      render(<HomePage />);

      expect(screen.getByRole('button', { name: /book your first session/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /contact us/i })).toBeInTheDocument();
    });
  });

  describe('Basic Functionality', () => {
    it('should handle carousel navigation clicks', () => {
      render(<HomePage />);

      // Find carousel dots and click them
      const dots = document.querySelectorAll('[class*="w-3 h-3 rounded-full"]');
      if (dots.length > 1) {
        fireEvent.click(dots[1] as Element);
        // Should not crash
        expect(document.body).toBeInTheDocument();
      }
    });

    it('should have proper image loading', () => {
      render(<HomePage />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img.getAttribute('alt')).toBeTruthy();
        expect(img.getAttribute('src')).toBeTruthy();
      });
    });

    it('should have semantic HTML structure', () => {
      render(<HomePage />);

      // Should have sections
      const sections = document.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(3);

      // Should have proper headings
      expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
    });

    it('should render without crashing', () => {
      expect(() => render(<HomePage />)).not.toThrow();
    });
  });
});