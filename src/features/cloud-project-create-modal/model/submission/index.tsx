import { useModalEmit } from '@/services/modal/model/event';
import { useToaster } from '@/services/toaster';

import { ApiCloud } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

import { useCpcPropsContext } from '../../config/context';
import { useCpcFormContext } from '../forms/context';
import type {
  SchemaDynamicCredentialForm,
  SchemaGcpForm,
  SchemaIDCloudHostForm,
  SchemaProxmoxForm,
} from '../forms/schema';
import {
  getCredentialFieldKey,
  getCredentialFields,
  getProviderKind,
} from '../provider-contract';

export default function useModelSubmission(
  provider?: DTOs.CloudProviderContractV1,
) {
  const { onSubmitSuccess } = useCpcPropsContext();
  const {
    formDynamicCredential,
    formGCP,
    formIDCloudHost,
    formBase,
    formProxmox,
  } = useCpcFormContext();

  const [openToaster] = useToaster();
  const emitModal = useModalEmit();

  const handleSubmitGCP = async () => {
    return new Promise<SchemaGcpForm | undefined>((resolve) => {
      formGCP.handleSubmit(
        (data) => resolve(data),
        () => resolve(undefined),
      )();
    });
  };

  const handleSubmitIDCloudHost = async () => {
    return new Promise<SchemaIDCloudHostForm | undefined>((resolve) => {
      formIDCloudHost.handleSubmit(
        (data) => resolve(data),
        () => resolve(undefined),
      )();
    });
  };

  const handleSubmitProxmox = async () => {
    return new Promise<SchemaProxmoxForm | undefined>((resolve) => {
      formProxmox.handleSubmit(
        (data) => resolve(data),
        () => resolve(undefined),
      )();
    });
  };

  const handleSubmitDynamicCredential = async () => {
    return new Promise<SchemaDynamicCredentialForm | undefined>((resolve) => {
      formDynamicCredential.handleSubmit(
        (data) => resolve(data),
        () => resolve(undefined),
      )();
    });
  };

  const handleSubmit = formBase.handleSubmit(async (baseData) => {
    let credential: Record<string, unknown> | undefined;
    const providerKind = getProviderKind(baseData.cloudProvider, provider);

    switch (providerKind) {
      case 'gcp':
        credential = buildGCPCredentialPayload(await handleSubmitGCP());
        break;

      case 'proxmox': {
        const proxmoxData = await handleSubmitProxmox();
        credential = proxmoxData?.credential;
        break;
      }

      case 'idcloudhost':
        credential = await handleSubmitIDCloudHost();
        break;

      default: {
        const dynamicCredential = await handleSubmitDynamicCredential();
        credential = buildDynamicCredentialPayload(dynamicCredential, provider);
        break;
      }
    }

    if (!credential) return;

    emitModal('%%modal/allow-trivial-close', false);

    const response = await ApiCloud.Project.Create.doPost({
      credential,
      name: baseData.metaTitle,
      cloudProvider: baseData.cloudProvider,
    });

    if (response.$status === 'failed') {
      openToaster({
        title: <>Error while creating cloud project</>,
        message: getApiErrorDetail(response.error),
        variant: 'error',
        duration: 5000,
      });

      emitModal('%%modal/allow-trivial-close', true);
      return;
    }

    emitModal('%%modal/close', null);
    openToaster({
      variant: 'success',
      message: <>Successfully created new cloud project!</>,
    });

    onSubmitSuccess();
  });

  const isSubmitting =
    formBase.formState.isSubmitting ||
    formDynamicCredential.formState.isSubmitting ||
    formIDCloudHost.formState.isSubmitting ||
    formGCP.formState.isSubmitting ||
    formProxmox.formState.isSubmitting;

  return {
    handleSubmit,
    isSubmitting,
  };
}

function buildDynamicCredentialPayload(
  values?: SchemaDynamicCredentialForm,
  provider?: DTOs.CloudProviderContractV1,
) {
  const fields = getCredentialFields(provider);
  const credential = values?.credential ?? {};
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const fieldKey = getCredentialFieldKey(field);
    const rawValue = credential[fieldKey]?.trim();
    const defaultValue =
      typeof field.default === 'string' ? field.default.trim() : '';
    const value = rawValue || defaultValue;

    if (value) setCredentialPathValue(payload, field, value);
  }

  return payload;
}

function buildGCPCredentialPayload(values?: SchemaGcpForm) {
  if (!values) return undefined;

  return {
    project_id: values.project_id,
    auth_kind: 'serviceaccount',
    service_account_json: JSON.stringify(values),
  };
}

function setCredentialPathValue(
  payload: Record<string, unknown>,
  field: DTOs.CloudProviderFieldV1,
  value: string,
) {
  const key = getCredentialFieldKey(field);
  const path = field.path?.startsWith('credential.')
    ? field.path.replace(/^credential\./, '')
    : key;

  const pathParts = path.split('.').filter(Boolean);
  if (pathParts.length < 1) return;
  const lastPathPart = pathParts[pathParts.length - 1];
  if (!lastPathPart) return;

  let cursor: Record<string, unknown> = payload;

  for (const pathPart of pathParts.slice(0, -1)) {
    const nextValue = cursor[pathPart];

    if (!nextValue || typeof nextValue !== 'object') {
      cursor[pathPart] = {};
    }

    cursor = cursor[pathPart] as Record<string, unknown>;
  }

  cursor[lastPathPart] = value;
}
