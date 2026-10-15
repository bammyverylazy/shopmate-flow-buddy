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
});import { clampPct, peerDelta, peerMetrics, skillLevel, skillList, standing, weakestSkill } from './model';
describe('Skill Map', () => {
  it('keeps all six skill scores within 0–100', () => { const l = skillList(); expect(l).toHaveLength(6); l.forEach(s => { expect(s.score).toBeGreaterThanOrEqual(0); expect(s.score).toBeLessThanOrEqual(100); }); });
  it('derives Order Performance from real order change', () => { expect(skillList().find(s => s.id === 'orders')?.score).toBe(clampPct(100 + salesSummary().orderChange * 2)); });
  it('finds the weakest skill', () => { expect(weakestSkill(skillList()).id).toBe('promotion'); });
  it('classifies levels', () => { expect(skillLevel(70)).toBe('strong'); expect(skillLevel(69)).toBe('developing'); expect(skillLevel(49)).toBe('needs-work'); });
  it('treats lower-is-better metrics correctly', () => { expect(peerDelta(10, 11, false)).toBeGreaterThan(0); expect(peerDelta(12, 11, false)).toBeLessThan(0); expect(peerDelta(80, 100, true)).toBe(-20); });
  it('classifies standing with a ±5% band', () => { expect(standing(4.9)).toBe('around'); expect(standing(5)).toBe('above'); expect(standing(-5)).toBe('below'); });
  it('uses real traffic and sales averages', () => { const m = peerMetrics(31.05); expect(m.find(x => x.id === 'traffic')?.shop).toBe(84); expect(m.find(x => x.id === 'sales')?.shop).toBe(5040); });
});
