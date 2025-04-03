import React from 'react';
import { Menu } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

export function SidebarToggle() {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="pro-icon-container lg:hidden"
      aria-label="Toggle sidebar"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
} 