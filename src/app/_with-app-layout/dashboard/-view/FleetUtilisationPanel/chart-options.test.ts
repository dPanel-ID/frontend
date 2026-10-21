import type { ScriptableContext } from 'chart.js';
import { describe, expect, it } from 'vitest';

import { isolatedPointRadius } from './chart-options';

function context(data: Array<number | null>, dataIndex: number) {
  return {
    dataset: { data },
    dataIndex,
  } as unknown as ScriptableContext<'line'>;
}

describe('isolatedPointRadius', () => {
  it('draws a dot for a lone reading, which a line cannot render', () => {
    // A freshly started server has one bucket; without the dot the chart
    // looks empty even though it holds data.
    expect(isolatedPointRadius(context([null, 12, null], 1))).toBeGreaterThan(
      0,
    );
  });

  it('draws a dot for a single reading at either end of the window', () => {
    expect(isolatedPointRadius(context([5, null, null], 0))).toBeGreaterThan(0);
    expect(isolatedPointRadius(context([null, null, 5], 2))).toBeGreaterThan(0);
  });

  it('leaves runs of readings as clean lines', () => {
    const data = [10, 20, 30];
    expect(isolatedPointRadius(context(data, 0))).toBe(0);
    expect(isolatedPointRadius(context(data, 1))).toBe(0);
    expect(isolatedPointRadius(context(data, 2))).toBe(0);
  });

  it('draws nothing where there is no reading', () => {
    expect(isolatedPointRadius(context([null, null], 0))).toBe(0);
  });
});
