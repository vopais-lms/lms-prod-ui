// @ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import '@formio/js/dist/formio.full.min.css';
import { useMemo } from 'react';
import { Form } from '@formio/react';
import { presentPanelsAsWizard } from '../../../utils/lmsFormioRuntime';

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
  const wizardForm = useMemo(() => presentPanelsAsWizard(form), [form]);

  return (
    <div className={className}>
      <Form
        form={wizardForm}
        submission={{ data: submission }}
        options={formOptions}
      />
    </div>
  );
}
