import React from 'react';
import { cn } from '../../lib/utils';

type MinimalDockProps = {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

type MinimalDockItemProps = {
  className?: string;
  children: React.ReactNode;
};

type MinimalDockIconProps = {
  className?: string;
  children: React.ReactNode;
};

export function MinimalDock({
  children,
  className,
  orientation = 'vertical',
}: MinimalDockProps) {
  return (
    <div className={cn('flex max-w-full', orientation === 'vertical' ? 'items-center h-full' : 'items-end')}>
      <div
        className={cn(
          'mx-auto flex w-fit gap-3 rounded-2xl px-3',
          orientation === 'vertical' ? 'flex-col py-3' : 'py-2',
          className
        )}
        role='toolbar'
        aria-label='Application dock'
        aria-orientation={orientation}
      >
        {children}
      </div>
    </div>
  );
}

export function MinimalDockItem({ children, className }: MinimalDockItemProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center w-8 h-8',
        className
      )}
      tabIndex={0}
      role='button'
    >
      {children}
    </div>
  );
}

export function MinimalDockIcon({ children, className }: MinimalDockIconProps) {
  return (
    <div
      className={cn('flex items-center justify-center w-4 h-4', className)}
    >
      {children}
    </div>
  );
} 