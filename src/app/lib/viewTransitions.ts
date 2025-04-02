"use client";

/**
 * Utility functions for View Transitions API
 */

type TransitionType = "fade" | "slide" | "zoom" | "none";

/**
 * Starts a view transition with the specified type
 * @param type The type of transition to use
 * @param callback Optional callback to execute during the transition
 */
export function startViewTransition(
  type: TransitionType = "fade",
  callback?: () => void
) {
  console.log('startViewTransition called with type:', type);
  console.log('document.startViewTransition exists:', typeof document !== 'undefined' && !!document.startViewTransition);
  
  if (typeof document !== "undefined" && document.startViewTransition) {
    // Apply the appropriate CSS class based on transition type
    document.documentElement.classList.add(`view-transition-${type}`);
    console.log('Added class:', `view-transition-${type}`);
    
    try {
      // Set the view-transition-name on the html element
      document.documentElement.style.viewTransitionName = 'root';
      
      // Start the view transition
      const transition = document.startViewTransition(() => {
        console.log('View transition callback executed');
        if (callback) callback();
      });
      
      // Clean up the CSS class after the transition completes
      transition.finished.then(() => {
        console.log('View transition finished');
        document.documentElement.classList.remove(`view-transition-${type}`);
        // Remove the view-transition-name after the transition
        document.documentElement.style.viewTransitionName = '';
      });
      
      return transition;
    } catch (error) {
      console.error('Error starting view transition:', error);
      // Fallback for browsers that don't support View Transitions API
      if (callback) callback();
      return null;
    }
  } else {
    console.log('View Transitions API not supported, using fallback');
    // Fallback for browsers that don't support View Transitions API
    if (callback) callback();
    return null;
  }
}

/**
 * Checks if the View Transitions API is supported in the current browser
 */
export function isViewTransitionsSupported(): boolean {
  const supported = typeof document !== "undefined" && !!document.startViewTransition;
  console.log('isViewTransitionsSupported:', supported);
  return supported;
}

/**
 * Applies a CSS class to the body for polyfill fallback
 * @param type The type of transition to use
 */
export function applyPolyfillTransition(type: TransitionType): void {
  console.log('applyPolyfillTransition called with type:', type);
  
  if (typeof document !== "undefined") {
    document.body.classList.add(`polyfill-transition-${type}`);
    console.log('Added polyfill class:', `polyfill-transition-${type}`);
    
    setTimeout(() => {
      document.body.classList.remove(`polyfill-transition-${type}`);
      console.log('Removed polyfill class:', `polyfill-transition-${type}`);
    }, 500); // Match the duration in CSS
  }
} 