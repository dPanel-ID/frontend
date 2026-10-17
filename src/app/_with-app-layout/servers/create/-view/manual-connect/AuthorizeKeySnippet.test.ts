import { describe, expect, it } from 'vitest';

import { buildAuthorizeKeyCommand } from './AuthorizeKeySnippet';

describe('buildAuthorizeKeyCommand', () => {
  it('appends the key to authorized_keys with safe permissions', () => {
    const command = buildAuthorizeKeyCommand(
      '  ssh-rsa AAAAB3Nza demo@laptop\n',
    );

    expect(command).toContain('mkdir -p ~/.ssh && chmod 700 ~/.ssh');
    expect(command).toContain(
      "echo 'ssh-rsa AAAAB3Nza demo@laptop' >> ~/.ssh/authorized_keys",
    );
    expect(command).toContain('chmod 600 ~/.ssh/authorized_keys');
  });

  it('escapes single quotes in the key comment', () => {
    expect(buildAuthorizeKeyCommand("ssh-ed25519 AAAAC3 o'brien")).toContain(
      "echo 'ssh-ed25519 AAAAC3 o'\\''brien' >> ~/.ssh/authorized_keys",
    );
  });
});
