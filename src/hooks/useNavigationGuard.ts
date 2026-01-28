import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to prevent rapid navigation that could cause infinite redirects
 */
export function useNavigationGuard() {
  const navigate = useNavigate();
  const lastNavigationTime = useRef<number>(0);
  const navigationTimeout = useRef<NodeJS.Timeout>();

  const guardedNavigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTime.current;

    // Prevent navigation if less than 1 second has passed
    if (timeSinceLastNavigation < 1000) {
      console.warn('Navigation blocked: too frequent');
      return;
    }

    // Clear any pending navigation
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current);
    }

    // Schedule navigation with a small delay
    navigationTimeout.current = setTimeout(() => {
      lastNavigationTime.current = Date.now();
      navigate(to, options);
    }, 100);
  }, [navigate]);

  return guardedNavigate;
}