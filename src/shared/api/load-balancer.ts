import * as Create from './load-balancer.create';
import * as Delete$Id from './load-balancer.delete.$id';
import * as Detail$Id from './load-balancer.detail.$id';
import * as Find from './load-balancer.find';
import * as Logs$Id from './load-balancer.logs.$id';
import * as Update$Id from './load-balancer.update.$id';
import * as Update$IdCaseMigrateOwnership from './load-balancer.update.$id[migrate-ownership]';
import * as Update$IdCaseRestore from './load-balancer.update.$id[restore]';

const Root = {
  Create,
  Delete: {
    $Id: Delete$Id,
  },
  Detail: {
    $Id: Detail$Id,
  },
  Find,
  Logs: {
    $Id: Logs$Id,
  },
  Update: {
    $Id: {
      ...Update$Id,
      $: {
        MigrateOwnership: Update$IdCaseMigrateOwnership,
        Restore: Update$IdCaseRestore,
      },
    },
  },
};

export default Root;
