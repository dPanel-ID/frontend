import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import type { Person } from '@/entities/user/lib/person';

import type { CicdDeployment } from '../rules/schema';

/**
 * The person to name for a deployment: whoever started it, else whoever ran
 * the build it ships.
 */
export function whoDeployed(
  deployment: Pick<CicdDeployment, 'deployer'>,
  artifact?: Pick<CicdArtifact, 'executor'>,
): Person | undefined {
  if (deployment.deployer) return deployment.deployer;
  if (!artifact) return undefined;

  return {
    name: artifact.executor.userName,
    username: artifact.executor.username,
    avatarUrl: artifact.executor.avatarUrl,
  };
}
