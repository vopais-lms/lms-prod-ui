const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const LMS_FORM_AUTOSAVE_DEBOUNCE_MS = 800;

export type FormUploadContext =
  | {
      purpose: 'loan_application_form_json';
      loanApplicationEid: string;
    }
  | {
      purpose: 'moratorium_request_form_json';
      loanApplicationEid: string;
      moratoriumRequestEid: string;
    }
  | {
      purpose: 'disbursement_request_form_json';
      loanApplicationEid: string;
      disbursementRequestEid: string;
    };

export type LmsFormHandlers = {
  onSaveDraft?: (data: Record<string, unknown>) => Promise<void>;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
};

type FormioFileUploadResult = {
  storage: string;
  name: string;
  url: string;
  size: number;
  type: string;
  data?: Record<string, unknown>;
};

type LmsFileOptions = {
  headers?: Record<string, string>;
  lmsFormFieldKey?: string;
};

type FormioComponent = {
  type?: string;
  key?: string;
  action?: string;
  storage?: string;
  fileKey?: string;
  url?: string;
  options?: string | LmsFileOptions;
  components?: FormioComponent[];
  columns?: Array<{ components?: FormioComponent[] }>;
  rows?: FormioComponent[][][];
};

function parseFileOptions(options: string | LmsFileOptions | undefined): LmsFileOptions {
  if (!options) {
    return {};
  }
  if (typeof options === 'string') {
    try {
      return JSON.parse(options) as LmsFileOptions;
    } catch {
      return {};
    }
  }
  return options;
}

export function buildFileUploadUrl(context: FormUploadContext): string {
  switch (context.purpose) {
    case 'loan_application_form_json':
      return `${API_BASE_URL}/loan_applications/${context.loanApplicationEid}/temp_form_file_upload`;
    case 'moratorium_request_form_json':
      return `${API_BASE_URL}/loan_applications/${context.loanApplicationEid}/moratorium_requests/${context.moratoriumRequestEid}/temp_upload_file`;
    case 'disbursement_request_form_json':
      return `${API_BASE_URL}/loan_applications/${context.loanApplicationEid}/disbursement_requests/${context.disbursementRequestEid}/temp_upload_file`;
  }
}

function walkFormComponents(
  components: FormioComponent[] | undefined,
  visitor: (component: FormioComponent) => void,
) {
  if (!components) {
    return;
  }

  for (const component of components) {
    visitor(component);

    if (component.components) {
      walkFormComponents(component.components, visitor);
    }

    if (component.columns) {
      for (const column of component.columns) {
        walkFormComponents(column.components, visitor);
      }
    }

    if (component.rows) {
      for (const row of component.rows) {
        for (const cell of row) {
          if (Array.isArray(cell)) {
            walkFormComponents(cell, visitor);
          }
        }
      }
    }
  }
}

export function prepareRuntimeFormSchema(
  form: Record<string, unknown>,
  uploadContext: FormUploadContext,
): Record<string, unknown> {
  const prepared = structuredClone(form) as Record<string, unknown> & {
    components?: FormioComponent[];
    settings?: Record<string, unknown>;
  };
  const uploadUrl = buildFileUploadUrl(uploadContext);

  prepared.settings = {
    ...(prepared.settings ?? {}),
    saveOnSubmit: false,
  };

  walkFormComponents(prepared.components, (component) => {
    if (component.type !== 'file') {
      return;
    }

    component.storage = 'url';
    component.fileKey = 'file';
    component.url = uploadUrl;
    component.options = {
      ...parseFileOptions(component.options),
      lmsFormFieldKey: component.key,
    };
  });

  return prepared;
}

function buildUploadAuthHeaders(token: string | null): Record<string, string> {
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

export function createLmsFileService(
  uploadContext: FormUploadContext,
  getAccessToken: () => string | null = () => localStorage.getItem('auth_token'),
) {
  const uploadUrl = buildFileUploadUrl(uploadContext);

  return {
    uploadFile(
      _storage: string,
      file: File,
      name: string,
      _dir: string,
      progressCallback: (event: ProgressEvent) => void,
      _url: string,
      options: string | LmsFileOptions | undefined,
      _fileKey: string,
    ): Promise<FormioFileUploadResult> {
      const parsedOptions = parseFileOptions(options);
      const formFieldKey = parsedOptions.lmsFormFieldKey || name;
      const token = getAccessToken();
      const headers = buildUploadAuthHeaders(token);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('form_field_key', formFieldKey);

        xhr.open('POST', uploadUrl);
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        if (typeof progressCallback === 'function') {
          xhr.upload.onprogress = progressCallback;
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let responseData: Record<string, unknown> = {};
            if (xhr.response) {
              try {
                responseData = JSON.parse(xhr.response) as Record<string, unknown>;
              } catch {
                responseData = {};
              }
            }

            resolve({
              storage: 'url',
              name,
              url: typeof responseData.url === 'string' ? responseData.url : name,
              size: file.size,
              type: file.type,
              data: responseData,
            });
            return;
          }

          reject(xhr.response || 'Unable to upload file');
        };

        xhr.onerror = () => reject(xhr);
        xhr.onabort = () => reject(xhr);
        xhr.send(formData);
      });
    },

    downloadFile(file: { url?: string; name?: string; type?: string }) {
      return Promise.resolve(file);
    },

    deleteFile() {
      return Promise.resolve('File deleted');
    },
  };
}

export function createRuntimeFormOptions(
  uploadContext: FormUploadContext,
  getAccessToken?: () => string | null,
) {
  return {
    fileService: createLmsFileService(uploadContext, getAccessToken),
    submitOnEnter: false,
  };
}
