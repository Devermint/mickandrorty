"use client";

/**
 * A simple polyfill for the View Transitions API
 * This provides a similar experience for browsers that don't support the API natively
 */

// Check if the browser supports the View Transitions API
const isSupported = typeof document !== "undefined" && !!document.startViewTransition;
console.log('Polyfill: Browser supports View Transitions API:', isSupported);

// If not supported, create a polyfill
if (!isSupported && typeof document !== "undefined") {
  console.log('Polyfill: Creating polyfill for View Transitions API');
  
  try {
    // Add the startViewTransition method to the document
    document.startViewTransition = function(callback?: () => void) {
      console.log('Polyfill: startViewTransition called');
      
      // Execute the callback immediately if provided
      if (callback) {
        console.log('Polyfill: Executing callback');
        callback();
      }
      
      // Return a mock transition object with a finished promise
      console.log('Polyfill: Returning mock transition object');
      return {
        finished: Promise.resolve(undefined),
        ready: Promise.resolve(undefined),
        updateCallbackDone: Promise.resolve(undefined),
        skipTransition: () => {},
      } as ViewTransition;
    };
    
    // Add a simple CSS transition to the body
    const style = document.createElement('style');
    style.textContent = `
      body {
        transition: opacity 0.5s ease-in-out;
      }
      body.page-transition {
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
    console.log('Polyfill: Added CSS for view-transition-name');
  } catch (error) {
    console.error('Polyfill: Error creating polyfill:', error);
  }
}

// Export a function to check if we're using the polyfill
export function isUsingPolyfill(): boolean {
  const usingPolyfill = !isSupported;
  console.log('Polyfill: isUsingPolyfill:', usingPolyfill);
  return usingPolyfill;
} 