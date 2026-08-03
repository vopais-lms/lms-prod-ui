// @ts-nocheck
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { PageShell } from '../shared/PageShell';
import { LOAN_TYPES_HUB_SECTIONS } from '../../../constants/loanTypesHubSections';

function activeHubSection(pathname: string) {
  if (pathname.includes('/loan-types/underwriting')) {
    return 'underwriting';
  }
  return 'configurations';
}

export function LoanTypesHubPage() {
  const location = useLocation();
  const active = activeHubSection(location.pathname);
  const activeMeta = LOAN_TYPES_HUB_SECTIONS.find((s) => s.id === active);

  return (
    <PageShell
      title="Loan Types"
      subtitle={
        activeMeta?.description ||
        'Configure loan products and underwriting parameters'
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
        <aside className="space-y-2">
          {LOAN_TYPES_HUB_SECTIONS.map((section) => {
            const isActive = section.id === active;
            return (
              <NavLink
                key={section.id}
                to={section.path}
                end={section.id === 'configurations'}
                className={`block w-full text-left rounded-xl px-4 py-3 border transition-colors ${
                  isActive
                    ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="text-sm font-semibold">{section.label}</div>
                <div className="text-xs mt-1 opacity-80">{section.description}</div>
              </NavLink>
            );
          })}
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </PageShell>
  );
}
