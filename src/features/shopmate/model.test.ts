import { describe, expect, it } from 'vitest';
import { contribution, defaultCosts, salesSummary, change } from './model';
describe('README calculation rules', () => {
  it('estimates fee as selling price times fee percentage', () => { expect(contribution(defaultCosts).fee).toBe(1.95); });
  it('includes ingredients, packaging, other costs and fee in variable cost', () => { expect(contribution(defaultCosts).cost).toBe(33.95); });
  it('subtracts modeled variable costs from selling price', () => { expect(contribution(defaultCosts).contribution).toBeCloseTo(31.05); });
  it('calculates contribution margin as contribution divided by price times 100', () => { expect(contribution(defaultCosts).margin).toBeCloseTo(31.05 / 65 * 100); });
  it('does not divide by zero when selling price is zero', () => { expect(contribution({ ...defaultCosts, price: '0' }).margin).toBe(0); });
  it.each(['', '-1', 'abc', 'Infinity'])('rejects empty, negative or invalid cost %s', value => { expect(contribution({ ...defaultCosts, ingredients: value }).valid).toBe(false); });
  it('uses the same eight-week dataset for sales, orders and AOV', () => { const s = salesSummary(); expect(s.sales).toBe(20160); expect(s.orders).toBe(336); expect(s.aov).toBe(60); expect(s.salesChange).toBeCloseTo(-18.04878); });
  it('calculates sales change against the comparison period', () => { expect(change(80, 100)).toBe(-20); });
});