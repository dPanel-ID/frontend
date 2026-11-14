import * as Create from './deploy.create';
import * as Delete$Id from './deploy.delete.$id';
import * as Detail$Id from './deploy.detail.$id';
import * as Find from './deploy.find';

const Root = {
  Create,
  Detail: {
    $Id: Detail$Id,
  },
  Delete: {
    $Id: Delete$Id,
  },
  Find,
};

export default Root;
