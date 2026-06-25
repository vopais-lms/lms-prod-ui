// @ts-nocheck
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { CustomerLoginPage } from './components/CustomerLoginPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { NbfcRegisterPage } from './components/NbfcRegisterPage';
import { MainAppShell } from './components/MainAppShell';
import { VerifyTenantPage } from './components/verification/VerifyTenantPage';
import { InternalApproveTenantPage } from './components/verification/InternalApproveTenantPage';
import { VerifyCustomerPhonePage } from './components/verification/VerifyCustomerPhonePage';
import { VerifyCustomerEmailPage } from './components/verification/VerifyCustomerEmailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer-login" element={<CustomerLoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<NbfcRegisterPage />} />
        <Route path="/verify-tenant" element={<VerifyTenantPage />} />
        <Route path="/internal-approve-tenant" element={<InternalApproveTenantPage />} />
        <Route path="/verify-customer-phone" element={<VerifyCustomerPhonePage />} />
        <Route path="/verify-customer-email" element={<VerifyCustomerEmailPage />} />

        {/* Authenticated App Shell */}
        <Route path="/app/*" element={<MainAppShell />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
