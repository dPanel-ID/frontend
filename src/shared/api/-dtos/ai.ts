export interface AiChatPayloadV1 {
  content: string;
  conversation_id?: string;
  /** Runs the turn in the background; poll it at /v1/ai/turns/{id}. */
  async: true;
}

export interface AiApprovalPayloadV1 {
  action_id: string;
  decision: 'approve' | 'reject';
  async: true;
}

export interface AiTurnStartedV1 {
  turn_id?: string;
  conversation_id?: string;
  status?: string;
}

export interface AiPendingActionV1 {
  action_id?: string;
  tool?: string;
  summary?: string;
}

export interface AiActionResultV1 {
  action_id?: string;
  status?: string;
}

export interface AiChatResultV1 {
  conversation_id?: string;
  title?: string;
  message?: string;
  tools?: string[] | null;
  pending_actions?: AiPendingActionV1[] | null;
  action_results?: AiActionResultV1[] | null;
}

export interface AiTurnV1 {
  turn_id?: string;
  conversation_id?: string;
  status?: 'running' | 'completed' | 'failed' | string;
  result?: AiChatResultV1 | null;
  error?: string;
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
