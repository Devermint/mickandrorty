"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ViewTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This effect will run whenever the pathname or search params change
    if (typeof document !== "undefined" && document.startViewTransition) {
      // Set the view-transition-name on the html element
      document.documentElement.style.viewTransitionName = "root";

      // Start the view transition
      document
        .startViewTransition(() => {
          // The actual transition happens automatically
        })
        .finished.then(() => {
          // Remove the view-transition-name after the transition
          document.documentElement.style.viewTransitionName = "";
        });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
