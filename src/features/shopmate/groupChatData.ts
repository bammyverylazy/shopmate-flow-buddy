// Group Mentor Chat content. Everything here is LOCAL, SCRIPTED and DETERMINISTIC: no AI service, no network.
// The cohort is a prepared set of casual food businesses. The four other shops and their owners are SIMULATED
// participants for demo purposes. They are not real users, and the sample photos do not prove real business results.
import type { Mentor } from './model';

export type MentorId = Mentor['id'];
export type ParticipantId = 'you' | 'pim' | 'mai' | 'somchai' | 'nok';
export type ImageKey = 'lunchBoxes' | 'plating' | 'priceBoard';
export type Participant = { id: ParticipantId; owner: string; shop: string; concept: string; challenge: string };

/** Five shops in total: the user's own shop plus four simulated, related casual-food shops. */
export const cohort: readonly Participant[] = [
  { id: 'you', owner: 'You', shop: 'Aunt Nid’s Kitchen', concept: 'Thai home-style one-dish meals', challenge: 'Fewer orders lately; testing a lunch bundle' },
  { id: 'pim', owner: 'Pim', shop: 'Pim’s Noodle House', concept: 'Noodle shop', challenge: 'Fewer repeat orders' },
  { id: 'mai', owner: 'Mai', shop: 'Mai’s Lunch Boxes', concept: 'Rice-meal and lunch-set shop', challenge: 'Unsure which lunch sets to promote' },
  { id: 'somchai', owner: 'Somchai', shop: 'Somchai’s Curry & Rice', concept: 'Curry-and-rice shop', challenge: 'Unsold food at the end of the day' },
  { id: 'nok', owner: 'Nok', shop: 'Nok’s Made-to-Order Kitchen', concept: 'Made-to-order rice dishes', challenge: 'Controlling ingredient costs' },
];
export const cohortSize = cohort.length;
export const participantById = (id: ParticipantId) => cohort.find(p => p.id === id)!;
export const peers: readonly ParticipantId[] = ['pim', 'mai', 'somchai', 'nok'];

export type GroupMessage = {
  id: string;
  from: 'mentor' | ParticipantId;
  text: string;
  image?: { key: ImageKey; alt: string; caption: string };
  challenge?: boolean;
};
type Draft = Omit<GroupMessage, 'id'>;
const withIds = (mentor: MentorId, drafts: Draft[]): GroupMessage[] => drafts.map((d, i) => ({ ...d, id: `${mentor}-seed-${i}` }));

export const groupTopic = 'Shop Challenge of the Week: How can we bring customers back?';

// Maya Chen: menu design and pricing. Reflective, presentation-led: questions about what customers notice, shared feedback on how things look.
const mayaScript: Draft[] = [
  { from: 'mentor', text: 'Welcome, everyone. This week’s challenge is how to bring customers back. Let’s begin with a question: when someone returns to your menu, what do they see first?' },
  { from: 'pim', text: 'My noodle shop is losing repeat orders. People try us once and I don’t see them again. I honestly don’t know what they remember about us.' },
  { from: 'mai', text: 'I had that with my lunch boxes. I listed nine sets and people kept asking me to choose for them. When I cut it to three, choosing felt easier.', image: { key: 'lunchBoxes', alt: 'Rows of lunch boxes with rice and roast pork, packed in clear containers', caption: 'Mai’s Set A, in the same box every day (sample photo)' } },
  { from: 'somchai', text: 'Mai, do you rename the sets? I have curry left over most evenings, and I’d love regulars to know what is freshest.' },
  { from: 'mentor', text: 'Notice what you share: each of you is asking what customers remember. Here is one small experiment. Choose one signature dish, give it a clear name and one good photo, and show it first.' },
  { from: 'nok', text: 'My tom yum shrimp rice is the one people talk about, but I’ve tucked it halfway down my menu.', image: { key: 'plating', alt: 'A plate of tom yum shrimp fried rice with lime and herbs', caption: 'Nok’s signature plate (sample photo)' } },
  { from: 'mentor', text: 'A favourite deserves the first line. Nok, what would a first-time customer say this plate is, in just five words?' },
  { from: 'somchai', text: 'Here is my price board. Is it too crowded to read at a glance?', image: { key: 'priceBoard', alt: 'A printed Thai menu board listing many dishes with prices and a few photos', caption: 'Somchai’s price board (sample photo)' } },
  { from: 'mentor', text: 'Good question for all of us. Look at your own board or menu for ten seconds. Which line do your eyes find first? Share what you notice.' },
  { from: 'mentor', text: 'Weekly challenge: pick one signature dish. Give it a clear name and one photo, and place it first. Next week, tell us what customers said.', challenge: true },
];

