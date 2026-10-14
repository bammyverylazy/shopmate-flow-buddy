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
];
export type Mentor = typeof mentors[number];