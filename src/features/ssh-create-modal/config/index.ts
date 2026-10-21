/** Shown when the backend cannot be asked which algorithms it supports. */
export const KEY_TYPE_LIST = [
  {
    name: 'ed25519',
    title: 'page.sshKeys.create.types.modern',
    description: 'page.sshKeys.create.types.modernDesc',
    technicalName: 'Ed25519',
    recommended: true,
  },
  {
    name: 'rsa',
    title: 'page.sshKeys.create.types.compatible',
    description: 'page.sshKeys.create.types.compatibleDesc',
    technicalName: 'RSA',
    recommended: false,
  },
];

export const KEY_LENGTH_LIST = [
  {
    value: 2048,
    label: '2048',
  },
  {
    value: 3072,
    label: '3072',
  },
  {
    value: 4096,
    label: '4096',
  },
];
