import * as Create from './domain.create';
import * as Delete$Id from './domain.delete.$id';
import * as Delete$Id$RecordId from './domain.delete.$id.$recordId';
import * as Detail$Id from './domain.detail.$id';
import * as Find from './domain.find';
import * as Origin$Id from './domain.origin.$id';
import * as Origin$Id$RecordId from './domain.origin.$id.$recordId';
import * as Origin$IdCreate from './domain.origin.$id.create';
import * as Providers from './domain.providers';
import * as Update$Id from './domain.update.$id';
import * as Update$IdCaseMigrateOwnership from './domain.update.$id[migrate-ownership]';

const Root = {
  Create,
  Detail: {
    $Id: Detail$Id,
  },
  Delete: {
    $Id: {
      ...Delete$Id,
      $RecordId: Delete$Id$RecordId,
    },
  },
  Find,
  Origin: {
    $Id: {
      ...Origin$Id,
      Create: Origin$IdCreate,
      $RecordId: Origin$Id$RecordId,
    },
  },
  Providers,
  Update: {
    $Id: {
      ...Update$Id,
      $: {
        MigrateOwnership: Update$IdCaseMigrateOwnership,
      },
    },
  },
};

export default Root;
