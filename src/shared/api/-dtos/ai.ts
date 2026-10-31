export interface AiChatPayloadV1 {
  content: string;
  conversation_id?: string;
  /** false asks for one JSON response instead of an event stream. */
  stream: false;
}

export interface AiChatResultV1 {
  conversation_id?: string;
  title?: string;
  message?: string;
  tools?: string[] | null;
}

export interface AiConversationV1 {
  id?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AiMessageV1 {
  id?: string;
  role?: string;
  content?: string;
  tools?: string[] | null;
  created_at?: string;
}

export interface AiConversationDetailV1 extends AiConversationV1 {
  messages?: AiMessageV1[] | null;
}
