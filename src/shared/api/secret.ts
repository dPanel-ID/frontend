import * as SshKeyAlgorithms from './secret.ssh-key.algorithms';
import * as SshKeyCreate from './secret.ssh-key.create';
import * as SshKeyDelete$Id from './secret.ssh-key.delete.$id';
import * as SshKeyDetail$Id from './secret.ssh-key.detail.$id';
import * as SshKeyFind from './secret.ssh-key.find';
import * as SshKeyLengths from './secret.ssh-key.lengths';

const Root = {
  SshKey: {
    Algorithms: SshKeyAlgorithms,
    Create: SshKeyCreate,
    Detail: {
      $Id: SshKeyDetail$Id,
    },
    Delete: {
      $Id: SshKeyDelete$Id,
    },
    Find: SshKeyFind,
    Lengths: SshKeyLengths,
  },
};

export default Root;
