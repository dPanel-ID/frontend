import { describe, expect, it } from 'vitest';

import { isPublicAddress } from './publicAddress';

describe('isPublicAddress', () => {
  it.each([
    '34.101.60.146',
    '151.243.222.218',
    '172.32.0.1',
    '100.128.0.1',
    '2600:1f18::1',
    'vm.example.com',
  ])('is true for %s', (address) => {
    expect(isPublicAddress(address)).toBe(true);
  });

  // An AWS VM without a public IP showed 10.88.31.75 as its "Public
  // address" (server 362, 2026-11-20).
  it.each([
    '10.88.31.75',
    '172.16.0.4',
    '172.31.255.255',
    '192.168.1.10',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '0.0.0.0',
    '224.0.0.1',
    'fd00::1',
    'fe80::1',
    '::1',
    '',
    '  ',
    undefined,
  ])('is false for %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });
});
