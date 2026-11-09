import * as ServiceAccounts$Id from './service-accounts.$id';
import * as ServiceAccounts$IdTokens from './service-accounts.$id.tokens';
import * as ServiceAccounts$IdTokens$TokenId from './service-accounts.$id.tokens.$tokenId';
import * as ServiceAccountsCreate from './service-accounts.create';
import * as ServiceAccountsFind from './service-accounts.find';

const Root = {
  Find: ServiceAccountsFind,
  Create: ServiceAccountsCreate,
  $Id: {
    Remove: ServiceAccounts$Id,
    Tokens: {
      Create: ServiceAccounts$IdTokens,
      $TokenId: { Revoke: ServiceAccounts$IdTokens$TokenId },
    },
  },
};

export default Root;
