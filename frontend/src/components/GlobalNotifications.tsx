import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

export function GlobalNotifications() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#2c3440',
          color: '#fff',
          borderRadius: '8px',
        },
      }}
    />
  );
} 