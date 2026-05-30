import * as ConfigCreate from './organization-config.create';
import * as ConfigDelete$Id from './organization-config.delete.$id';
import * as ConfigDetail$Id from './organization-config.detail.$id';
import * as ConfigFind from './organization-config.find';
import * as ConfigUpdate$Id from './organization-config.update.$id';
import * as RoleAvailable from './organization-role.available';
import * as RoleCreate from './organization-role.create';
import * as RoleDelete$Id from './organization-role.delete.$id';
import * as RoleDetail$Id from './organization-role.detail.$id';
import * as RoleFind from './organization-role.find';
import * as RoleUpdate$Id from './organization-role.update.$id';
import * as Create from './organization.create';
import * as Delete$Id from './organization.delete.$id';
import * as Detail$Id from './organization.detail.$id';
import * as Detail$IdMembers from './organization.detail.$id.members';
import * as Find from './organization.find';
import * as Update$Id from './organization.update.$id';

const Root = {
  Config: {
    Create: ConfigCreate,
    Delete: {
      $Id: ConfigDelete$Id,
    },
    Detail: {
      $Id: ConfigDetail$Id,
    },
    Find: ConfigFind,
    Update: {
      $Id: ConfigUpdate$Id,
    },
  },
  Create,
  Delete: {
    $Id: Delete$Id,
  },
  Detail: {
    $Id: {
      ...Detail$Id,
      Members: Detail$IdMembers,
    },
  },
  Find,
  Role: {
    Available: RoleAvailable,
    Create: RoleCreate,
    Delete: {
      $Id: RoleDelete$Id,
    },
    Detail: {
      $Id: RoleDetail$Id,
    },
    Find: RoleFind,
    Update: {
      $Id: RoleUpdate$Id,
    },
  },
  Update: {
    $Id: Update$Id,
  },
};

export default Root;
