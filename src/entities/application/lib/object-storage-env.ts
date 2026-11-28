import { parseEnvText } from './env-text';

/** The composer package Laravel needs for the "s3" disk. */
export const OBJECT_STORAGE_PACKAGE = 'league/flysystem-aws-s3-v3';

/** What the object storage helper asks for. */
export interface ObjectStorageSettings {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  /** Empty for AWS itself; the provider's URL for any S3-compatible one. */
  endpoint: string;
  /** Most S3-compatible providers (MinIO and the like) need it on. */
  usePathStyle: boolean;
}

export const OBJECT_STORAGE_KEYS = [
  'FILESYSTEM_DISK',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_DEFAULT_REGION',
  'AWS_BUCKET',
  'AWS_ENDPOINT',
  'AWS_USE_PATH_STYLE_ENDPOINT',
] as const;

export type ObjectStorageField =
  'accessKeyId' | 'secretAccessKey' | 'region' | 'bucket' | 'endpoint';

/** S3 bucket names: 3-63 lowercase letters, digits, dots and hyphens. */
const BUCKET = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;
const REGION = /^[A-Za-z0-9-]{1,64}$/;

/**
 * The fields that need fixing, each with a message key. The access key
 * and secret are only checked for presence: they are never echoed back.
 */
export function objectStorageErrors(
  settings: ObjectStorageSettings,
): Partial<Record<ObjectStorageField, string>> {
  const errors: Partial<Record<ObjectStorageField, string>> = {};
  if (!settings.accessKeyId.trim()) errors.accessKeyId = 'required';
  if (!settings.secretAccessKey) errors.secretAccessKey = 'required';
  if (!REGION.test(settings.region.trim())) errors.region = 'badRegion';
  if (!BUCKET.test(settings.bucket.trim())) errors.bucket = 'badBucket';
  const endpoint = settings.endpoint.trim();
  if (endpoint && !/^https?:\/\/[^\s/]+[^\s]*$/i.test(endpoint)) {
    errors.endpoint = 'badEndpoint';
  }
  return errors;
}

/**
 * The runtime variables that point a Laravel app's default disk at an
 * S3-compatible bucket. The two keys are written as typed; like every
 * variable they are masked once saved.
 */
export function objectStorageEnvEntries(
  settings: ObjectStorageSettings,
): Array<[string, string]> {
  return [
    ['FILESYSTEM_DISK', 's3'],
    ['AWS_ACCESS_KEY_ID', settings.accessKeyId.trim()],
    ['AWS_SECRET_ACCESS_KEY', settings.secretAccessKey],
    ['AWS_DEFAULT_REGION', settings.region.trim()],
    ['AWS_BUCKET', settings.bucket.trim()],
    ['AWS_ENDPOINT', settings.endpoint.trim()],
    ['AWS_USE_PATH_STYLE_ENDPOINT', settings.usePathStyle ? 'true' : 'false'],
  ];
}

/** Whether the text already sends the default disk to object storage. */
export function usesObjectStorage(envText: string): boolean {
  return parseEnvText(envText).variables.some(
    (variable) =>
      variable.key === 'FILESYSTEM_DISK' &&
      variable.value.trim().toLowerCase() === 's3',
  );
}
