export type Screen = 'ShopAlert' | 'ShopInsight' | 'AICoachMission' | 'MentorMatch' | 'MentorHandoff' | 'MentorChat';
export const screens: Screen[] = ['ShopAlert', 'ShopInsight', 'AICoachMission', 'MentorMatch', 'MentorHandoff', 'MentorChat'];
export const screenLabels = ['Shop Alert', 'Shop Insight', 'AI Coach & Mission', 'Mentor Match', 'Mentor Handoff', 'Mentor Chat'];
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
// Skill Map. ILLUSTRATIVE DEMO DATA: the prototype has no assessment or peer dataset.
// Only "Order Performance" is derived from the real weekly orders above; every other
// score and every "similar shops" baseline is a labeled placeholder, not a measurement.
// ---------------------------------------------------------------------------
export type SkillId = 'product' | 'pricing' | 'promotion' | 'engagement' | 'orders' | 'operations';
export type Skill = { id: SkillId; name: string; short: string; score: number; peers: number; meaning: string; strength: string; improve: string; next: string };
export const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));
export function skillList(): Skill[] {
  const orderScore = clampPct(100 + salesSummary().orderChange * 2);
  return [
    { id: 'product', name: 'Product & Menu', short: 'Menu', score: 74, peers: 70, meaning: 'How clear, appealing and easy to choose from your menu is.', strength: 'Your signature dishes are popular and easy to understand.', improve: 'Sets and bundles are not yet offered, so choosing takes more effort.', next: 'Pick one simple lunch set: a main dish, rice and a drink.' },
    { id: 'pricing', name: 'Pricing & Cost Control', short: 'Pricing', score: 68, peers: 66, meaning: 'Whether your prices leave enough money after ingredients, packaging and fees.', strength: 'Your example bundle leaves a healthy contribution per order.', improve: 'Costs are not yet tracked for every dish.', next: 'Use the calculator to check the price before you launch a bundle.' },
    { id: 'promotion', name: 'Promotion', short: 'Promotion', score: 41, peers: 58, meaning: 'How well nearby people hear about your shop and your offers.', strength: 'Regular customers already recommend you by word of mouth.', improve: 'Few posts or signs tell new customers what you offer.', next: 'Put your lunch set on a sign and one photo post this week.' },
    { id: 'engagement', name: 'Customer Engagement', short: 'Engagement', score: 52, peers: 60, meaning: 'How often customers come back, reply to you and feel looked after.', strength: 'Customers like how friendly you are in person.', improve: 'There is no easy way to thank or remind returning customers.', next: 'Offer a small thank-you, such as a free drink on the 5th visit.' },
    { id: 'orders', name: 'Order Performance', short: 'Orders', score: orderScore, peers: 72, meaning: 'How your order count is trending. This score is calculated from your recent weekly orders.', strength: 'Average order value is holding steady at ' + money(salesSummary().aov) + '.', improve: `Orders fell ${Math.abs(salesSummary().orderChange).toFixed(1)}% over the latest 4 weeks.`, next: 'Test one idea for 7 days and count the orders it brings.' },
    { id: 'operations', name: 'Shop Operations', short: 'Operations', score: 79, peers: 75, meaning: 'How smoothly you prepare and serve orders day to day.', strength: 'Orders go out steadily, even at busy times.', improve: 'Prep times rise a little at the lunch peak.', next: 'Prep sauces and sides before 11:00 to save time at lunch.' },
  ];
}
export type SkillLevel = 'strong' | 'developing' | 'needs-work';
export const skillLevel = (score: number): SkillLevel => score >= 70 ? 'strong' : score >= 50 ? 'developing' : 'needs-work';
export const skillLevelLabel: Record<SkillLevel, string> = { strong: 'Strong', developing: 'Developing', 'needs-work': 'Needs work' };
export const weakestSkill = (list: Skill[]) => list.reduce((a, b) => b.score < a.score ? b : a);

export type PeerMetric = { id: string; label: string; unit: string; shop: number | null; peers: number; higherIsBetter: boolean; note: string };
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
  return [
    { id: 'traffic', label: 'Customer traffic', unit: 'orders / week', shop: s.orders / 4, peers: 102, higherIsBetter: true, note: 'Real: your latest 4-week average.' },
    { id: 'sales', label: 'Sales', unit: '฿ / week', shop: s.sales / 4, peers: 6000, higherIsBetter: true, note: 'Real: your latest 4-week average.' },
    { id: 'repeat', label: 'Repeat customers', unit: '%', shop: 31, peers: 38, higherIsBetter: true, note: 'Demo value.' },
    { id: 'profit', label: 'Profit per order', unit: '฿', shop: profitPerOrder, peers: 28, higherIsBetter: true, note: 'Your calculator estimate for the lunch bundle.' },
    { id: 'prep', label: 'Prep time', unit: 'min', shop: 12, peers: 11, higherIsBetter: false, note: 'Demo value. Lower is better.' },
    { id: 'reviews', label: 'Positive reviews', unit: '%', shop: 88, peers: 87, higherIsBetter: true, note: 'Demo value.' },
  ];
}
