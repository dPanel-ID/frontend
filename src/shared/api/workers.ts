import * as Workers$Id from './workers.$id';
import * as Workers$IdToken from './workers.$id.token';
import * as WorkersCreate from './workers.create';
import * as WorkersFind from './workers.find';
import * as WorkersMode from './workers.mode';

const Root = {
  Find: WorkersFind,
  Create: WorkersCreate,
  Mode: WorkersMode,
  $Id: {
    Remove: Workers$Id,
    Token: Workers$IdToken,
  },
};

export default Root;
