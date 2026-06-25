// @ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import '@formio/js/dist/formio.full.min.css';
import { useMemo } from 'react';
import { Form } from '@formio/react';

type LmsFormioReadOnlyFormProps = {
  form: Record<string, unknown>;
  submission?: Record<string, unknown>;
  className?: string;
};

export function LmsFormioReadOnlyForm({
  form,
  submission = {},
  className = 'lms-formio-readonly',
}: LmsFormioReadOnlyFormProps) {
  const formOptions = useMemo(
    () => ({
      readOnly: true,
      submitOnEnter: false,
    }),
    [],
  );

  return (
    <div className={className}>
      <Form
        form={form}
        submission={{ data: submission }}
        options={formOptions}
      />
    </div>
  );
}
