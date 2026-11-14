import type { ComboboxItem } from './Combobox';

/**
 * Items whose search text, label (when it is text) or value contains every
 * word typed, ignoring letter case: "jakarta" and "southeast2" both find
 * "Jakarta (asia-southeast2)".
 */
export function filterComboboxItems<V>(
  items: Array<ComboboxItem<V>>,
  query: string,
) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return items;

  return items.filter((item) => {
    const haystack = [
      item.searchText,
      typeof item.label === 'string' ? item.label : undefined,
      String(item.value),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
