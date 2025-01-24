"use client";

export function isMobile(): boolean {
    if (typeof window === 'undefined') {
        return false
    }

    return window.innerWidth <= 768
}

// TODO: React to resize
