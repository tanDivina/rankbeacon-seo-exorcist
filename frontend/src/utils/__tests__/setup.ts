// Test setup file
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock getBoundingClientRect for touch target validation
HTMLElement.prototype.getBoundingClientRect = vi.fn(function(this: HTMLElement) {
  // Get computed styles to determine size
  const width = parseInt(this.style.width) || 0;
  const height = parseInt(this.style.height) || 0;
  
  return {
    width,
    height,
    top: 0,
    left: 0,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => ({})
  } as DOMRect;
});

// Mock document.body.appendChild to track live regions
const originalAppendChild = document.body.appendChild;
document.body.appendChild = function<T extends Node>(node: T): T {
  const result = originalAppendChild.call(this, node);
  // Trigger any observers or callbacks
  if (node instanceof HTMLElement && node.getAttribute('role') === 'status') {
    // Allow live region to be queryable immediately
    setTimeout(() => {
      // Ensure the element is in the DOM
    }, 0);
  }
  return result;
};
