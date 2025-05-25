
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { mockOrganizations } from '@/data/mockData';
import { THEME_PALETTES, type ThemePaletteId } from '@/lib/types';

export function ClientEffects() {
  const { currentUser } = useAuth();

  // Effect for Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => console.log('Service Worker registrado con éxito:', registration))
        .catch((error) => console.error('Error al registrar Service Worker:', error));
    }
  }, []);

  // Effect for Global App Theme (Light/Dark/System)
  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("app-theme");

    const applyTheme = (theme: string | null) => {
      root.classList.remove("light", "dark");
      if (theme === "system" || theme === null) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme(storedTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentTheme = localStorage.getItem("app-theme");
      if (currentTheme === "system" || currentTheme === null) {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Effect for Consortium Theme Palette
  useEffect(() => {
    const root = document.documentElement;
    
    // Function to clear existing palette classes
    const clearPaletteClasses = () => {
      THEME_PALETTES.forEach(p => root.classList.remove(`theme-${p.id}`));
    };

    if (currentUser && currentUser.organizationId) {
      // Attempt to get org's theme from localStorage (set by admin in settings)
      const storedOrgTheme = localStorage.getItem(`org-theme-${currentUser.organizationId}`) as ThemePaletteId | null;
      
      let paletteToApply: ThemePaletteId | undefined = undefined;

      if (storedOrgTheme && THEME_PALETTES.some(p => p.id === storedOrgTheme)) {
        paletteToApply = storedOrgTheme;
      } else {
        // Fallback to mockOrganizations if not in localStorage (e.g., first load)
        const organization = mockOrganizations.find(org => org.id === currentUser.organizationId);
        if (organization && organization.themePalette) {
          paletteToApply = organization.themePalette;
        }
      }
      
      clearPaletteClasses(); // Clear previous before applying new
      if (paletteToApply && paletteToApply !== "default") {
        root.classList.add(`theme-${paletteToApply}`);
      }
    } else {
      // If no user or no org, ensure no specific org theme is applied (revert to default)
      clearPaletteClasses();
    }
  }, [currentUser]);


  return null; // This component does not render any UI
}
