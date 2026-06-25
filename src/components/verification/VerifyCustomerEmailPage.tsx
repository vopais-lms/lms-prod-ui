// @ts-nocheck
import { useSearchParams } from 'react-router-dom';
import { VerificationOtpPage } from './VerificationOtpPage';
import { verificationApi } from '../../apis/verification';

export function VerifyCustomerEmailPage() {
  const [searchParams] = useSearchParams();
  const customerEid = searchParams.get('customer_eid') || '';
  const token = searchParams.get('token') || '';

  return (
    <VerificationOtpPage
      title="Verify Customer Email"
      subtitle="Enter the OTP sent to your email address."
      successMessage="Your email has been verified."
      onSubmit={async (otp) => {
        if (!customerEid || !token) throw new Error('Invalid verification link.');
        await verificationApi.publicVerifyCustomerEmail(customerEid, { otp, token });
      }}
    />
  );
}
