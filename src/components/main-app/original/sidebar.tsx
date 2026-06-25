// @ts-nocheck
import React from 'react';
import {
  BuildingOffice2Icon,
  ChartPieIcon,
  BuildingOfficeIcon,
  BoltIcon,
  BellIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  PlusCircleIcon,
  BanknotesIcon,
  ArrowPathIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  LockClosedIcon,
  BookOpenIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  PresentationChartBarIcon,
  CogIcon,
  WrenchIcon,
  UserCircleIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import type { MenuItem } from '../../../apis/types';

export type UserRole = 'md' | 'super_admin' | 'branch_manager' | 'loan_officer';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  roles: UserRole[] | ['all'];
  badge?: number;
  phaseLocked?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'building-columns': BuildingOffice2Icon,
  'chart-pie': ChartPieIcon,
  'building-office': BuildingOfficeIcon,
  'bolt': BoltIcon,
  'bell': BellIcon,
  'document-text': DocumentTextIcon,
  'user-group': UserGroupIcon,
  'clipboard-document': ClipboardDocumentIcon,
  'plus-circle': PlusCircleIcon,
  'banknotes': BanknotesIcon,
  'arrow-path': ArrowPathIcon,
  'phone': PhoneIcon,
  'exclamation-triangle': ExclamationTriangleIcon,
  'flag': FlagIcon,
  'lock-closed': LockClosedIcon,
  'book-open': BookOpenIcon,
  'credit-card': CreditCardIcon,
  'chart-bar': ChartBarIcon,
  'clock': ClockIcon,
  'document-chart-bar': DocumentChartBarIcon,
  'magnifying-glass': MagnifyingGlassIcon,
  'presentation-chart-bar': PresentationChartBarIcon,
  'cog': CogIcon,
  'wrench': WrenchIcon,
  'user-circle': UserCircleIcon,
};

const defaultIcon = CircleStackIcon;

export const mapMenuLinkToRoute = (link: string): string => {
  const mappings: Record<string, string> = {
    '/tenant': '/tenant-settings',
    '/user-management-settings': '/profiles',
  };
  return mappings[link] || link;
};

const resolveMenuIcon = (iconName?: string | null) => {
  if (!iconName) return defaultIcon;
  return iconMap[iconName] || defaultIcon;
};

export const navStructure: Record<string, NavGroup> = {
  HOME: {
    title: 'HOME',
    items: [
      { label: 'Dashboard', icon: iconMap['chart-pie'], route: '/dashboard', roles: ['all'] },
      { label: 'Reports', icon: iconMap['document-chart-bar'], route: '/reports', roles: ['all'] },
    ],
  },
  OPERATION: {
    title: 'OPERATION',
    items: [
      { label: 'Loans', icon: iconMap['document-text'], route: '/loans', roles: ['all'] },
      { label: 'Repayments', icon: iconMap['arrow-path'], route: '/repayments', roles: ['super_admin', 'branch_manager', 'loan_officer'] },
      { label: 'Customers', icon: iconMap['user-group'], route: '/customers', roles: ['all'] },
    ],
  },
  APPLICATION_SETTINGS: {
    title: 'APPLICATION SETTINGS',
    items: [
      { label: 'User Management Settings', icon: iconMap['user-circle'], route: '/users', roles: ['all'] },
      { label: 'Profiles', icon: iconMap['user-circle'], route: '/profiles', roles: ['all'] },
      { label: 'Tenant Settings', icon: iconMap['cog'], route: '/tenant-settings', roles: ['all'] },
    ],
  },
  ORGANIZATION: {
    title: 'ORGANIZATION',
    items: [
      { label: 'Employees', icon: iconMap['user-group'], route: '/employees', roles: ['all'] },
      { label: 'Designations', icon: iconMap['clipboard-document'], route: '/designations', roles: ['all'] },
      { label: 'Branches', icon: iconMap['building-office'], route: '/branches', roles: ['all'] },
    ],
  },
  DONT_KNOW_HERE: {
    title: "DON't KNOW HERE",
    items: [
      { label: 'Executive Command', icon: iconMap['building-columns'], route: '/executive', roles: ['md'] },
      { label: 'Portfolio Control', icon: iconMap['chart-pie'], route: '/portfolio', roles: ['super_admin'] },
      { label: 'My Work Queue', icon: iconMap['bolt'], route: '/workqueue', roles: ['loan_officer'], badge: 8 },
      { label: 'Action Center', icon: iconMap['bell'], route: '/actions', roles: ['all'], badge: 12 },
      { label: 'Applications', icon: iconMap['clipboard-document'], route: '/applications', roles: ['super_admin', 'branch_manager', 'loan_officer'], badge: 3 },
      { label: 'Origination', icon: iconMap['plus-circle'], route: '/origination', roles: ['super_admin', 'branch_manager', 'loan_officer'] },
      { label: 'Disbursements', icon: iconMap['banknotes'], route: '/disbursements', roles: ['all'], badge: 2 },
      { label: 'Collections', icon: iconMap['phone'], route: '/collections', roles: ['super_admin', 'branch_manager', 'loan_officer'], badge: 7 },
      { label: 'Risk Monitor', icon: iconMap['exclamation-triangle'], route: '/risk', roles: ['md', 'super_admin', 'branch_manager'] },
      { label: 'Flags & Alerts', icon: iconMap['flag'], route: '/flags', roles: ['all'], badge: 5 },
      { label: 'Collateral', icon: iconMap['lock-closed'], route: '/collateral', roles: ['super_admin', 'branch_manager', 'loan_officer'] },
      { label: 'Accounting', icon: iconMap['book-open'], route: '/accounting', roles: ['md', 'super_admin'] },
      { label: 'Billing & Charges', icon: iconMap['credit-card'], route: '/billing', roles: ['super_admin', 'branch_manager'] },
      { label: 'Profitability', icon: iconMap['chart-bar'], route: '/profitability', roles: ['md', 'super_admin'] },
      { label: 'EOD Processing', icon: iconMap['clock'], route: '/eod', roles: ['super_admin'] },
      { label: 'Regulatory Reports', icon: iconMap['document-chart-bar'], route: '/regulatory', roles: ['md', 'super_admin'], phaseLocked: true },
      { label: 'Audit Trail', icon: iconMap['magnifying-glass'], route: '/audit', roles: ['md', 'super_admin', 'branch_manager'] },
      { label: 'Board Pack', icon: iconMap['presentation-chart-bar'], route: '/boardpack', roles: ['md', 'super_admin'], phaseLocked: true },
      { label: 'Loan Products', icon: iconMap['cog'], route: '/products', roles: ['super_admin'] },
      { label: 'Workflows', icon: iconMap['wrench'], route: '/workflows', roles: ['super_admin'] },
    ],
  },
};

