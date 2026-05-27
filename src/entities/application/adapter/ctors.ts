import type z from 'zod';

import type { schemaServerMinimal } from '@/entities/server/rules/schema';

import type { DTOs } from '@/shared/api';
import { iife } from '@/shared/libs/browser/fn';
import { excludeNully } from '@/shared/libs/browser/typeguards';
import type { KeysOnlyDeep } from '@/shared/libs/types/keys-only';

import type { configDefs, identity, state } from '../rules/schema/parts';

export function ctorIdentity(
  raw: DTOs.ApplicationV1,
): KeysOnlyDeep<z.input<typeof identity>> {
  return {
    name: raw.name || `Application ${raw.id ?? ''}`.trim(),
    bundleType: raw.bundle_type || undefined,
    ...iife(() => {
      if (raw.source_type === 'github') {
        return {
          source: 'repository',
          sourceKind: 'github',
          repoName: raw.repo_name || '',
          repoOrganization: raw.repo_org || '',
        };
      }

      return {
        source: 'independent',
      };
    }),
  };
}

export function ctorConfigDefs(
  raw: DTOs.ApplicationV1,
): KeysOnlyDeep<z.input<typeof configDefs>> {
  const autoDeploy = iife(
    (): KeysOnlyDeep<z.input<typeof configDefs>['cicd']['autoDeploy']> => {
      if (raw.app_config?.auto_deploy?.enabled) {
        return {
          enabled: true,
          fromBranch: raw.app_config.auto_deploy.branch,
        };
      }

      return {
        enabled: false,
      };
    },
  );

  type LifecycleInput = NonNullable<z.input<typeof configDefs>['lifecycle']>;

  const lifecycle = iife((): KeysOnlyDeep<LifecycleInput> | undefined => {
    if (raw.app_definition == null) return undefined;

    const rawBuild = raw.app_definition.build?.target?.machine;
    const rawRun = raw.app_definition.run;

    if (!rawBuild || !rawRun) return undefined;

    const mainLanguage = iife(() => {
      const { name, version } = raw.app_definition?.setup?.language ?? {};

      if (!name || version == null) return null;

      return {
        name,
        version: String(version),
      };
    });

    return {
      setup: {
        languages: [
          mainLanguage,
          ...(raw.app_definition.setup?.languages ?? []).map((language) => {
            if (!language.name || language.version == null) return null;

            return {
              name: language.name,
              version: String(language.version),
            };
          }),
        ].filter(excludeNully),
      },
      build: {
        envs: rawBuild.environment ?? [],
        steps: (rawBuild.steps ?? []).map((step, index) => ({
          name: step.name || `Step ${index + 1}`,
          command: step.command,
          archive: step.archive,
        })),
      },
      run: {
        name: rawRun.name || '',
        command: rawRun.command || '',
        port: rawRun.port || 0,
        envs: rawRun.environment ?? [],
      },
    };
  });

  return {
    cicd: {
      autoDeploy,
    },
    lifecycle,
  };
}

export function ctorState(
  raw: DTOs.ApplicationV1,
): KeysOnlyDeep<z.input<typeof state>> {
  return {
    lastArtifact: {
      message: raw.artifacts?.[0]?.error,
      status: raw.artifacts?.[0]?.installer_status,
    },
    service: raw.deploys?.[0]?.service?.state,
  };
}

export function ctorDeploymentTargets(
  raw: DTOs.ApplicationV1,
): KeysOnlyDeep<Array<z.input<typeof schemaServerMinimal>>> {
  return (raw.deploys ?? [])
    .map((deploy) => {
      if (deploy.machine == null) return null;

      return {
        hostname: deploy.machine.hostname,
        id: String(deploy.machine_id),
      };
    })
    .filter(excludeNully);
}
