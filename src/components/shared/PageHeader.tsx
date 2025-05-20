import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  actionButton?: ReactNode;
}

export function PageHeader({ title, actionButton }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
