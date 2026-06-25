// @ts-nocheck
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './main-app/original/sidebar';
import type { UserRole } from './main-app/original/sidebar';
import { GlobalHeader } from './main-app/original/global-header';
import { UniversalSearch } from './main-app/original/universal-search';
import { ExecutiveCommand } from './main-app/original/executive-command';
import { LoanOfficerWorkQueue } from './main-app/original/loan-officer-workqueue';
import { PortfolioView } from './main-app/original/portfolio-view';
import { ActionsManagement } from './main-app/original/actions-management';
import { RiskManagement } from './main-app/original/risk-management';

// New CRUD pages
import { EmployeesPage } from './main-app/pages/EmployeesPage';
import { DesignationsPage } from './main-app/pages/DesignationsPage';
import { BranchesPage } from './main-app/pages/BranchesPage';
import { ProfilesPage } from './main-app/pages/ProfilesPage';
import { CustomersPage } from './main-app/pages/CustomersPage';
import { CustomerKycPage } from './main-app/pages/CustomerKycPage';
import { LoanTypesPage } from './main-app/pages/LoanTypesPage';
import { LoanTypeDetailPage } from './main-app/pages/LoanTypeDetailPage';
import { LoanApplicationsPage } from './main-app/pages/LoanApplicationsPage';
import { LoanApplicationCreatePage } from './main-app/pages/LoanApplicationCreatePage';
import { LoanApplicationDetailPage } from './main-app/pages/LoanApplicationDetailPage';
import { MoratoriumRequestCreatePage } from './main-app/pages/MoratoriumRequestCreatePage';
import { MoratoriumRequestDetailPage } from './main-app/pages/MoratoriumRequestDetailPage';
import { DisbursementRequestCreatePage } from './main-app/pages/DisbursementRequestCreatePage';
import { DisbursementRequestDetailPage } from './main-app/pages/DisbursementRequestDetailPage';
import { LoanCollectionCreatePage } from './main-app/pages/LoanCollectionCreatePage';
import { LoanCollectionDetailPage } from './main-app/pages/LoanCollectionDetailPage';
import { RepaymentsPage } from './main-app/pages/RepaymentsPage';
import { clearSession, fetchAndStoreMenuItems, getDefaultAppRoute, getStoredMenuItems } from '../utils/authSession';
import type { MenuItem } from '../apis/types';

export function MainAppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>('loan_officer');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredMenuItems());

  // Check auth and load menu
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const isMockToken = !token || token.startsWith('mock-') || token === 'dev-bypass-token';
    if (isMockToken) {
      clearSession();
      navigate('/login', { replace: true });
      return;
    }

    const loadMenu = async () => {
      const cached = getStoredMenuItems();
      if (cached.length > 0) {
        setMenuItems(cached);
        return;
      }

      try {
        const items = await fetchAndStoreMenuItems();
        setMenuItems(items);
      } catch (err) {
        console.error('Failed to load menu items', err);
      }
    };

    loadMenu();
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getUserName = (role: UserRole) => {
    switch (role) {
      case 'md':
        return 'Vikram S.';
      case 'super_admin':
        return 'Admin User';
      case 'branch_manager':
        return 'Manager User';
      case 'loan_officer':
      default:
        return 'Rajesh K.';
    }
  };

  const getUserRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'md':
        return 'MD';
      case 'super_admin':
        return 'Super Admin';
      case 'branch_manager':
        return 'Branch Manager';
      case 'loan_officer':
      default:
        return 'Loan Officer';
    }
  };

  const handleNavigate = (route: string) => {
    navigate(`/app${route}`);
  };

  // Get current route relative to /app for sidebar highlighting
  const currentRoute = location.pathname.replace('/app', '') || '/workqueue';

  const handleLogout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  /** Placeholder page for routes under construction */
  const PlaceholderPage = () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-[#111827]">
          {currentRoute.slice(1).charAt(0).toUpperCase() + currentRoute.slice(2)}
        </h2>
        <p className="text-[#6B7280]">This module is under construction</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)]">
      <Sidebar
        currentRoute={currentRoute}
        userRole={userRole}
        collapsed={sidebarCollapsed}
        onNavigate={handleNavigate}
        menuItems={menuItems}
      />

      <div
        className="transition-all duration-200"
        style={{
          marginLeft: sidebarCollapsed ? '64px' : '240px',
          paddingTop: '56px',
        }}
      >
        <GlobalHeader
          userRole={getUserRoleLabel(userRole)}
          userName={getUserName(userRole)}
          branch={userRole === 'loan_officer' ? 'Jaipur' : undefined}
          notificationCount={userRole === 'loan_officer' ? 4 : 3}
          flagCount={userRole === 'loan_officer' ? 2 : 5}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSearchClick={() => setSearchOpen(true)}
          onLogout={handleLogout}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="p-8">
          <Routes>
            <Route index element={<Navigate to={getDefaultAppRoute(menuItems).replace(/^\//, '')} replace />} />
            {/* Existing pages */}
            <Route path="executive" element={<ExecutiveCommand />} />
            <Route path="workqueue" element={<LoanOfficerWorkQueue />} />
            <Route path="portfolio" element={<PortfolioView />} />
            <Route path="actions" element={<ActionsManagement />} />
            <Route path="risk" element={<RiskManagement />} />

            {/* New CRUD pages */}
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="designations" element={<DesignationsPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="branch" element={<BranchesPage />} />
            <Route path="profiles" element={<ProfilesPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="loan-types" element={<LoanTypesPage />} />
            <Route path="loan-types/:loanTypeId" element={<LoanTypeDetailPage />} />
            <Route path="loans" element={<LoanApplicationsPage />} />
            <Route path="loans/new" element={<LoanApplicationCreatePage />} />
            <Route
              path="loans/:eid/moratorium-requests/new"
              element={<MoratoriumRequestCreatePage />}
            />
            <Route
              path="loans/:eid/moratorium-requests/:moratoriumRequestEid"
              element={<MoratoriumRequestDetailPage />}
            />
            <Route
              path="loans/:eid/disbursement-requests/new"
              element={<DisbursementRequestCreatePage />}
            />
            <Route
              path="loans/:eid/disbursement-requests/:disbursementRequestEid"
              element={<DisbursementRequestDetailPage />}
            />
            <Route
              path="loans/:eid/collections/new"
              element={<LoanCollectionCreatePage />}
            />
            <Route
              path="loans/:eid/collections/:collectionId"
              element={<LoanCollectionDetailPage />}
            />
            <Route path="loans/:eid" element={<LoanApplicationDetailPage />} />
            <Route path="repayments" element={<RepaymentsPage />} />
            <Route path="tenant-settings" element={<PlaceholderPage />} />
            <Route path="customer-kyc/:customerEid" element={<CustomerKycPage />} />

            {/* Catch-all placeholder */}
            <Route path="*" element={<PlaceholderPage />} />
          </Routes>
        </main>
      </div>

      <UniversalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        userRole={getUserRoleLabel(userRole)}
      />

    </div>
  );
}