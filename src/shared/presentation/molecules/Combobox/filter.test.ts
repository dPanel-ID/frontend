import { describe, expect, it } from 'vitest';

import { filterComboboxItems } from './filter';

const regions = [
  {
    value: 'asia-southeast2',
    label: 'x',
    searchText: 'Jakarta asia-southeast2',
  },
  {
    value: 'asia-southeast1',
    label: 'x',
    searchText: 'Singapore asia-southeast1',
  },
  { value: 'us-central1', label: 'Iowa' },
];

describe('filterComboboxItems', () => {
  // The region list ignored typing.
  it('finds a region by its name, ignoring case', () => {
    expect(filterComboboxItems(regions, 'jakarta').map((i) => i.value)).toEqual(
      ['asia-southeast2'],
    );
  });

  it('finds an item by its value or plain-text label', () => {
    expect(filterComboboxItems(regions, 'southeast').length).toBe(2);
    expect(filterComboboxItems(regions, 'iowa').map((i) => i.value)).toEqual([
      'us-central1',
    ]);
  });

  it('keeps every item for an empty query', () => {
    expect(filterComboboxItems(regions, '  ')).toHaveLength(3);
  });

  it('needs every word to match', () => {
    expect(filterComboboxItems(regions, 'asia singapore')).toHaveLength(1);
  });
});
