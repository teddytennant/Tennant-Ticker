/// <reference types="vite/client" />

// Extend the global Window interface for custom properties
// Make properties non-optional as they are initialized in App.tsx
interface Window {
  __LAST_NAVIGATION_TIME: number;
  __NAVIGATION_COUNT: number;
}
