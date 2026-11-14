import { describe, expect, it } from 'vitest';

import type { DTOs } from '@/shared/api';

import { toDnsRecordPage } from './from-dto';

function listResponse(
  result: DTOs.DomainRecordItemV1[] | null,
  total: number,
): DTOs.DomainRecordListResponseV1 {
  return {
    result: result as DTOs.DomainRecordItemV1[],
    success: true,
    errors: [],
    messages: [],
    result_info: {
      page: 1,
      per_page: 20,
      count: result?.length ?? 0,
      total_count: total,
      total_pages: total ? 1 : 0,
    },
  };
}

describe('toDnsRecordPage', () => {
  it('reads one page of records and its totals', () => {
    const page = toDnsRecordPage(
      listResponse(
        [
          {
            id: 'r1',
            type: 'A',
            name: 'docs-demo.terpusat.me',
            content: '103.183.75.207',
            ttl: 300,
          },
        ],
        1,
      ),
    ).unwrap();

    expect(page.records).toEqual([
      expect.objectContaining({ id: 'r1', name: 'docs-demo.terpusat.me' }),
    ]);
    expect(page.total).toBe(1);
  });

  // A search with no match comes back as `result: null`.
  it('treats a null result as no records', () => {
    const page = toDnsRecordPage(listResponse(null, 0)).unwrap();

    expect(page.records).toEqual([]);
    expect(page.totalPage).toBe(0);
  });
});
