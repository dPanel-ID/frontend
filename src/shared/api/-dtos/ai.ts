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
  /** Values of the action's secret inputs by name; sent with the approval only. */
  secrets?: Record<string, string>;
}

export interface AiTurnStartedV1 {
  turn_id?: string;
  conversation_id?: string;
  status?: string;
}

/** A secret value a proposed change needs from the user when approving. */
export interface AiSecretInputV1 {
  name?: string;
  label?: string;
}

export interface AiPendingActionV1 {
  action_id?: string;
  tool?: string;
  summary?: string;
  secret_inputs?: AiSecretInputV1[] | null;
}

/** A value an approved action generated, such as a database password. */
export interface AiUserSecretV1 {
  name?: string;
  label?: string;
  value?: string;
}

export interface AiActionResultV1 {
  action_id?: string;
  status?: string;
  /** Returned once, on the first poll of the completed turn; never stored. */
  secrets?: AiUserSecretV1[] | null;
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
