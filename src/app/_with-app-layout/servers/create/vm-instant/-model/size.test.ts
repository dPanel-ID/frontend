import { describe, expect, it } from 'vitest';

import { snapSize } from './size';

const sizes = [
  { vcpu: 2, memory_gb: 2, value: 't3a.small', rounded_up: false },
  { vcpu: 2, memory_gb: 4, value: 't3a.medium', rounded_up: false },
  { vcpu: 4, memory_gb: 16, value: 't3a.xlarge', rounded_up: false },
];

describe('snapSize', () => {
  it('keeps a pair the provider serves', () => {
    expect(snapSize(sizes, 2, 4, 'cpu')?.value).toBe('t3a.medium');
  });

  it('keeps the moved CPU and moves memory to the nearest pair', () => {
    expect(snapSize(sizes, 4, 2, 'cpu')?.value).toBe('t3a.xlarge');
  });

  it('keeps the moved memory and moves CPU to the nearest pair', () => {
    expect(snapSize(sizes, 4, 4, 'memory')?.value).toBe('t3a.medium');
  });

  it('falls back to the closest pair when nothing matches the moved value', () => {
    expect(snapSize(sizes, 1, 1, 'cpu')?.value).toBe('t3a.small');
  });
});
