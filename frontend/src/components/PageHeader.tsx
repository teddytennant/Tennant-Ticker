import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="pro-heading">{title}</h1>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Beta Version 1</span>
          </div>
          {description && <p className="pro-subheading">{description}</p>}
        </div>
        {children && (
          <div className="flex items-center gap-3 mt-2 md:mt-0">
            {children}
          </div>
        )}
      </div>
      <div className="pro-divider mt-6"></div>
    </div>
  );
} 