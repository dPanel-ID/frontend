import { z } from 'zod';

type Translate = (key: string) => string;

const IPV4_SEGMENT = '(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})';
const IPV4_PATTERN = new RegExp(
  `^${IPV4_SEGMENT}\\.${IPV4_SEGMENT}\\.${IPV4_SEGMENT}\\.${IPV4_SEGMENT}$`,
);
const HOSTNAME_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)*[a-zA-Z0-9-]{1,63}(?<!-)$/;
const LINUX_USERNAME_PATTERN = /^[a-z_][a-z0-9_-]{0,31}$/;

function isServerAddress(value: string) {
  const normalized = value.trim();

  if (IPV4_PATTERN.test(normalized)) return true;
  if (HOSTNAME_PATTERN.test(normalized)) return true;

  return false;
}

function isValidPort(value: string) {
  if (!/^\d+$/.test(value)) return false;

  const port = Number(value);

  return port > 0 && port <= 65535;
}

export function createManualServerCreateSchema(t: Translate) {
  return z.object({
    cloud: z.object({
      sshKeyID: z.number({
        message: t('page.servers.create.validation.sshKeyRequired'),
      }),
    }),
    server: z.object({
      address: z
        .string()
        .trim()
        .min(1, t('page.servers.create.validation.addressRequired'))
        .refine(
          isServerAddress,
          t('page.servers.create.validation.addressInvalid'),
        ),
      ssh_port: z
        .string()
        .trim()
        .min(1, t('page.servers.create.validation.sshPortRequired'))
        .refine(
          isValidPort,
          t('page.servers.create.validation.sshPortInvalid'),
        ),
    }),
    login: z.object({
      default_user: z
        .string()
        .trim()
        .min(1, t('page.servers.create.validation.linuxUserRequired'))
        .refine(
          (value) => LINUX_USERNAME_PATTERN.test(value),
          t('page.servers.create.validation.linuxUserInvalid'),
        ),
    }),
  });
}

export const manualServerCreateSchema = createManualServerCreateSchema(
  (key) => key,
);

export type ManualServerCreateForm = z.infer<typeof manualServerCreateSchema>;
