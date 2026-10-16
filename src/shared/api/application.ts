import * as Create from './application.create';
import * as Delete$Id from './application.delete.$id';
import * as Detail$Id from './application.detail.$id';
import * as Find from './application.find';
import * as IAC$Id from './application.iac.$id';
import * as Logs$Id from './application.logs.$id';
import * as Update$Id from './application.update.$id';

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
    },
  },
};

export default Root;
