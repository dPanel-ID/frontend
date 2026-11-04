import * as Create from './cluster.create';
import * as Detail$Id from './cluster.detail.$id';
import * as Find from './cluster.find';
import * as Kinds from './cluster.kinds';

const Root = {
  Create,
  Detail: {
    $Id: Detail$Id,
  },
  Find,
  Kinds,
};

export default Root;
