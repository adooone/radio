import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export const PageLayout: FC<PageLayoutProps> = ({
  title,
  children,
  className,
  headerRight,
}) => {
  return (
    <div className={clsx('w-full min-h-screen', className)}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-white">{title}</h1>
          {headerRight && <div>{headerRight}</div>}
        </div>
        {children}
      </div>
    </div>
  );
};
