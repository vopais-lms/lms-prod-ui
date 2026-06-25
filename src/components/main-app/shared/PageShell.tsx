// @ts-nocheck
import type { ReactNode } from 'react';

export type PageShellBreadcrumb = {
  label: string;
  onClick?: () => void;
};

interface PageShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: PageShellBreadcrumb[];
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <div className="flex items-center flex-wrap gap-2 text-sm text-[#6B7280] mb-2">
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {index > 0 && <span className="text-[#9CA3AF]">&gt;</span>}
                  {crumb.onClick ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="font-medium text-[#2563EB] hover:underline"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="font-medium text-[#374151]">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          ) : null}
          <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
          {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
