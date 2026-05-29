import * as Create from './organization-people.create';
import * as Delete$Id from './organization-people.delete.$id';
import * as Detail$Id from './organization-people.detail.$id';
import * as Find from './organization-people.find';
import * as Update$Id from './organization-people.update.$id';

const Root = {
  Create,
  Delete: {
    $Id: Delete$Id,
  },
  Detail: {
    $Id: Detail$Id,
  },
  Find,
  Update: {
    $Id: Update$Id,
  },
};

export default Root;
