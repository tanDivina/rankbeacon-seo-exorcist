/**
 * Accessibility Utilities for RankBeacon SEO Exorcist
 * Task 10.3: Ensure WCAG 2.1 AA compliance and optimal UX
 */

/**
 * ARIA Labels for Spooky UI Elements
 */
export const ariaLabels = {
  // Entity types
  ghost: 'Ghost entity - 404 error or broken link',
  zombie: 'Zombie entity - Orphaned page with no internal links',
  monster: 'Monster entity - Competitor threat',
  specter: 'Specter entity - Missing or invalid schema markup',
  phantom: 'Phantom entity - Content gap opportunity',
  
  // Actions
  exorcise: 'Perform exorcism to fix this SEO issue',
  analyze: 'Analyze website for SEO issues',
  predict: 'Predict future ranking changes',
  monitor: 'Monitor competitor activity',
  
  // Severity levels
  critical: 'Critical severity - Immediate action required',
  high: 'High severity - Important issue to address',
  medium: 'Medium severity - Optimization opportunity',
  low: 'Low severity - Minor improvement suggestion',
  
  // Dashboard elements
  hauntingScore: 'Haunting score - Overall SEO health (0-100, lower is better)',
  graveyard: 'Graveyard dashboard - Visual representation of SEO issues',
  tombstone: 'Tombstone metric - Key performance indicator',
};

/**
 * Keyboard Navigation Support
 */
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = 0;
  
  constructor(containerSelector: string) {
    this.initializeFocusableElements(containerSelector);
    this.setupKeyboardListeners();
  }
  
  private initializeFocusableElements(containerSelector: string) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    // Get all focusable elements
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }
  
  private setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      // Tab navigation
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
      
      // Arrow key navigation for custom components
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this.handleArrowNavigation(e);
      }
      
      // Escape key to close modals/dialogs
      if (e.key === 'Escape') {
        this.handleEscape();
      }
      
      // Enter/Space for activation
      if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivation(e);
      }
    });
  }
  
  private handleTabNavigation(e: KeyboardEvent) {
    // Let browser handle default tab behavior
    // This is just for tracking
    if (e.shiftKey) {
      this.currentIndex = Math.max(0, this.currentIndex - 1);
    } else {
      this.currentIndex = Math.min(this.focusableElements.length - 1, this.currentIndex + 1);
    }
  }
  
  private handleArrowNavigation(e: KeyboardEvent) {
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement || !activeElement.hasAttribute('role')) return;
    
    e.preventDefault();
    
    if (e.key === 'ArrowDown') {
      this.focusNext();
    } else {
      this.focusPrevious();
    }
  }
  
  private handleEscape() {
    // Close any open modals or dialogs
    const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
    modals.forEach(modal => {
      const closeButton = modal.querySelector('[aria-label*="close"]') as HTMLElement;
      closeButton?.click();
    });
  }
  
  private handleActivation(e: KeyboardEvent) {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.hasAttribute('role')) {
      const role = activeElement.getAttribute('role');
      if (role === 'button' && !activeElement.hasAttribute('disabled')) {
        e.preventDefault();
        activeElement.click();
      }
    }
  }
  
  focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }
  
  focusPrevious() {
    this.currentIndex = (this.currentIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
    this.focusableElements[this.currentIndex]?.focus();
  }
  
  focusFirst() {
    this.currentIndex = 0;
    this.focusableElements[0]?.focus();
  }
}

/**
 * Screen Reader Announcements
 */
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null;
  
  constructor() {
    this.createLiveRegion();
  }
  
  private createLiveRegion() {
    // Create ARIA live region for announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only'; // Visually hidden but accessible
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.liveRegion);
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return;
    
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
  
  announceEntityDetected(entityType: string, count: number) {
    const label = ariaLabels[entityType as keyof typeof ariaLabels] || entityType;
    this.announce(`${count} ${label}${count !== 1 ? 's' : ''} detected`);
  }
  
  announceExorcismComplete(entityType: string) {
    this.announce(`Exorcism complete for ${entityType} entity`, 'assertive');
  }
  
  announceAnalysisComplete(hauntingScore: number) {
    this.announce(`Analysis complete. Haunting score: ${hauntingScore} out of 100`);
  }
}

