import { useState, useEffect } from 'react';

interface DeploymentData {
  id: string;
  timestamp: string;
  version: string;
}

export function DeploymentInfo() {
  // Display Beta Version 1 indicator
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-md px-3 py-1 text-xs font-medium text-primary shadow-sm">
      Beta Version 1
    </div>
  );
} 