import { describe, expect, it } from 'vitest';

import { recipe } from './cloud.project.update.$id.credentials';

describe('cloud project credential update recipe', () => {
  it('posts the credential to the project credentials route', () => {
    expect(recipe({ id: '7', credential: { token: 'rotated-token' } })).toEqual(
      {
        method: 'POST',
        url: '/v1/cloud/project/update/7/credentials',
        data: { credential: { token: 'rotated-token' } },
      },
    );
  });

  it('encodes the project ID into the path', () => {
    expect(recipe({ id: '7/../8', credential: {} }).url).toBe(
      '/v1/cloud/project/update/7%2F..%2F8/credentials',
    );
  });
});