/**
 * Color Contrast Checker (WCAG 2.1 AA compliance)
 */
export class ColorContrastChecker {
  /**
   * Calculate relative luminance of a color
   */
  private getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  /**
   * Check if contrast ratio meets WCAG AA standards
   */
  meetsWCAG_AA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
  
  /**
   * Check if contrast ratio meets WCAG AAA standards
   */
  meetsWCAG_AAA(foreground: string, background: string, isLargeText = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

/**
 * Focus Management for Modals and Dialogs
 */
export class FocusTrap {
  private focusableElements: HTMLElement[] = [];
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;
  private previouslyFocused: HTMLElement | null = null;
  
  constructor(private container: HTMLElement) {
    this.previouslyFocused = document.activeElement as HTMLElement;
    this.updateFocusableElements();
  }
  
  private updateFocusableElements() {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[];
    
    this.firstFocusable = this.focusableElements[0] || null;
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1] || null;
  }
  
  activate() {
    this.firstFocusable?.focus();
    
    this.container.addEventListener('keydown', this.handleKeyDown);
  }
  
  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.previouslyFocused?.focus();
  }
  
  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable) {
        e.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable) {
        e.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };
}

/**
 * Reduced Motion Support
 */
export class ReducedMotionManager {
  private prefersReducedMotion: boolean;
  
  constructor() {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.setupMediaQueryListener();
  }
  
  private setupMediaQueryListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      this.updateAnimations();
    });
  }
  
  shouldReduceMotion(): boolean {
    return this.prefersReducedMotion;
  }
  
  private updateAnimations() {
    if (this.prefersReducedMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }
  
  getAnimationDuration(defaultDuration: number): number {
    return this.prefersReducedMotion ? 0 : defaultDuration;
  }
}

/**
 * Touch Target Size Validator (44x44px minimum)
 */
export class TouchTargetValidator {
  private minSize = 44; // pixels
  
  validateElement(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width >= this.minSize && rect.height >= this.minSize;
  }
  
  validateAllInteractiveElements(): { valid: number; invalid: number; elements: HTMLElement[] } {
    const selector = 'button, [href], input[type="button"], input[type="submit"]';
    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    
    const invalid = elements.filter(el => !this.validateElement(el));
    
    return {
      valid: elements.length - invalid.length,
      invalid: invalid.length,
      elements: invalid
    };
  }
}

/**
 * Semantic HTML Validator
 */
export class SemanticHTMLValidator {
  validateLandmarks(): string[] {
    const issues: string[] = [];
    
    // Check for main landmark
    if (!document.querySelector('main')) {
      issues.push('Missing <main> landmark');
    }
    
    // Check for navigation
    if (!document.querySelector('nav')) {
      issues.push('Missing <nav> landmark');
    }
    
    // Check for proper heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    if (headings.length === 0) {
      issues.push('No headings found');
    }
    
    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count === 0) {
      issues.push('Missing <h1> heading');
    } else if (h1Count > 1) {
      issues.push('Multiple <h1> headings found (should be one per page)');
    }
    
    return issues;
  }
  
  validateImages(): string[] {
    const issues: string[] = [];
    const images = Array.from(document.querySelectorAll('img'));
    
    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        issues.push(`Image ${index + 1} missing alt attribute`);
      }
    });
    
    return issues;
  }
  
  validateForms(): string[] {
    const issues: string[] = [];
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`);
        if (!label) {
          issues.push(`Input ${index + 1} (id: ${id}) missing associated label`);
        }
      } else {
        issues.push(`Input ${index + 1} missing id attribute for label association`);
      }
    });
    
    return issues;
  }
}

// Export singleton instances
export const screenReader = new ScreenReaderAnnouncer();
export const contrastChecker = new ColorContrastChecker();
export const reducedMotion = new ReducedMotionManager();
export const touchTargetValidator = new TouchTargetValidator();
export const semanticValidator = new SemanticHTMLValidator();
