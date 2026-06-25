// @ts-nocheck
import { useSearchParams } from 'react-router-dom';
import { VerificationOtpPage } from './VerificationOtpPage';
import { verificationApi } from '../../apis/verification';

export function VerifyCustomerPhonePage() {
  const [searchParams] = useSearchParams();
  const customerEid = searchParams.get('customer_eid') || '';
  const token = searchParams.get('token') || '';

  return (
    <VerificationOtpPage
      title="Verify Customer Phone"
      subtitle="Enter the OTP sent to your phone number."
      successMessage="Your phone number has been verified."
      onSubmit={async (otp) => {
        if (!customerEid || !token) throw new Error('Invalid verification link.');
        await verificationApi.publicVerifyCustomerPhone(customerEid, { otp, token });
      }}
    />
  );
}
