import * as tldts from 'tldts';
import { z } from 'zod';

export const schemaDomainCreateForm = z.object({
  domain: z
    .string()
    .transform(normalizeDomainInput)
    .pipe(
      z
        .string()
        .min(1, 'formErrors.required')
        .refine(isValidDomain, 'formErrors.parseDomain.invalidDomain'),
    ),
  description: z.string().trim().optional(),
  provider: z.string().trim().min(1, 'formErrors.required'),
  credentials: z.record(z.string(), z.string().optional()),
});

export type DomainCreateForm = z.output<typeof schemaDomainCreateForm>;

export function normalizeDomainInput(value: string) {
  return value
    .trim()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/[/?#].*$/, '')
    .toLowerCase();
}

export function isValidDomain(value: string) {
  const normalizedValue = normalizeDomainInput(value);
  const parsed = tldts.parse(normalizedValue);

  return Boolean(
    parsed.hostname && parsed.publicSuffix && parsed.domainWithoutSuffix,
  );
}
