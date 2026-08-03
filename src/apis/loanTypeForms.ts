import { Components } from '@formio/js';
import type { LoanTypeFormPurpose } from './types';

export type LoanTypeFormMenuItem = {
  purpose: LoanTypeFormPurpose;
  label: string;
  description: string;
};

export const LOAN_TYPE_FORM_PURPOSES: LoanTypeFormMenuItem[] = [
  {
    purpose: 'loan_application_form_json',
    label: 'Loan application',
    description: 'Application form used when creating a loan application',
  },
  {
    purpose: 'disbursement_request_form_json',
    label: 'Disbursement request',
    description: 'Form for disbursement request workflows',
  },
  {
    purpose: 'moratorium_request_form_json',
    label: 'Moratorium request',
    description: 'Form for moratorium request workflows',
  },
];

export const DEFAULT_LOAN_TYPE_FORM_PURPOSE: LoanTypeFormPurpose = 'loan_application_form_json';

export const EMPTY_FORMIO_SCHEMA: Record<string, unknown> = {
  display: 'form',
  components: [],
};

/** Fresh empty schema — never reuse the shared EMPTY constant with FormBuilder. */
export function createEmptyFormioSchema(): Record<string, unknown> {
  return {
    display: 'form',
    components: [],
  };
}

/** Form.io layout / action types that are not parameter input fields. */
const NON_INPUT_FORMIO_TYPES = new Set([
  'form',
  'panel',
  'fieldset',
  'well',
  'tabs',
  'columns',
  'table',
  'container',
  'datagrid',
  'editgrid',
  'datamap',
  'tree',
  'datasource',
  'htmlelement',
  'button',
  'content',
]);

export function getInputFormioComponents(
  schema: Record<string, unknown> | null | undefined,
): Record<string, unknown>[] {
  const components = Array.isArray(schema?.components) ? schema.components : [];
  return components.filter(
    (component): component is Record<string, unknown> =>
      !!component &&
      typeof component === 'object' &&
      typeof (component as { type?: unknown }).type === 'string' &&
      !NON_INPUT_FORMIO_TYPES.has((component as { type: string }).type),
  );
}

function cloneJson<T>(value: T): T {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);
}

/**
 * Form.io FormBuilder expects a flat schema `{ display, components }`.
 * Backend / FormParser may store nested project shape `{ forms: { main: {...} } }`
 * (e.g. after parameter field linking). Unwrap so the builder shows fields.
 */
export function toFormioBuilderSchema(
  formJson: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!formJson || typeof formJson !== 'object') {
    return createEmptyFormioSchema();
  }

  const forms = formJson.forms;
  if (forms && typeof forms === 'object' && !Array.isArray(forms)) {
    const formsRecord = forms as Record<string, unknown>;
    const nested =
      (formsRecord.main && typeof formsRecord.main === 'object'
        ? formsRecord.main
        : Object.values(formsRecord).find(
            (value) => value && typeof value === 'object' && !Array.isArray(value),
          )) ?? null;

    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const schema = nested as Record<string, unknown>;
      return {
        display: typeof schema.display === 'string' ? schema.display : 'form',
        components: Array.isArray(schema.components)
          ? cloneJson(schema.components)
          : [],
      };
    }
  }

  if (Array.isArray(formJson.components)) {
    return {
      display: typeof formJson.display === 'string' ? formJson.display : 'form',
      components: cloneJson(formJson.components),
    };
  }

  return createEmptyFormioSchema();
}

type EditFormFieldOverride = {
  key: string;
  defaultValue?: string;
  ignore?: boolean;
  validateOn?: string;
  overrideEditForm?: boolean;
};

type EditFormOverride = {
  key: string;
  ignore?: boolean;
  components?: EditFormFieldOverride[];
};

const DISPLAY_EDIT_FORM_OVERRIDES: EditFormOverride = {
  key: 'display',
  components: [
    { key: 'label', validateOn: 'change', overrideEditForm: true },
    { key: 'title', validateOn: 'change', overrideEditForm: true },
  ],
};

const SHARED_EDIT_FORM_OVERRIDES: EditFormOverride[] = [
  DISPLAY_EDIT_FORM_OVERRIDES,
  {
    key: 'data',
    components: [
      { key: 'persistent', ignore: true },
      { key: 'redrawOn', ignore: true },
      { key: 'customDefaultValuePanel', ignore: true },
      { key: 'calculateValuePanel', ignore: true },
      { key: 'calculateServer', ignore: true },
      { key: 'allowCalculateOverride', ignore: true },
      { key: 'serverOverride', ignore: true },
    ],
  },
  { key: 'logic', ignore: true },
  { key: 'layout', ignore: true },
  {
    key: 'validation',
    components: [
      { key: 'validateOn', defaultValue: 'blur' },
      { key: 'custom-validation-js', ignore: true },
      { key: 'json-validation-json', ignore: true },
      { key: 'errors', ignore: true },
    ],
  },
];

