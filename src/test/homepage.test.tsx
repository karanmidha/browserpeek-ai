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

      expect(screen.getByText('Find Your Flow,')).toBeInTheDocument();
      expect(screen.getByText('Reconnect with Self')).toBeInTheDocument();
    });

    it('should have hero image with correct path', () => {
      render(<HomePage />);

      const heroImage = screen.getByAltText('Woman in peaceful meditation pose - yoga practice');
      expect(heroImage).toBeInTheDocument();
      expect(heroImage).toHaveAttribute('src', '/hero.png');
    });

    it('should have call-to-action buttons', () => {
      render(<HomePage />);

      expect(screen.getByText('BOOK YOUR JOURNEY')).toBeInTheDocument();
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

  describe('Our Shared Journey - Testimonials Grid', () => {
    it('should display testimonial content', () => {
      render(<HomePage />);

      expect(screen.getByText('Our Shared Journey')).toBeInTheDocument();
      expect(screen.getByText(/read the stories of transformation and peace/i)).toBeInTheDocument();
      // Should show testimonials from the design
      expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
      expect(screen.getByText('David Miller')).toBeInTheDocument();
      expect(screen.getByText('Elena Kovac')).toBeInTheDocument();
    });

    it('should have star ratings visible', () => {
      render(<HomePage />);

      // Just verify that star characters appear on the page for testimonials
      const pageText = document.body.textContent || '';
      expect(pageText).toContain('★');
      expect(pageText).toContain('☆');
    });

    it('should display testimonial grid layout', () => {
      render(<HomePage />);

      // Check for testimonial cards
      expect(screen.getByText('Member for 2 years')).toBeInTheDocument();
      expect(screen.getByText('Hatha Yoga Student')).toBeInTheDocument();
      expect(screen.getByText('Vinyasa Enthusiast')).toBeInTheDocument();
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
    it('should handle share experience button click', () => {
      render(<HomePage />);

      // Find the "Share Your Experience" button
      const shareButton = screen.getByText('Share Your Experience');
      expect(shareButton).toBeInTheDocument();
      expect(shareButton.closest('a')).toHaveAttribute('href', '/contact');
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