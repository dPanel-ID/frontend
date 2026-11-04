// @vitest-environment jsdom

import { afterEach, describe, expect, test } from 'vitest';

import {
  readLastConversationId,
  writeLastConversationId,
} from '../lib/conversation-storage';
import { toolLabel } from '../lib/tool-label';
import { ChatInputSchema } from '../rules/types';

import { toChatActions, toChatEntries, toChatSecrets } from './conversation';

describe('toChatEntries', () => {
  test('keeps user and assistant text and tolerates production-shaped gaps', () => {
    const entries = toChatEntries({
      id: 'aic_cs1f8g2o5v0p3m4n6k7l',
      messages: [
        { id: 'aim_1', role: 'user', content: 'servers?' },
        {
          id: 'aim_2',
          role: 'assistant',
          content: '  ',
          tools: ['server_list'],
        },
        { role: 'tool', content: '[{"secret":"x"}]' },
        { id: 'aim_4', role: 'assistant', content: 'You have 2.', tools: null },
        { role: 'assistant' },
      ],
    });

    expect(entries).toEqual([
      {
        id: 'aim_1',
        role: 'user',
        content: 'servers?',
        tools: [],
        status: 'done',
      },
      {
        id: 'aim_4',
        role: 'assistant',
        content: 'You have 2.',
        tools: [],
        status: 'done',
      },
    ]);
  });

  test('restores the approval cards an answer proposed', () => {
    const entries = toChatEntries({
      messages: [
        { id: 'aim_1', role: 'user', content: 'install php' },
        {
          id: 'aim_2',
          role: 'assistant',
          content: 'Approve it.',
          actions: [
            {
              action_id: 'aipa_a',
              tool: 'application_create',
              summary: 'Create app',
              status: 'pending',
              secret_inputs: [{ name: 'runtime:DB_PASSWORD' }, { label: 'x' }],
            },
            { action_id: 'aipa_b', tool: 'server_delete', status: 'running' },
            { tool: 'module_install', status: 'pending' },
          ],
        },
      ],
    });

    expect(entries[0]?.actions).toBeUndefined();
    expect(entries[1]?.actions).toEqual([
      {
        id: 'aipa_a',
        tool: 'application_create',
        summary: 'Create app',
        status: 'pending',
        secretInputs: [
          { name: 'runtime:DB_PASSWORD', label: 'runtime:DB_PASSWORD' },
        ],
      },
      {
        id: 'aipa_b',
        tool: 'server_delete',
        summary: '',
        status: 'running',
        secretInputs: [],
      },
    ]);
  });

  test('treats an unknown stored status as expired, never as pending', () => {
    expect(
      toChatActions([{ action_id: 'aipa_c', status: 'surprise' }])[0]?.status,
    ).toBe('expired');
  });

  test('handles a missing detail', () => {
    expect(toChatEntries(undefined)).toEqual([]);
    expect(toChatEntries({ messages: null })).toEqual([]);
  });
});

describe('conversation storage', () => {
  afterEach(() => window.localStorage.clear());

  test('remembers the last conversation per workspace', () => {
    window.localStorage.setItem('organization_id', '42');
    writeLastConversationId('aic_cs1f8g2o5v0p3m4n6k7l');
    expect(readLastConversationId()).toBe('aic_cs1f8g2o5v0p3m4n6k7l');

    window.localStorage.setItem('organization_id', '43');
    expect(readLastConversationId()).toBeNull();
  });

  test('ignores values that are not conversation ids', () => {
    window.localStorage.setItem('dpanel.ai.conversation.personal', '../../etc');
    expect(readLastConversationId()).toBeNull();
  });
});

describe('input and labels', () => {
  test('input must be non-blank and within the backend limit', () => {
    expect(ChatInputSchema.safeParse('  hi  ').data).toBe('hi');
    expect(ChatInputSchema.safeParse('   ').success).toBe(false);
    expect(ChatInputSchema.safeParse('a'.repeat(8001)).success).toBe(false);
  });

  test('tool labels are readable', () => {
    expect(toolLabel('dns_record_list')).toBe('dns record list');
  });
});

describe('toChatSecrets', () => {
  test('keeps complete secrets and labels them', () => {
    expect(
      toChatSecrets([
        { name: 'mariadb_root_password', label: 'Root password', value: 'a1' },
        { name: 'postgresql_password', value: 'b2' },
        { name: 'broken' },
      ]),
    ).toEqual([
      { name: 'mariadb_root_password', label: 'Root password', value: 'a1' },
      {
        name: 'postgresql_password',
        label: 'postgresql_password',
        value: 'b2',
      },
    ]);
    expect(toChatSecrets(null)).toEqual([]);
  });
});
