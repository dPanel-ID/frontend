import * as ApplicationReach from './load-balancer.application-reach';
import * as Certificate$Id from './load-balancer.certificate.$id';
import * as Create from './load-balancer.create';
import * as Delete$Id from './load-balancer.delete.$id';
import * as Detail$Id from './load-balancer.detail.$id';
import * as Find from './load-balancer.find';
import * as IAC$Id from './load-balancer.iac.$id';
import * as Logs$Id from './load-balancer.logs.$id';
import * as Update$Id from './load-balancer.update.$id';

const Root = {
  ApplicationReach,
  Certificate: {
    $Id: Certificate$Id,
  },
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
    $Id: Update$Id,
  },
};

export default Root;
