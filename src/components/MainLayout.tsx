import { ReactNode } from 'react';
import { DeploymentInfo } from './DeploymentInfo';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      {children}
      <DeploymentInfo />
    </>
  );
} 