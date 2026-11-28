import { describe, expect, it } from 'vitest';

import { upsertEnvText } from './env-text';
import {
  objectStorageEnvEntries,
  objectStorageErrors,
  usesObjectStorage,
} from './object-storage-env';

const settings = {
  accessKeyId: ' AKIAEXAMPLE ',
  secretAccessKey: 'example-secret',
  region: 'us-east-1',
  bucket: 'my-blog-uploads',
  endpoint: '',
  usePathStyle: false,
};

describe('objectStorageEnvEntries', () => {
  it('points the default disk at the bucket', () => {
    expect(objectStorageEnvEntries(settings)).toEqual([
      ['FILESYSTEM_DISK', 's3'],
      ['AWS_ACCESS_KEY_ID', 'AKIAEXAMPLE'],
      ['AWS_SECRET_ACCESS_KEY', 'example-secret'],
      ['AWS_DEFAULT_REGION', 'us-east-1'],
      ['AWS_BUCKET', 'my-blog-uploads'],
      ['AWS_ENDPOINT', ''],
      ['AWS_USE_PATH_STYLE_ENDPOINT', 'false'],
    ]);
  });

  it('writes an S3-compatible endpoint with path-style requests', () => {
    const entries = objectStorageEnvEntries({
      ...settings,
      endpoint: 'https://s3.example.com ',
      usePathStyle: true,
    });
    expect(entries).toContainEqual(['AWS_ENDPOINT', 'https://s3.example.com']);
    expect(entries).toContainEqual(['AWS_USE_PATH_STYLE_ENDPOINT', 'true']);
  });

  it('replaces the local disk in existing variables', () => {
    const text = upsertEnvText(
      'APP_ENV=production\nFILESYSTEM_DISK=local',
      objectStorageEnvEntries(settings),
    );
    expect(text.split('\n')[1]).toBe('FILESYSTEM_DISK=s3');
    expect(usesObjectStorage(text)).toBe(true);
    expect(usesObjectStorage('FILESYSTEM_DISK=local')).toBe(false);
  });
});

describe('objectStorageErrors', () => {
  it('accepts valid settings', () => {
    expect(objectStorageErrors(settings)).toEqual({});
  });

  it('reports every field that needs fixing', () => {
    expect(
      objectStorageErrors({
        accessKeyId: '',
        secretAccessKey: '',
        region: 'us east',
        bucket: 'My_Bucket',
        endpoint: 'ftp://x',
        usePathStyle: false,
      }),
    ).toEqual({
      accessKeyId: 'required',
      secretAccessKey: 'required',
      region: 'badRegion',
      bucket: 'badBucket',
      endpoint: 'badEndpoint',
    });
  });
});
