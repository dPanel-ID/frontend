import * as Chat from './ai.chat';
import * as ChatApproval from './ai.chat.approval';
import * as Conversations from './ai.conversations';
import * as Conversations$Id from './ai.conversations.$id';
import * as Turns$Id from './ai.turns.$id';

const Root = {
  Chat: {
    ...Chat,
    Approval: ChatApproval,
  },
  Conversations: {
    ...Conversations,
    $Id: Conversations$Id,
  },
  Turns: {
    $Id: Turns$Id,
  },
};

export default Root;
