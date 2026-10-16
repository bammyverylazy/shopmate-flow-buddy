export type Screen = 'ShopAlert' | 'ShopInsight' | 'AICoachMission' | 'MentorMatch' | 'MentorHandoff' | 'MentorChat' | 'GraduateLoop';
export const screens: Screen[] = ['ShopAlert', 'ShopInsight', 'AICoachMission', 'MentorMatch', 'MentorHandoff', 'MentorChat', 'GraduateLoop'];
export const screenLabels = ['Shop Alert', 'Shop Insight', 'AI Coach & Mission', 'Mentor Match', 'Mentor Handoff', 'Mentor Chat', 'Graduate & Loop'];
export const weeklyData = [
  { week: 'Aug 24', sales: 6000, orders: 100 }, { week: 'Aug 31', sales: 6300, orders: 105 },
  { week: 'Sep 7', sales: 6120, orders: 102 }, { week: 'Sep 14', sales: 6180, orders: 103 },
  { week: 'Sep 21', sales: 5520, orders: 92 }, { week: 'Sep 28', sales: 5160, orders: 86 },
  { week: 'Oct 5', sales: 4920, orders: 82 }, { week: 'Oct 12', sales: 4560, orders: 76 },
];
export function change(current: number, previous: number) { return previous > 0 ? (current - previous) / previous * 100 : 0; }
export function salesSummary() {
  const previous = weeklyData.slice(0, 4).reduce((a, w) => ({ sales: a.sales + w.sales, orders: a.orders + w.orders }), { sales: 0, orders: 0 });
  const current = weeklyData.slice(4).reduce((a, w) => ({ sales: a.sales + w.sales, orders: a.orders + w.orders }), { sales: 0, orders: 0 });
  return { ...current, salesChange: change(current.sales, previous.sales), orderChange: change(current.orders, previous.orders), aov: current.orders > 0 ? current.sales / current.orders : 0, previous };
}
export const defaultCosts = { ingredients: '25', packaging: '5', other: '2', price: '65', fee: '3' };
export type Costs = typeof defaultCosts;
export function contribution(inputs: Costs) {
  const entries = Object.values(inputs);
  const valid = entries.every(v => v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0) && Number(inputs.fee) <= 100;
  if (!valid) return { valid: false, fee: 0, cost: 0, contribution: 0, margin: 0 };
  const fee = Number(inputs.price) * Number(inputs.fee) / 100;
  const cost = Number(inputs.ingredients) + Number(inputs.packaging) + Number(inputs.other) + fee;
  const amount = Number(inputs.price) - cost;
  const margin = Number(inputs.price) > 0 ? amount / Number(inputs.price) * 100 : 0;
  if (![fee, cost, amount, margin].every(Number.isFinite)) return { valid: false, fee: 0, cost: 0, contribution: 0, margin: 0 };
  return { valid: true, fee, cost, contribution: amount, margin };
}
export const money = (value: number) => `฿${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
export const mentors = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', expertise: 'Menu design & pricing', score: 4.8, reason: 'Turns everyday meals into clear, fairly priced bundles.', detail: 'A strong fit for your lunch-bundle experiment, combining menu presentation with practical pricing checks.' },
  { id: 'daniel', name: 'Daniel Tan', initials: 'DT', expertise: 'Cost control & operations', score: 4.6, reason: 'Helps small kitchens protect contribution on every order.', detail: 'A strong fit for reviewing ingredients, packaging and fees before you launch your bundle.' },
] as const;
export type Mentor = typeof mentors[number];
// ---------------------------------------------------------------------------
// Skill Map: six shop health signals. ILLUSTRATIVE DEMO DATA: the prototype has no assessment or peer dataset.
// Sales and Customer Traffic scores are derived from the real weekly data above; every other score and every
// "similar shops" baseline is a labeled placeholder, not a measurement. Each signal id is shared with its power bar
// in peerMetrics() below, so radar, list, detail card and power bars always describe the same six signals.
// ---------------------------------------------------------------------------
export type SkillId = 'sales' | 'profitability' | 'prep' | 'traffic' | 'reviews' | 'operations';
export type Skill = { id: SkillId; name: string; short: string; score: number; peers: number; meaning: string; strength: string; improve: string; next: string };
export const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
export function skillList(): Skill[] {
  const s = salesSummary();
  const salesScore = clampPct(100 + s.salesChange * 2);
  const trafficScore = clampPct(100 + s.orderChange * 2.5);
  return [
    { id: 'sales', name: 'Sales', short: 'Sales', score: salesScore, peers: 75, meaning: 'How much money your shop takes in each week. This score is calculated from your recent weekly sales.', strength: 'Average order value is holding steady at ' + money(s.aov) + '.', improve: `Sales fell ${Math.abs(s.salesChange).toFixed(1)}% over the latest 4 weeks.`, next: 'Try one lunch set to lift the value of each order.' },
    { id: 'profitability', name: 'Profitability', short: 'Profit', score: 72, peers: 66, meaning: 'Whether each order leaves enough money after ingredients, packaging and fees.', strength: 'Your example bundle leaves a healthy contribution per order.', improve: 'Costs are not yet tracked for every dish.', next: 'Use the calculator to check the price before you launch a bundle.' },
    { id: 'prep', name: 'Preparation Time', short: 'Prep time', score: 60, peers: 68, meaning: 'How quickly orders are ready after they come in. Shorter is better.', strength: 'Orders go out steadily on quieter days.', improve: 'Prep times rise a little at the lunch peak.', next: 'Prep sauces and sides before 11:00 to save time at lunch.' },
    { id: 'traffic', name: 'Customer Traffic', short: 'Traffic', score: trafficScore, peers: 72, meaning: 'How many customers order from you each week. This score is calculated from your recent weekly orders.', strength: 'Regular customers already recommend you by word of mouth.', improve: `Orders fell ${Math.abs(s.orderChange).toFixed(1)}% over the latest 4 weeks.`, next: 'Test one idea for 7 days and count the orders it brings.' },
    { id: 'reviews', name: 'Positive Reviews', short: 'Reviews', score: 82, peers: 80, meaning: 'How many of your customer reviews are positive.', strength: 'Customers like how friendly you are and how your food tastes.', improve: 'Few customers are asked to leave a review.', next: 'Add a small thank-you card asking happy customers for a review.' },
    { id: 'operations', name: 'Operations', short: 'Operations', score: 78, peers: 75, meaning: 'How reliably your shop runs, including order cancellations and uptime (staying open and online).', strength: 'Your shop stays open and online during busy times.', improve: 'A few orders are cancelled when items run out at the lunch peak.', next: 'Check stock before the lunch rush and mark sold-out items early.' },
  ];
}
export type SkillLevel = 'strong' | 'developing' | 'needs-work';
export const skillLevel = (score: number): SkillLevel => score >= 70 ? 'strong' : score >= 50 ? 'developing' : 'needs-work';
export const skillLevelLabel: Record<SkillLevel, string> = { strong: 'Strong', developing: 'Developing', 'needs-work': 'Needs work' };
export const weakestSkill = (list: Skill[]) => list.reduce((a, b) => b.score < a.score ? b : a);

export type PeerMetric = { id: string; label: string; unit: string; shop: number | null; peers: number; higherIsBetter: boolean; note: string; hint?: string };
export type Standing = 'above' | 'around' | 'below';
/** % difference vs. the baseline from the owner's point of view: positive is always better, even where lower is better. */
export function peerDelta(shop: number, peers: number, higherIsBetter: boolean) {
  if (!(peers > 0) || !Number.isFinite(shop)) return 0;
  const raw = (shop - peers) / peers * 100;
  return higherIsBetter ? raw : -raw;
}
export const standing = (delta: number): Standing => delta >= 5 ? 'above' : delta <= -5 ? 'below' : 'around';
export function peerMetrics(profitPerOrder: number | null): PeerMetric[] {
  const s = salesSummary();
  // Same six signals, in the same order, as skillList().
  return [
    { id: 'sales', label: 'Sales', unit: '฿ / week', shop: s.sales / 4, peers: 6000, higherIsBetter: true, note: 'Real: your latest 4-week average.' },
    { id: 'profitability', label: 'Profitability', unit: '฿ / order', shop: profitPerOrder, peers: 28, higherIsBetter: true, note: 'Your calculator estimate for the lunch bundle.' },
    { id: 'prep', label: 'Preparation Time', unit: 'min', shop: 12, peers: 11, higherIsBetter: false, note: 'Demo value. Lower is better.' },
    { id: 'traffic', label: 'Customer Traffic', unit: 'orders / week', shop: s.orders / 4, peers: 102, higherIsBetter: true, note: 'Real: your latest 4-week average.' },
    { id: 'reviews', label: 'Positive Reviews', unit: '%', shop: 88, peers: 87, higherIsBetter: true, note: 'Demo value.' },
    { id: 'operations', label: 'Operations', hint: 'cancellations & uptime', unit: '%', shop: 95, peers: 92, higherIsBetter: true, note: 'Demo value: combined cancellation and uptime reliability.' },
  ];
}

// ---------------------------------------------------------------------------
// Graduate & Loop. SAMPLE PROTOTYPE DATA: the app does not track a 12-week program, so these before/after
// figures are illustrative, not verified business results, and do not show that mentoring caused the change.
// ---------------------------------------------------------------------------
export const graduation = {
  weeks: 12, missions: 9, calls: 6,
  metrics: [
    { id: 'orders', label: 'Orders per week', before: 37, after: 58, format: 'number', higherIsBetter: true },
    { id: 'profit', label: 'Profit per week', before: 1260, after: 2030, format: 'money', higherIsBetter: true },
    { id: 'rating', label: 'Customer rating', before: 4.4, after: 4.6, format: 'rating', higherIsBetter: true },
    { id: 'prep', label: 'Preparation time', before: 18, after: 14, format: 'minutes', higherIsBetter: false },
  ],
} as const;
export type GradMetric = typeof graduation.metrics[number];
export function formatGradValue(value: number, format: GradMetric['format']) {
  switch (format) {
    case 'money': return money(value);
    case 'rating': return value.toFixed(1);
    case 'minutes': return `${value} min`;
    default: return String(value);
  }
}
export function gradChange(m: Pick<GradMetric, 'before' | 'after' | 'format' | 'higherIsBetter'>) {
  const diff = m.after - m.before;
  const text = `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${formatGradValue(Math.abs(Number(diff.toFixed(1))), m.format)}`;
  const improved = m.higherIsBetter ? diff > 0 : diff < 0;
  return { text, improved, diff };
}
