"use client";

import { useEffect, useState } from "react";

export function useMobileBreak(): boolean {
    const [shouldBreak, setShouldBreak] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShouldBreak(window.innerWidth <= 768);

            function handleResize() {
                setShouldBreak(window.innerWidth <= 768);
            }

            window.window.addEventListener('resize', handleResize);
        }
    }, []);

    return shouldBreak;
}

// TODO: React to resize
