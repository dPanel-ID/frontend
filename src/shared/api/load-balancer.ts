import * as Create from './load-balancer.create';
import * as Delete$Id from './load-balancer.delete.$id';
import * as Detail$Id from './load-balancer.detail.$id';
import * as Find from './load-balancer.find';
import * as IAC$Id from './load-balancer.iac.$id';
import * as Logs$Id from './load-balancer.logs.$id';
import * as Update$Id from './load-balancer.update.$id';
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
  IAC: {
    $Id: IAC$Id,
  },
  Logs: {
    $Id: Logs$Id,
  },
  Update: {
    $Id: {
      ...Update$Id,
      $: {
        Restore: Update$IdCaseRestore,
      },
    },
  },
};

export default Root;