const FILE_EDIT_FORM_OVERRIDES: EditFormOverride[] = [
  {
    key: 'file',
    components: [
      { key: 'storage', defaultValue: 'url', ignore: true },
      { key: 'url', ignore: true },
      { key: 'options', ignore: true },
      { key: 'fileKey', defaultValue: 'file', ignore: true },
      { key: 'dir', ignore: true },
      { key: 'useMultipartUpload', ignore: true },
      { key: 'multipart', ignore: true },
    ],
  },
];

function buildEditFormOverrides(): Record<string, EditFormOverride[]> {
  const editForm: Record<string, EditFormOverride[]> = {};
  for (const type of Object.keys(Components.components)) {
    editForm[type] =
      type === 'file'
        ? [...FILE_EDIT_FORM_OVERRIDES, ...SHARED_EDIT_FORM_OVERRIDES]
        : SHARED_EDIT_FORM_OVERRIDES;
  }
  return editForm;
}

export const LOAN_TYPE_FORM_BUILDER_OPTIONS = {
  noNewEdit: true,
  editJson: false,
  builder: {
    premium: false,
    data: false,
  },
  editForm: buildEditFormOverrides(),
  hooks: {
    beforeSaveComponentSettings(submissionData: Record<string, unknown>) {
      syncEditFormLabelFromDialog(submissionData);
    },
  },
};

type FormBuilderInstance = {
  on?: (event: string, callback: () => void) => void;
  editForm?: { submission?: { data?: Record<string, unknown> } };
  schemas?: Record<string, { validateOn?: string; storage?: string; fileKey?: string }>;
  groups?: Record<
    string,
    {
      components?: Record<string, { key?: string; group?: string; ignore?: boolean }>;
      componentOrder?: string[];
      ignore?: boolean;
    }
  >;
  groupOrder?: string[];
  orderComponents?: (group: {
    components?: Record<string, unknown>;
    componentOrder?: string[];
  }) => void;
  searchFields?: (searchString?: string) => void;
};

const LAYOUT_PALETTE_COMPONENTS = new Set(['table', 'columns']);

function syncEditFormLabelFromDialog(submissionData: Record<string, unknown>) {
  const dialog = document.querySelector('.formio-dialog');
  if (!dialog) {
    return;
  }

  const labelInput = dialog.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    '.formio-component-label input, .formio-component-label textarea',
  );
  const titleInput = dialog.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    '.formio-component-title input, .formio-component-title textarea',
  );

  if (labelInput && 'label' in submissionData) {
    submissionData.label = labelInput.value;
  }

  if (titleInput && 'title' in submissionData) {
    submissionData.title = titleInput.value;
  }
}

function patchEditFormLabelSave(instance: FormBuilderInstance) {
  if ((instance as { __lmsLabelSavePatched?: boolean }).__lmsLabelSavePatched) {
    return;
  }

  (instance as { __lmsLabelSavePatched?: boolean }).__lmsLabelSavePatched = true;

  instance.on?.('editComponent', () => {
    window.setTimeout(() => {
      const container = document.querySelector('.formio-dialog .component-edit-container');
      if (!container) {
        return;
      }

      const saveButtons = container.querySelectorAll('[ref="saveButton"], [data-ref="saveButton"]');
      saveButtons.forEach((button) => {
        button.addEventListener(
          'click',
          () => {
            const active = document.activeElement;
            if (active instanceof HTMLElement) {
              active.blur();
            }

            const submissionData = instance.editForm?.submission?.data;
            if (submissionData) {
              syncEditFormLabelFromDialog(submissionData);
            }
          },
          { capture: true },
        );
      });
    }, 0);
  });
}

function patchBuilderSchemas(instance: FormBuilderInstance) {
  const fileSchema = instance.schemas?.file;
  if (fileSchema && typeof fileSchema === 'object') {
    fileSchema.storage = 'url';
    fileSchema.fileKey = 'file';
  }
}

function patchLayoutPalette(instance: FormBuilderInstance) {
  const layoutGroup = instance.groups?.layout;
  if (!layoutGroup?.components) {
    return;
  }

  for (const key of Object.keys(layoutGroup.components)) {
    if (!LAYOUT_PALETTE_COMPONENTS.has(key)) {
      delete layoutGroup.components[key];
    }
  }
  instance.orderComponents?.(layoutGroup);
}

function patchAdvancedFileComponent(instance: FormBuilderInstance) {
  const fileBuilderInfo = Components.components?.file?.builderInfo;
  const advancedGroup = instance.groups?.advanced;
  if (!fileBuilderInfo || !advancedGroup) {
    return;
  }

  advancedGroup.components = advancedGroup.components ?? {};
  advancedGroup.components.file = {
    ...fileBuilderInfo,
    key: 'file',
    group: 'advanced',
  };
  instance.orderComponents?.(advancedGroup);
}

export function patchLoanTypeFormBuilder(builder: { instance?: FormBuilderInstance }) {
  const instance = builder?.instance;
  if (!instance) {
    return;
  }

  patchBuilderSchemas(instance);
  patchLayoutPalette(instance);
  patchAdvancedFileComponent(instance);
  patchEditFormLabelSave(instance);
  instance.searchFields?.('');
}
