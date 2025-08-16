"use client";

import { useEffect, useState } from "react";

export function useMobileBreak(): boolean {
  const [shouldBreak, setShouldBreak] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const update = () => setShouldBreak(window.innerWidth <= 768);
      update();

      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
  }, []);

  return shouldBreak;
}

// TODO: React to resize
