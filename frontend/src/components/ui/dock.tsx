'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  AnimatePresence,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/utils';

const DEFAULT_PANEL_HEIGHT = 48;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  panelHeight?: number;
  orientation?: 'horizontal' | 'vertical';
};
type DockItemProps = {
  className?: string;
  children: React.ReactNode;
};
type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};
type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DocContextType = {
  // Simplified context
};
type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  panelHeight = DEFAULT_PANEL_HEIGHT,
  orientation = 'horizontal',
}: DockProps) {
  return (
    <div className={cn('flex max-w-full', orientation === 'vertical' ? 'items-center h-full' : 'items-end')}>
      <div
        className={cn(
          'mx-auto flex w-fit gap-4 rounded-2xl px-4',
          orientation === 'vertical' ? 'flex-col py-4' : 'py-2',
          className
        )}
        style={orientation === 'horizontal' ? { height: panelHeight } : undefined}
        role='toolbar'
        aria-label='Application dock'
        aria-orientation={orientation}
      >
        <DockProvider value={{}}>
          {children}
        </DockProvider>
      </div>
    </div>
  );
}

function DockItem({ children, className }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  return (
    <div
      ref={ref}
      onMouseEnter={() => isHovered.set(1)}
      onMouseLeave={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative inline-flex items-center justify-center w-10 h-10',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { isHovered })
      )}
    </div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  // Return null to not display any labels
  return null;
}

function DockLabelVertical({ children, className, ...rest }: DockLabelProps) {
  // Return null to not display any labels
  return null;
}

function DockIcon({ children, className }: DockIconProps) {
  return (
    <div
      className={cn('flex items-center justify-center w-5 h-5', className)}
    >
      {children}
    </div>
  );
}

export {
  Dock,
  DockItem,
  DockLabel,
  DockLabelVertical,
  DockIcon,
};