// Daniel Tan: cost control and operations. Structured and number-led: a fixed format, low-cost fixes, one number to track.
const danielScript: Draft[] = [
  { from: 'mentor', text: 'Welcome. This week’s challenge is how to bring customers back. We’ll keep it practical: 1) name the problem, 2) pick a fix that costs very little, 3) choose one number to track for 7 days.' },
  { from: 'pim', text: 'Problem: repeat orders are down at my noodle shop. I don’t track who comes back, so I’m guessing.' },
  { from: 'mai', text: 'I started a stamp card on my lunch boxes: five stamps, one free drink. It costs little and I can count the cards at the end of the week.', image: { key: 'lunchBoxes', alt: 'Rows of lunch boxes with rice and roast pork, packed in clear containers', caption: 'Mai’s lunch boxes, the set most people return for (sample photo)' } },
  { from: 'somchai', text: 'Mine is waste. By 7 pm I still have curry left. Would a last-portions price bring people back, or just teach them to wait?' },
  { from: 'nok', text: 'Careful with discounts. My shrimp rice has a high ingredient cost, and even a small price cut takes away most of my margin.', image: { key: 'plating', alt: 'A plate of tom yum shrimp fried rice with lime and herbs', caption: 'Nok’s shrimp rice, the dish with the highest ingredient cost (sample photo)' } },
  { from: 'mentor', text: 'Good point, Nok. Before any discount, check contribution per order: price minus ingredients, packaging and fees. The calculator on the AI Coach screen does this.' },
  { from: 'mentor', text: 'Experiment: offer a thank-you that costs under ฿5 per customer, such as a stamp or a small topping. Count repeat orders for 7 days. Somchai, put the last-portions price in writing and count how many portions sell.' },
  { from: 'somchai', text: 'Here is my board with the evening price at the bottom. Can you read it from the counter?', image: { key: 'priceBoard', alt: 'A printed Thai menu board listing many dishes with prices and a few photos', caption: 'Somchai’s price board (sample photo)' } },
  { from: 'mentor', text: 'Prices should be readable in three seconds. Put the evening price in the biggest print and keep the rest in a list.' },
  { from: 'mentor', text: 'Weekly challenge: keep one tally sheet of repeat orders for 7 days, and choose one thank-you that costs under ฿5. Post your count next week.', challenge: true },
];

export const groupScripts: Record<MentorId, Draft[]> = { maya: mayaScript, daniel: danielScript };
export const groupSeed = (mentor: MentorId): GroupMessage[] => withIds(mentor, groupScripts[mentor]);

export const groupIntro: Record<MentorId, string> = {
  maya: 'Maya guides this group with reflective questions and shared feedback on how your menu looks.',
  daniel: 'Daniel guides this group with a simple format: one problem, one low-cost fix, one number to track.',
};
export const weeklyChallenge: Record<MentorId, string> = {
  maya: 'Pick one signature dish, give it a clear name and one photo, and place it first.',
  daniel: 'Keep one tally sheet of repeat orders for 7 days and try one thank-you under ฿5.',
};

// ---- Replies to messages the user types (deterministic; chosen by how many messages the user has sent) ----
export type ReplyContext = { valid: boolean; price: string; contribution: string };

