"use client";

import { useTransitionRouter } from "next-view-transitions";

// Add this at the top of the file to ensure the background color is set
if (typeof document !== "undefined") {
  // Set the root background color
  document.documentElement.style.backgroundColor = "#1D3114";
  // Set the view transition background
  document.documentElement.style.setProperty("--view-transition-background", "#1D3114");

  // Add a style tag to ensure the background color is maintained during transitions
  const style = document.createElement("style");
  style.textContent = `
    ::view-transition-group(root) {
      background-color: #1D3114;
    }
    ::view-transition-old(root),
    ::view-transition-new(root) {
      background-color: #1D3114;
    }
  `;
  document.head.appendChild(style);
}

export const animations = {
  // Slide animations
  slideLeft: () => {
    document.documentElement.animate(
      [
        { opacity: 1, transform: "translate(0, 0)" },
        { opacity: 0, transform: "translate(-100px, 0)" },
      ],
      {
        duration: 400,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        { opacity: 0, transform: "translate(100px, 0)" },
        { opacity: 1, transform: "translate(0, 0)" },
      ],
      {
        duration: 400,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  },

  slideRight: () => {
    document.documentElement.animate(
      [
        { opacity: 1, transform: "translate(0, 0)" },
        { opacity: 0, transform: "translate(100px, 0)" },
      ],
      {
        duration: 400,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        { opacity: 0, transform: "translate(-100px, 0)" },
        { opacity: 1, transform: "translate(0, 0)" },
      ],
      {
        duration: 400,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  },

  // Fade animations
  fadeInOut: () => {
    document.documentElement.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 300,
      easing: "ease",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    });

    document.documentElement.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300,
      easing: "ease",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    });
  },

  // Scale animations
  scaleInOut: () => {
    document.documentElement.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.8)" },
      ],
      {
        duration: 300,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        { opacity: 0, transform: "scale(1.2)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      {
        duration: 300,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  },

  // Rotate animations
  rotateInOut: () => {
    document.documentElement.animate(
      [
        { opacity: 1, transform: "rotate(0deg)" },
        { opacity: 0, transform: "rotate(-180deg)" },
      ],
      {
        duration: 500,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        { opacity: 0, transform: "rotate(180deg)" },
        { opacity: 1, transform: "rotate(0deg)" },
      ],
      {
        duration: 500,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  },

  // Flip animations
  flipInOut: () => {
    document.documentElement.animate(
      [
        { opacity: 1, transform: "perspective(400px) rotateY(0deg)" },
        { opacity: 0, transform: "perspective(400px) rotateY(-90deg)" },
      ],
      {
        duration: 400,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        { opacity: 0, transform: "perspective(400px) rotateY(90deg)" },
        { opacity: 1, transform: "perspective(400px) rotateY(0deg)" },
      ],
      {
        duration: 400,
        easing: "ease",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  },

  // Bounce animations
  bounceInOut: () => {
    document.documentElement.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-20px)" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        fill: "forwards",
        pseudoElement: "::view-transition-old(root)",
      }
    );

    document.documentElement.animate(
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        fill: "forwards",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  },
};

// Example usage in a component:
export function useAnimatedNavigation() {
  const router = useTransitionRouter();

  const navigateWithAnimation = (path: string, animation: keyof typeof animations) => {
    router.push(path, {
      onTransitionReady: animations[animation],
    });
  };

  return navigateWithAnimation;
}
