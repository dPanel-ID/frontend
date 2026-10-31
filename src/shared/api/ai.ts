import * as Chat from './ai.chat';
import * as Conversations from './ai.conversations';
import * as Conversations$Id from './ai.conversations.$id';

const Root = {
  Chat,
  Conversations: {
    ...Conversations,
    $Id: Conversations$Id,
  },
};

export default Root;
