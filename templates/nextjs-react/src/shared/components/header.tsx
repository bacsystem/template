import * as React from 'react';

export interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-input px-6 py-4">
      {title ? <h1 className="text-lg font-semibold">{title}</h1> : null}
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