const mentorGroupReplies: Record<MentorId, ((c: ReplyContext) => string)[]> = {
  maya: [
    () => 'Thank you for sharing that. What would a first-time customer notice first on your menu? Try to say it in one sentence.',
    () => 'I like that. If a friend asked about your shop, which one dish would they name?',
    () => 'That is helpful for everyone. If you could change one photo or one dish name this week, which would it be?',
  ],
  daniel: [
    c => `Thanks. Next step: pick one number to track for 7 days. ${c.valid ? `At ${c.price}, your estimated contribution is ${c.contribution} per order, so keep it above zero while you test.` : 'Fix the calculator inputs first, then check your contribution per order.'}`,
    () => 'Good. Write the problem in one line, choose a fix that costs under ฿5 per customer, then count the result after 7 days.',
    () => 'Clear. Before you change a price, check the cost of the dish first. Then test the change on one dish for a week.',
  ],
};
const peerGroupReplies: Record<Exclude<ParticipantId, 'you'>, string[]> = {
  pim: ['That sounds familiar. In my noodle shop, I only notice repeat orders when I look at the weekly list. Do you check yours?', 'Thanks for sharing. I may try the same idea with my most popular bowl.'],
  mai: ['That could work in a lunch-set shop too. Keeping it simple helped me a lot.', 'Nice idea. Do your customers choose quickly, or do they ask what is best?'],
  somchai: ['I run a curry shop and we have the same question. What do you do with leftovers at closing time?', 'Good to hear. I might try that for my evening portions.'],
  nok: ['Thanks. I am watching ingredient cost on my made-to-order dishes, so I would check the numbers before copying it.', 'That is a useful angle. Did it change what you order from suppliers?'],
};
/** Replies to the user's n-th (1-based) group message: one from the mentor, one from a rotating peer. */
export function groupReplies(mentor: MentorId, n: number, ctx: ReplyContext): Draft[] {
  const mentorList = mentorGroupReplies[mentor];
  const peer = peers[(n - 1) % peers.length] as Exclude<ParticipantId, 'you'>;
  const peerList = peerGroupReplies[peer];
  return [
    { from: peer, text: peerList[Math.floor((n - 1) / peers.length) % peerList.length]! },
    { from: 'mentor', text: mentorList[(n - 1) % mentorList.length]!(ctx) },
  ];
}

// ---- One-to-one chat (Talk Individually): the same mentor and the same style as in the group ----
export const privateSeed: Record<MentorId, [string, string]> = {
  maya: [
    'Let’s begin with what your customers see. How would you describe your lunch bundle to a friend, in one sentence?',
    'Then we’ll look at the price together. A set that is clear and fairly priced is easier to choose.',
  ],
  daniel: [
    'Let’s start with the numbers. Your bundle should leave enough contribution after ingredients, packaging and fees.',
    'Here is the plan: 1) check cost in the calculator, 2) choose a price, 3) track bundle orders for 7 days.',
  ],
};
const privateReplies: Record<MentorId, ((c: ReplyContext) => string)[]> = {
  maya: [
    c => `That’s a thoughtful start. What would make a first-time customer choose the bundle in five seconds? One small step: name it clearly and add one photo. Your estimated contribution is ${c.valid ? c.contribution : 'still to check'} per order, so you have room to keep it simple.`,
    () => 'Thank you. When you picture the menu on a customer’s phone, which line stands out? Try moving your favourite dish to the top this week.',
    () => 'I like where this is going. What would you want a customer to say after their first bundle?',
  ],
  daniel: [
    c => `Keep the first test small. Track bundle orders for 7 days and review your ${c.valid ? c.contribution : 'estimated'} contribution per order before making it permanent.`,
    () => 'Good. Step 1: write down the cost of one bundle. Step 2: set the price. Step 3: count orders each day for a week.',
    () => 'Understood. Choose one number to watch, either bundle orders per day or contribution per order, and check it every evening.',
  ],
};
export function privateReply(mentor: MentorId, n: number, ctx: ReplyContext): string {
  const list = privateReplies[mentor];
  return list[(n - 1) % list.length]!(ctx);
}
export const privateChallenge: Record<MentorId, string> = {
  maya: 'Your small challenge this week: describe your bundle in one sentence and share it with me.',
  daniel: 'Your small challenge this week: write the bundle cost on paper and count orders for 7 days.',
};
