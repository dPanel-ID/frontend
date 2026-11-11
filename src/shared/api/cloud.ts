import * as ProjectBillingAccounts$Id from './cloud.project.billing-accounts.$id';
import * as ProjectCreate from './cloud.project.create';
import * as ProjectDelete$Id from './cloud.project.delete.$id';
import * as ProjectFind from './cloud.project.find';
import * as ProjectOrphans$Id from './cloud.project.orphans.$id';
import * as ProjectOrphans$IdDelete from './cloud.project.orphans.$id.delete';
import * as ProjectOrphans$IdExecutions$ExecutionId from './cloud.project.orphans.$id.executions.$executionId';
import * as ProjectOstemplates$Id from './cloud.project.ostemplates.$id';
import * as ProjectProducts$Id from './cloud.project.products.$id';
import * as ProjectProviders from './cloud.project.providers';
import * as ProjectProviders$Provider from './cloud.project.providers.$provider';
import * as ProjectSizes$Id from './cloud.project.sizes.$id';
import * as ProjectUpdate$IdCredentials from './cloud.project.update.$id.credentials';
import * as ProjectZones$Id from './cloud.project.zones.$id';
import * as Regions$Id from './cloud.regions.$id';
import * as Vpcs$Id from './cloud.vpcs.$id';

const Root = {
  Project: {
    Create: ProjectCreate,
    Delete: {
      $Id: ProjectDelete$Id,
    },
    Find: ProjectFind,
    Update: {
      $Id: {
        Credentials: ProjectUpdate$IdCredentials,
      },
    },
    BillingAccounts: {
      $Id: ProjectBillingAccounts$Id,
    },
    Orphans: {
      $Id: {
        ...ProjectOrphans$Id,
        Delete: ProjectOrphans$IdDelete,
        Executions: {
          $ExecutionId: ProjectOrphans$IdExecutions$ExecutionId,
        },
      },
    },
    Ostemplates: {
      $Id: ProjectOstemplates$Id,
    },
    Products: {
      $Id: ProjectProducts$Id,
    },
    Sizes: {
      $Id: ProjectSizes$Id,
    },
    Zones: {
      $Id: ProjectZones$Id,
    },
    Providers: {
      ...ProjectProviders,
      $Provider: ProjectProviders$Provider,
    },
  },
  Regions: {
    $Id: Regions$Id,
  },
  Vpcs: {
    $Id: Vpcs$Id,
  },
};

export default Root;
