import { describe, expect, it } from 'vitest';

import { isUnreachableServerAddress } from './server-address';

describe('isUnreachableServerAddress', () => {
  it.each([
    '0.0.0.0',
    '127.0.0.1',
    '10.0.0.5',
    '172.16.4.2',
    '172.31.255.1',
    '192.168.1.20',
    '100.64.0.1',
    '100.127.255.254',
    '169.254.169.254',
    '192.0.2.10',
    '203.0.113.9',
    '::1',
    '[::1]',
    'fd00::1',
    'fe80::1',
    '2001:db8::1',
    'localhost',
    'example.com',
    'www.example.org',
    'server.example',
    'pi.local',
    'nas.lan',
    'box.home.arpa',
    'app.test',
  ])('refuses %s', (address) => {
    expect(isUnreachableServerAddress(address)).toBe(true);
  });

  it.each([
    '',
    '103.150.197.112',
    '8.8.8.8',
    '172.32.0.1',
    '100.128.0.1',
    '2606:4700::1111',
    'vps.devetek.app',
    'example.co',
  ])('allows %s', (address) => {
    expect(isUnreachableServerAddress(address)).toBe(false);
  });
});
