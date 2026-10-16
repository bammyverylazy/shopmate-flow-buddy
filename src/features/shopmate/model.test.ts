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
  const SIGNALS = ['sales', 'profitability', 'prep', 'traffic', 'reviews', 'operations'];
  it('has exactly the six health signals in order, with unique ids and names', () => { const l = skillList(); expect(l.map(s => s.id)).toEqual(SIGNALS); expect(l.map(s => s.name)).toEqual(['Sales', 'Profitability', 'Preparation Time', 'Customer Traffic', 'Positive Reviews', 'Operations']); expect(new Set(l.map(s => s.short)).size).toBe(6); });
  it('keeps all six signal scores within 0–100', () => { skillList().forEach(s => { expect(s.score).toBeGreaterThanOrEqual(0); expect(s.score).toBeLessThanOrEqual(100); }); });
  it('uses the same six signals for the power bars', () => { expect(peerMetrics(31.05).map(m => m.id)).toEqual(SIGNALS); expect(peerMetrics(31.05).map(m => m.label)).toEqual(skillList().map(s => s.name)); });
  it('keeps each signal score direction consistent with its power bar', () => { const l = skillList(); peerMetrics(31.05).forEach(m => { const sk = l.find(s => s.id === m.id)!; const d = peerDelta(m.shop as number, m.peers, m.higherIsBetter); const st = standing(d); const gap = sk.score - sk.peers; expect(st === 'above' ? gap > 0 : st === 'below' ? gap < 0 : Math.abs(gap) < 5).toBe(true); }); });
  it('derives Sales and Customer Traffic from the real weekly data', () => { const s = salesSummary(); expect(skillList().find(x => x.id === 'sales')?.score).toBe(clampPct(100 + s.salesChange * 2)); expect(skillList().find(x => x.id === 'traffic')?.score).toBe(clampPct(100 + s.orderChange * 2.5)); });
  it('finds the weakest signal', () => { expect(weakestSkill(skillList()).id).toBe('traffic'); });
  it('classifies levels', () => { expect(skillLevel(70)).toBe('strong'); expect(skillLevel(69)).toBe('developing'); expect(skillLevel(49)).toBe('needs-work'); });
  it('treats lower-is-better metrics correctly', () => { expect(peerDelta(10, 11, false)).toBeGreaterThan(0); expect(peerDelta(12, 11, false)).toBeLessThan(0); expect(peerDelta(80, 100, true)).toBe(-20); });
  it('classifies standing with a ±5% band', () => { expect(standing(4.9)).toBe('around'); expect(standing(5)).toBe('above'); expect(standing(-5)).toBe('below'); });
  it('uses real traffic and sales averages', () => { const m = peerMetrics(31.05); expect(m.find(x => x.id === 'traffic')?.shop).toBe(84); expect(m.find(x => x.id === 'sales')?.shop).toBe(5040); });
});
import { gradChange, graduation } from './model';
describe('Graduate & Loop sample data', () => {
  it('counts lower preparation time as an improvement', () => { const prep = graduation.metrics.find(m => m.id === 'prep')!; const c = gradChange(prep); expect(c.text).toBe('−4 min'); expect(c.improved).toBe(true); });
  it('formats increases with a plus sign', () => { expect(gradChange(graduation.metrics[0]).text).toBe('+21'); expect(gradChange(graduation.metrics[1]).text).toBe('+฿770'); expect(gradChange(graduation.metrics[2]).text).toBe('+0.2'); });
});
import { cohort, cohortSize, groupReplies, groupScripts, groupSeed, peers, privateReply, privateSeed } from './groupChatData';
describe('Group Mentor Chat content', () => {
  it('has a small related cohort that includes the user shop', () => { expect(cohortSize).toBe(5); expect(cohort[0]!.id).toBe('you'); expect(new Set(cohort.map(c => c.shop)).size).toBe(5); expect(new Set(cohort.map(c => c.challenge)).size).toBe(5); });
  it('gives each mentor a different group script', () => { const m = groupScripts.maya.map(x => x.text); const d = groupScripts.daniel.map(x => x.text); expect(m[0]).not.toBe(d[0]); expect(m.filter(t => d.includes(t))).toHaveLength(0); });
  it('uses at most three inline images and every sender is a cohort member or the mentor', () => { (['maya', 'daniel'] as const).forEach(id => { const s = groupSeed(id); expect(s.filter(x => x.image).length).toBeLessThanOrEqual(3); expect(s.some(x => x.challenge)).toBe(true); s.forEach(x => expect(x.from === 'mentor' || cohort.some(c => c.id === x.from && c.id !== 'you')).toBe(true)); }); });
  it('never scripts words for the user', () => { expect(groupSeed('maya').some(x => x.from === 'you')).toBe(false); });
  it('replies deterministically and rotates peers', () => { const ctx = { valid: true, price: '฿65', contribution: '฿31.05' }; expect(groupReplies('daniel', 1, ctx)).toEqual(groupReplies('daniel', 1, ctx)); expect(groupReplies('maya', 1, ctx)[0]!.from).toBe(peers[0]); expect(groupReplies('maya', 2, ctx)[0]!.from).toBe(peers[1]); expect(groupReplies('daniel', 1, ctx)[1]!.text).toContain('฿31.05'); });
  it('keeps private styles distinct', () => { const ctx = { valid: true, price: '฿65', contribution: '฿31.05' }; expect(privateReply('maya', 1, ctx)).not.toBe(privateReply('daniel', 1, ctx)); expect(privateSeed.maya[0]).not.toBe(privateSeed.daniel[0]); });
});
