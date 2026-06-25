// @ts-nocheck
import 'bootstrap/dist/css/bootstrap.min.css';
import '@formio/js/dist/formio.full.min.css';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Form } from '@formio/react';
import {
  createRuntimeFormOptions,
  LMS_FORM_AUTOSAVE_DEBOUNCE_MS,
  prepareRuntimeFormSchema,
  type FormUploadContext,
  type LmsFormHandlers,
} from '../../../utils/lmsFormioRuntime';

type LmsFormioFormProps = {
  form: Record<string, unknown>;
  uploadContext: FormUploadContext;
  submission?: Record<string, unknown>;
  className?: string;
  handlers?: LmsFormHandlers;
  onChange?: (submission: Record<string, unknown>) => void;
  onError?: (error: unknown) => void;
};

function extractSubmissionData(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data?: Record<string, unknown> }).data ?? {};
  }
  return (value as Record<string, unknown>) ?? {};
}

export function LmsFormioForm({
  form,
  uploadContext,
  submission,
  className = 'lms-formio-runtime',
  handlers,
  onChange,
  onError,
}: LmsFormioFormProps) {
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSaveDoneRef = useRef(false);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const preparedForm = useMemo(
    () => prepareRuntimeFormSchema(form, uploadContext),
    [form, uploadContext],
  );

  const formOptions = useMemo(
    () => createRuntimeFormOptions(uploadContext),
    [uploadContext],
  );

  const scheduleSaveDraft = useCallback((data: Record<string, unknown>) => {
    const saveDraft = handlersRef.current?.onSaveDraft;
    if (!saveDraft) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDraft(data).catch((err) => {
        console.error('Form autosave failed', err);
      });
    }, LMS_FORM_AUTOSAVE_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    initialSaveDoneRef.current = false;
  }, [uploadContext]);

  useEffect(() => {
    const saveDraft = handlers?.onSaveDraft;
    if (!saveDraft || initialSaveDoneRef.current) {
      return;
    }

    initialSaveDoneRef.current = true;
    saveDraft(submission ?? {}).catch((err) => {
      console.error('Initial form save failed', err);
      initialSaveDoneRef.current = false;
    });
  }, [handlers?.onSaveDraft, submission, uploadContext]);

  const handleChange = useCallback(
    (value: unknown) => {
      const data = extractSubmissionData(value);
      onChange?.(data);
      scheduleSaveDraft(data);
    },
    [onChange, scheduleSaveDraft],
  );

  const handleSubmit = useCallback(async (value: unknown) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const data = extractSubmissionData(value);
    const submit = handlersRef.current?.onSubmit;
    if (!submit) {
      return;
    }
    await submit(data);
  }, []);

  return (
    <div className={className}>
      <Form
        form={preparedForm}
        submission={submission ? { data: submission } : undefined}
        options={formOptions}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onError={onError}
      />
    </div>
  );
}
