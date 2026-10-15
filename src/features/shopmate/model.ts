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
  { id: 'mentor1', name: 'Mentor 1', initials: 'M1', expertise: 'Menu & pricing discussion', score: 4.8, reason: 'Illustrative focus: presenting a simple bundle and reviewing its price.', detail: 'Sample compatibility only. Cuisine, delivery zone and professional credentials have not been provided.' },
  { id: 'mentor2', name: 'Mentor 2', initials: 'M2', expertise: 'Costs & operations discussion', score: 4.6, reason: 'Illustrative focus: reviewing variable costs and a manageable first test.', detail: 'Sample compatibility only. Cuisine, delivery zone and professional credentials have not been provided.' },
] as const;
export type Mentor = typeof mentors[number];

export const skills = [
  { id: 'menu', name: 'Product & Menu', score: 3.5, status: 'Strength', detail: 'A clear home-style menu is a useful starting point. Try grouping one main, rice and soup into a simple set.', mission: 'Draft one lunch bundle', steps: 'Choose a main, rice and soup. Write one clear menu line.', response: 'Draft one clear lunch set first. Check the price before offering it to customers.' },
  { id: 'pricing', name: 'Pricing & Cost Control', score: 2.5, status: 'Actionable', detail: 'Review ingredients, packaging and platform fees before choosing a price. This is an actionable first step.', mission: 'Check one bundle price', steps: 'Enter variable costs. Choose a price. Note the contribution.', response: 'Let’s check your variable costs and fees. The contribution estimate helps you choose a workable price.' },
  { id: 'promotion', name: 'Promotion', score: 1.5, status: 'Weakest area', detail: 'Menu visibility may be an opportunity. The score is illustrative, not measured from your shop.', mission: 'Write one lunch-set caption', steps: 'Name the set, included items and price in one short caption.', response: 'Try one plain-English caption that names every included item and the price. Don’t promise results yet.' },
  { id: 'customers', name: 'Customer Engagement', score: 3, status: 'Developing', detail: 'A short, friendly question can reveal what customers want without assuming a cause for the decline.', mission: 'Draft one customer question', steps: 'Write a friendly question asking what makes a lunch set useful.', response: 'Ask what customers find useful in a lunch set. Treat their replies as learning, not a guaranteed sales lift.' },
  { id: 'orders', name: 'Order Performance', score: 2, status: 'Opportunity', detail: 'Orders are down over the last four weeks. Track a small test without changing the historical sales numbers.', mission: 'Set up an order tracker', steps: 'Write down the test dates and a daily bundle-order count field.', response: 'Create a simple daily order tracker for your small test. Compare results before making a permanent change.' },
  { id: 'operations', name: 'Shop Operations', score: 4, status: 'Strength', detail: 'A small prep checklist can keep your first bundle manageable for the kitchen.', mission: 'Draft a bundle prep checklist', steps: 'List the main, rice, soup and packaging needed for one set.', response: 'Keep the first batch manageable. A short prep checklist helps make the bundle consistent.' },
] as const;
export type Skill = typeof skills[number];
export type MatchContext = { cuisine?: string; deliveryZone?: string };
export function matchAllowed(shop: MatchContext, mentor: MatchContext) {
  return !(shop.cuisine && mentor.cuisine && shop.deliveryZone && mentor.deliveryZone && shop.cuisine.toLowerCase().trim() === mentor.cuisine.toLowerCase().trim() && shop.deliveryZone.toLowerCase().trim() === mentor.deliveryZone.toLowerCase().trim());
}
export function graduateEligible(missionComplete: boolean, mentoringReviewed: boolean, resultsReviewed: boolean) { return missionComplete && mentoringReviewed && resultsReviewed; }
export function houseState(missionComplete: boolean, graduate: boolean) { return graduate ? 'growing' : missionComplete ? 'improving' : 'recovery'; }
export function earlyWarning(day: number, recentOrders: [number, number], comparableOrders: [number, number]) {
  const below = recentOrders.every((n, i) => n < (comparableOrders[i] ?? 0));
  const monitoring = day >= 30 || below;
  const comparable = comparableOrders[1];
  const deficit = comparable > 0 ? Math.max(0, (comparable - recentOrders[1]) / comparable * 100) : 0;
  const level = deficit <= 10 ? 'green' : deficit <= 30 ? 'yellow' : deficit <= 50 ? 'orange' : 'red';
  return { monitoring, deficit, level, alert: monitoring && level !== 'green' };
}