interface SidebarProps {
  currentRoute: string;
  userRole: UserRole;
  collapsed?: boolean;
  onNavigate: (route: string) => void;
  menuItems?: MenuItem[];
}

export function Sidebar({ currentRoute, userRole, collapsed = false, onNavigate, menuItems = [] }: SidebarProps) {
  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (item.roles.includes('all')) return true;
      return item.roles.includes(userRole);
    });
  };

  const dynamicItems = menuItems.map((item) => ({
    label: item.label,
    icon: resolveMenuIcon(item.icon),
    route: mapMenuLinkToRoute(item.link),
  }));

  return (
    <div
      className="fixed left-0 top-0 h-screen bg-[#111827] text-white transition-all duration-200 overflow-y-auto"
      style={{ width: collapsed ? '64px' : '240px' }}
    >
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <h1 className="text-2xl font-bold">{collapsed ? 'A' : 'ADI'}</h1>
      </div>

      <nav className="py-4">
        {dynamicItems.length > 0 ? (
          <div className="mb-6">
            {!collapsed && (
              <h3 className="px-4 mb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                MENU
              </h3>
            )}
            <div className="space-y-1">
              {dynamicItems.map((item) => {
                const isActive = currentRoute === item.route;
                const Icon = item.icon;

                return (
                  <button
                    key={item.route}
                    onClick={() => onNavigate(item.route)}
                    className={`
                      w-full h-11 flex items-center gap-3 px-4 transition-colors relative cursor-pointer
                      ${isActive ? 'bg-[#1F2937] text-white' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2563EB]" />
                    )}
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 text-left text-sm">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          Object.values(navStructure).map((group) => {
          const visibleItems = filterNavItems(group.items);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-6">
              {!collapsed && (
                <h3 className="px-4 mb-2 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = currentRoute === item.route;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.route}
                      onClick={() => onNavigate(item.route)}
                      disabled={item.phaseLocked}
                      className={`
                        w-full h-11 flex items-center gap-3 px-4 transition-colors relative
                        ${isActive ? 'bg-[#1F2937] text-white' : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'}
                        ${item.phaseLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2563EB]" />
                      )}
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-sm">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-[#DC2626] text-white rounded-full">
                              {item.badge}
                            </span>
                          )}
                          {item.phaseLocked && (
                            <LockClosedIcon className="w-3 h-3 text-[#6B7280]" />
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
        )}
      </nav>
    </div>
  );
}

