import { useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, CalendarDays, Check, CheckCheck, ChevronDown, GraduationCap, Leaf, LockKeyhole, MessageCircle, Mic, RotateCcw, Send, ShieldCheck, Sparkles, Star, Store, TrendingDown, Users, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import growing from '@/assets/Growing_home.gif.asset.json';
import improving from '@/assets/Improving_home.gif.asset.json';
import recovery from '@/assets/Recovery_home.gif.asset.json';
import growingPoster from '@/assets/Growing_home.gif.poster.png.asset.json';
import improvingPoster from '@/assets/Improving_home.gif.poster.png.asset.json';
import recoveryPoster from '@/assets/Recovery_home.gif.poster.png.asset.json';
import { contribution, defaultCosts, mentors, money, peerMetrics, salesSummary, screens, screenLabels, skillList, weakestSkill, type Costs, type Mentor, type Screen, type Skill, type SkillId } from './model';
import { SkillMap } from './SkillMap';
import { GraduateLoop } from './GraduateLoop';
import { SalesChart } from './SalesChart';
import { VoiceMode } from './VoiceMode';
import foodImg from '@/assets/food.png';
import shopImg from '@/assets/shop_image.png';
import ownerImg from '@/assets/shop_owner.png';
import mentorMayaImg from '@/assets/mentor1.png';
import mentorDanielImg from '@/assets/mentor3.png';

type Message = { role: 'owner' | 'guide'; text: string };
function House({ state, alt }: { state: 'growing' | 'improving' | 'recovery'; alt: string }) {
  const assets = { growing: [growing, growingPoster], improving: [improving, improvingPoster], recovery: [recovery, recoveryPoster] };
  const [animation, poster] = assets[state];
  return <picture><source media="(prefers-reduced-motion: reduce)" srcSet={poster?.url}/><img src={animation?.url} alt={alt}/></picture>;
}
function Brand() { return <div className="brand"><span className="brand-mark"><Store size={21}/></span><span>shopmate<span className="brand-period">.</span></span></div>; }
const mentorPhotos: Record<Mentor['id'], string> = { maya: mentorMayaImg, daniel: mentorDanielImg };
function Avatar({ mentor, small = false }: { mentor: Mentor; small?: boolean }) { return <div className={`avatar avatar-${mentor.id} ${small ? 'avatar-small' : ''}`} role="img" aria-label={mentor.name}><img src={mentorPhotos[mentor.id]} alt="" loading="lazy"/></div>; }
function Composer({ onSend, label, onVoice }: { onSend: (text: string) => void; label: string; onVoice?: () => void }) {
  const [text, setText] = useState('');
  function submit(e: FormEvent) { e.preventDefault(); if (!text.trim()) return; onSend(text.trim()); setText(''); }
  return <form className={`composer ${onVoice ? 'composer-voice' : ''}`} onSubmit={submit}>
    <input aria-label={label} placeholder={label} value={text} onChange={e => setText(e.target.value)} maxLength={500}/>
    {onVoice && <Button type="button" size="icon" variant="outline" className="voice-button" aria-label="Voice conversation: talk with your coach" title="Voice: talk with your coach" onClick={onVoice}><Mic size={17}/></Button>}
    <Button type="submit" size="icon" disabled={!text.trim()} aria-label="Send message" title="Send message"><Send size={17}/></Button>
  </form>;
}
function Bubbles({ messages }: { messages: Message[] }) { return <div className="bubbles" aria-live="polite">{messages.map((m, i) => <div key={i} className={`bubble bubble-${m.role}`}>{m.text}</div>)}</div>; }

export function Shopmate() {
  const [screen, setScreen] = useState<Screen | 'Opening'>('Opening');
  const [costs, setCosts] = useState<Costs>(defaultCosts);
  const [mission, setMission] = useState(false);
  const [mentor, setMentor] = useState<Mentor>(mentors[0]);
  const defaultOpening = 'I’m considering a lunch bundle and would like help checking the cost and presenting it clearly to customers.';
  const [opening, setOpening] = useState(defaultOpening);
  const [viaInsight, setViaInsight] = useState(false);
  const [insightTab, setInsightTab] = useState<'performance' | 'skills'>('performance');
  const skills = skillList();
  const [skillId, setSkillId] = useState<SkillId>(() => weakestSkill(skillList()).id);
  const [focusSkill, setFocusSkill] = useState<Skill | null>(null);
  const announcedSkill = useRef<SkillId | null>(null);
  const autoOpening = useRef('');
  const history = useRef<(Screen | 'Opening')[]>([]);
  const [coachMessages, setCoachMessages] = useState<Message[]>([
    { role: 'owner', text: 'Orders have been lower. Could a lunch bundle help?' },
    { role: 'guide', text: 'It’s worth testing. Let’s check the cost and choose a price that leaves enough contribution.' },
  ]);
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [mentorApplied, setMentorApplied] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState('2026-10-19');
  const [time, setTime] = useState('10:00');
  const [booking, setBooking] = useState('');
  const [why, setWhy] = useState<Mentor | null>(null);
  const [readiness, setReadiness] = useState(false);
  const result = contribution(costs);
  const summary = salesSummary();
  // Same scripted coach reply for typed and spoken messages (this prototype has no AI backend).
  const coachReply = () => result.valid ? `At ${money(Number(costs.price))}, your estimated contribution is ${money(result.contribution)} per bundle. Try a small batch and track orders before changing the menu.` : 'Let’s correct the calculator inputs first, then check the contribution before testing a bundle.';
  const index = screen === 'Opening' ? -1 : screens.indexOf(screen);
  function go(next: Screen | 'Opening', back = false) {
    if (!back && screen !== next) history.current.push(screen);
    setScreen(next); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function goBack() {
    const previous = history.current.pop();
    go(previous ?? (index <= 0 ? 'Opening' : (screens[index - 1] ?? 'ShopAlert')), true);
  }
  // Open AI Coach from Shop Insight. A skill picked in the Skill Map is carried over as a focus note and one coach message.
  function openCoach(skill?: Skill) {
    setFocusSkill(skill ?? null);
    if (skill && announcedSkill.current !== skill.id) {
      announcedSkill.current = skill.id;
      setCoachMessages(m => [...m, { role: 'guide', text: `You picked ${skill.name} (${skill.score}% in the demo skill map). ${skill.improve} A good next step: ${skill.next}` }]);
    }
    go('AICoachMission');
  }
  // Ask Mentor from Shop Insight: carry the order-dip insight (and any picked skill) into the mentor flow,
  // but never overwrite a first message the user has edited.
  function askMentor(skill?: Skill) {
    setViaInsight(true);
    setFocusSkill(skill ?? null);
    const text = `My orders fell ${Math.abs(summary.orderChange).toFixed(1)}% recently while average order value stayed at ${money(summary.aov)}. ${skill ? `I’d like help with ${skill.name}, which is one of my weaker areas in the demo skill map. ` : ''}I’m considering a lunch bundle and would like help checking the cost and presenting it clearly to customers.`;
    if (opening === defaultOpening || opening === autoOpening.current) { autoOpening.current = text; setOpening(text); }
    go('MentorMatch');
  }
  const nextButton = (label: string, next: Screen, disabled = false) => <Button className="primary-action" disabled={disabled} onClick={() => go(next)}>{label}<ArrowRight size={18}/></Button>;
  const choose = (selected: Mentor) => { setMentor(selected); go('MentorHandoff'); };
  function startChat() {
    if (!chats[mentor.id]) setChats(c => ({ ...c, [mentor.id]: [
      { role: 'owner', text: opening },
      { role: 'guide', text: 'Let’s check the cost first. A bundle should be convenient for customers and still leave enough contribution for your shop.' },
      { role: 'guide', text: 'Present the included items and price clearly. A simple set like this is a good place to start.' },
    ] }));
    go('MentorChat');
  }

  return <div className="shopmate-shell">
    <header className="app-header"><Brand/>{screen === 'Opening' ? <Button variant="ghost" size="sm" onClick={() => go('ShopAlert')}>Skip intro<ArrowRight/></Button> : <span className="shop-tag"><span className="status-dot"/>Aunt Nid’s Kitchen</span>}</header>
    {screen === 'Opening' ? <main className="opening">
      <div className="opening-eyebrow"><Leaf size={14}/>A little support. A stronger shop.</div>
      <h1>Your shop.<br/>Your next chapter.</h1>
      <p>Understand your numbers, take one small step,<br className="desktop-break"/> and grow with someone in your corner.</p>
      <div className="opening-art"><House state="growing" alt="A thriving shop with a green roof and growing plants"/><span className="art-note"><Sparkles size={14}/>Good things start small</span></div>
      <div className="opening-path"><span><TrendingDown/>Find your signal</span><ArrowRight/><span><Leaf/>Take action</span><ArrowRight/><span><Users/>Get support</span></div>
      <div className="opening-bottom">{nextButton('Explore my shop', 'ShopAlert')}<p className="prototype-notice">Interactive prototype · Example business data</p></div>
    </main> : <>
      <div className="journey-header"><Button variant="ghost" size="icon" aria-label="Back" title="Back" onClick={goBack}><ArrowLeft/></Button><span>{screenLabels[index]}</span><span className="step-number">{index + 1}<span> / {screens.length}</span></span></div>
      <div className="step-track" aria-label={`Step ${index + 1} of ${screens.length}`}>{screens.map((s, i) => <span key={s} className={i <= index ? 'reached' : ''}/>)}</div>
      <main className={`screen-content ${screen === 'AICoachMission' ? 'coach-screen' : ''}`} key={screen}>
        {screen === 'ShopAlert' && <>
          <div className="eyebrow">YOUR SHOP, AT A GLANCE</div>
          <h1>A small dip.<br/>Let’s take action.</h1>
          <p className="lead">Your shop has seen fewer orders recently.<br/>Let’s take a closer look, together.</p>
          <img className="shop-front" src={shopImg} alt="Aunt Nid’s chicken rice shop front" loading="lazy"/>
          <div className="shop-status"><div><span className="pill pill-warning"><TrendingDown size={13}/>Needs attention</span><div className="owner-line"><img src={ownerImg} alt="Aunt Nid, shop owner" loading="lazy"/><div><h2>Aunt Nid’s Kitchen</h2><p>Thai home-style meals</p></div></div></div><House state="recovery" alt="Shop in the recovery stage"/></div>
          <div className="metrics"><div><span>Sales change</span><strong className="negative">−{Math.abs(summary.salesChange).toFixed(1)}%<TrendingDown size={17}/></strong><small>vs. previous 4 weeks</small></div><div><span>Orders</span><strong>{summary.orders}<small className="negative">−{Math.abs(summary.orderChange).toFixed(1)}%</small></strong><small>Latest 4 weeks</small></div><div><span>Avg. order</span><strong>{money(summary.aov)}</strong><small>Order value</small></div></div>
          <SalesChart/>
          <p className="quiet-note"><span className="note-line"/>Fewer orders, rather than lower order value, explain the sales dip. The cause is still uncertain.</p>
          <div className="screen-footer">{nextButton('Understand the trend', 'ShopInsight')}<span className="footer-caption">One small step at a time.</span></div>
        </>}
        {screen === 'ShopInsight' && <>
          <div className="insight-tabs" role="tablist" aria-label="Shop Insight view"><button type="button" role="tab" aria-selected={insightTab === 'performance'} onClick={() => setInsightTab('performance')}>Performance</button><button type="button" role="tab" aria-selected={insightTab === 'skills'} onClick={() => setInsightTab('skills')}>Skill Map</button></div>
          {insightTab === 'skills' ? <SkillMap skills={skills} weakest={weakestSkill(skills).id} selected={skillId} onSelect={setSkillId} metrics={peerMetrics(result.valid ? result.contribution : null)} onCoach={openCoach} onMentor={askMentor}/> : <>
          <div className="eyebrow">LOOKING BEYOND THE NUMBERS</div><h1>What’s behind<br/>the dip?</h1><p className="lead">Sep 21 – Oct 18 · vs. Aug 24 – Sep 20</p>
          <SalesChart/>
          <div className="insight-summary"><TrendingDown/><div><h2>Fewer orders. Similar spending.</h2><p>Orders fell {Math.abs(summary.orderChange).toFixed(1)}%, while average order value stayed at {money(summary.aov)}.</p></div></div>
          <h3 className="section-label">TWO POSSIBILITIES TO EXPLORE</h3>
          <div className="factor"><Utensils/><div><h3>Could a lunch bundle help?</h3><p>A clear, convenient set may make ordering easier.</p></div><span>01</span></div>
          <div className="factor"><Store/><div><h3>Is your menu getting noticed?</h3><p>Clearer photos and descriptions may help.</p></div><span>02</span></div>
          <p className="quiet-note"><ShieldCheck size={17}/>The trend doesn’t prove a cause. Test one idea and measure what happens.</p>
          <div className="screen-footer cta-pair"><Button className="cta-button" onClick={() => openCoach()}><Bot size={17}/>AI Coach</Button><Button className="cta-button" variant="outline" onClick={() => askMentor()}><Users size={17}/>Ask Mentor</Button></div>
          </>}
        </>}
        {screen === 'AICoachMission' && <>
          <div className="eyebrow">YOUR NEXT SMALL STEP</div><h1>Let’s make a plan.</h1>
          <section className="coach-chat"><div className="section-heading"><span className="icon-tile"><Bot size={18}/></span><h2>AI Coach</h2><span className="small-label">Lunch-bundle experiment</span></div>{focusSkill && <p className="focus-chip">Focus skill: <b>{focusSkill.name}</b> · {focusSkill.score}% (demo)</p>}<Bubbles messages={coachMessages}/><Composer label="Ask your coach…" onVoice={() => setVoiceOpen(true)} onSend={text => setCoachMessages(m => [...m, { role: 'owner', text }, { role: 'guide', text: coachReply() }])}/></section>
          <section className="calculator"><div className="section-heading"><h2>Will the price work?</h2><Button variant="ghost" size="icon" title="Reset example inputs" aria-label="Reset example inputs" onClick={() => setCosts(defaultCosts)}><RotateCcw size={15}/></Button></div>
            <div className="cost-inputs">{([['ingredients', 'Ingredients', '฿'], ['packaging', 'Packaging', '฿'], ['other', 'Other costs', '฿'], ['price', 'Selling price', '฿'], ['fee', 'Payment fee', '%']] as const).map(([key, label, unit]) => <label key={key}>{label}<div className="number-input"><span>{unit}</span><input aria-label={label} type="number" min="0" max={key === 'fee' ? 100 : undefined} step="0.1" value={costs[key]} onChange={e => setCosts(c => ({ ...c, [key]: e.target.value }))} aria-invalid={costs[key].trim() === '' || Number(costs[key]) < 0}/></div></label>)}</div>
            {!result.valid && <p className="input-error" role="alert">Enter valid, non-negative values. Fee must be 0–100%.</p>}
            <div className="cost-totals"><span>Modeled variable cost <b>{result.valid ? money(result.cost) : '—'}</b></span><span>Including fee <b>{result.valid ? money(result.fee) : '—'}</b></span></div>
            <div className={`contribution-result ${result.contribution < 0 ? 'loss' : ''}`}><div><span>Est. contribution / order</span><strong data-testid="contribution">{result.valid ? money(result.contribution) : '—'}</strong></div><div><span>Margin</span><strong>{result.valid ? `${result.margin.toFixed(1)}%` : '—'}</strong></div></div>
            <details className="calculation-details"><summary>How is this calculated?<ChevronDown size={13}/></summary><p>Fee = price × fee %. Variable cost = ingredients + packaging + other costs + fee. Contribution = price − variable cost. Margin = contribution ÷ price × 100 (0 when price is 0). Not net profit; fixed expenses are excluded.</p></details>
          </section>
          <section className="mission"><div><span className="eyebrow">{mission ? 'MISSION STARTED' : 'YOUR RECOMMENDED MISSION'}</span><h2>Test a lunch bundle</h2><p>Choose a set · Test for 7 days · Track bundle orders</p></div><House state={mission ? 'improving' : 'recovery'} alt={mission ? 'Shop improving as your mission begins' : 'Shop ready for its recovery mission'}/></section>
          <div className="screen-footer">{mission ? nextButton('Continue to mentors', 'MentorMatch', !result.valid) : <Button className="primary-action" disabled={!result.valid} onClick={() => setMission(true)}>Start this mission<ArrowRight/></Button>}</div>
        </>}
        {screen === 'MentorMatch' && <>
          <div className="eyebrow">YOU DON’T HAVE TO DO IT ALONE</div><h1>A little guidance.<br/>The right person.</h1><p className="lead">Two mentors for your lunch-bundle mission.</p>
          <div className="context-strip"><Leaf size={16}/><span>Test a lunch bundle</span><span>{focusSkill ? `Focus: ${focusSkill.short}` : mission ? 'Active mission' : viaInsight ? 'From your shop insight' : 'Active mission'}</span></div>
          <div className="mentor-list">{mentors.map(m => <article className="mentor-card" key={m.id}><div className="mentor-top"><Avatar mentor={m}/><div><h2>{m.name}</h2><p>{m.expertise}</p><div className="match-score"><Star size={13}/><b>{m.score} / 5</b><span>Compatibility</span></div></div>{m.id === 'maya' && <span className="top-match">Best fit</span>}</div><p className="mentor-reason">{m.reason}</p><div className="mentor-actions"><Button variant="ghost" size="sm" onClick={() => setWhy(m)}>Why this match?<ArrowUpRight size={13}/></Button><Button size="sm" onClick={() => choose(m)}>Choose mentor<ArrowRight size={13}/></Button></div></article>)}</div>
          <p className="quiet-note"><ShieldCheck size={17}/>Match scores estimate compatibility with your mission, not public review ratings.</p>
          <div className="support-note"><MessageCircle/><span>A fresh perspective can make<br/>your next step a little easier.</span></div>
        </>}
        {screen === 'MentorHandoff' && <>
          <div className="eyebrow">A GOOD PLACE TO START</div><h1>Meet your<br/>next-step partner.</h1>
          <div className="handoff-identity"><Avatar mentor={mentor}/><h2>{mentor.name}</h2><p>{mentor.expertise}</p><span className="pill"><Check size={13}/>Matched to your mission</span></div>
          <p className="handoff-reason">{mentor.reason}</p>
          <label className="message-label" htmlFor="opening-message">YOUR FIRST MESSAGE<span>Make it your own</span></label><textarea id="opening-message" className="opening-message" value={opening} onChange={e => setOpening(e.target.value)} maxLength={500}/>
          <div className="next-summary"><MessageCircle size={18}/><div><h3>Start with your lunch bundle</h3><p>Share the idea, check the price, choose a next step.</p></div></div>
          <Button className="readiness" variant="ghost" onClick={() => setReadiness(true)}><LockKeyhole size={16}/><span>Apply to Become a Mentor<small>Unlocks at the readiness stage</small></span><ChevronDown size={15}/></Button>
          <div className="screen-footer"><Button className="primary-action" disabled={!opening.trim()} onClick={startChat}>Open mentor chat<ArrowRight/></Button></div>
        </>}
        {screen === 'MentorChat' && <>
          <div className="chat-identity"><Avatar mentor={mentor} small/><div><h2>{mentor.name}</h2><p>{mentor.expertise}</p></div><MessageCircle size={20}/></div>
          <div className="chat-date">YOUR FIRST CONVERSATION</div>
          <div className="mentor-conversation"><Bubbles messages={(chats[mentor.id] || []).slice(0, 3)}/><div className="menu-example"><img className="menu-photo" src={foodImg} alt="Chicken rice set with soup and dipping sauces" loading="lazy"/><div><h3>Aunt Nid’s lunch bundle</h3><p>Main dish + rice + a refreshing drink</p><strong>{money(Number(costs.price) || 0)}</strong></div></div><p className="image-caption">Suggested menu layout · Make every included item clear</p><Bubbles messages={(chats[mentor.id] || []).slice(3)}/></div>
          <div className="chat-bottom"><Composer label="Message your mentor…" onSend={text => setChats(c => ({ ...c, [mentor.id]: [...(c[mentor.id] || []), { role: 'owner', text }, { role: 'guide', text: `Keep the first test small. Track bundle orders for 7 days and review your ${result.valid ? money(result.contribution) : 'estimated'} contribution per order before making it permanent.` }] }))}/><Button variant="outline" className="schedule-action" onClick={() => setSchedule(true)}><CalendarDays size={16}/>{booking ? 'View 15-minute call' : 'Schedule a 15-minute call'}<ArrowRight size={15}/></Button>{booking && <p className="booking-note"><CheckCheck size={14}/>Demo confirmed · {booking}</p>}<Button variant="ghost" className="finish-action" onClick={() => setFinishOpen(true)}><GraduationCap size={16}/>Finish 12-week program (demo)</Button></div>
        </>}
        {screen === 'GraduateLoop' && <GraduateLoop mentorName={mentor.name} applyOpen={applyOpen} setApplyOpen={setApplyOpen} applied={mentorApplied} onApply={() => setMentorApplied(true)} onReplay={() => go('Opening')}/>}
      </main>
    </>}
    <VoiceMode open={voiceOpen} onClose={() => setVoiceOpen(false)} reply={coachReply} onExchange={(user, coach) => setCoachMessages(m => [...m, { role: 'owner', text: user }, { role: 'guide', text: coach }])}/>
    <Dialog open={finishOpen} onOpenChange={setFinishOpen}><DialogContent className="shopmate-modal"><DialogTitle>Finish the mentoring program?</DialogTitle><DialogDescription>Demo shortcut: this skips ahead as if the 12-week program with {mentor.name} were complete. A single chat does not finish the program.</DialogDescription><Button className="primary-action" onClick={() => { setFinishOpen(false); go('GraduateLoop'); }}>Show my graduation<GraduationCap/></Button><Button variant="ghost" onClick={() => setFinishOpen(false)}>Keep chatting</Button></DialogContent></Dialog>
    <Dialog open={schedule} onOpenChange={setSchedule}><DialogContent className="shopmate-modal"><DialogTitle>A little time to talk</DialogTitle><DialogDescription>15 minutes with {mentor.name}. This is a local demo, not a real booking.</DialogDescription><label className="modal-label">Date<input type="date" value={date} min="2026-10-15" onChange={e => { setDate(e.target.value); setBooking(''); }}/></label><fieldset className="time-options"><legend>Available times</legend>{['10:00', '13:30', '16:00'].map(t => <Button key={t} variant={time === t ? 'default' : 'outline'} onClick={() => { setTime(t); setBooking(''); }}>{t}</Button>)}</fieldset>{booking ? <div className="confirmation" role="status"><CheckCheck/><h3>Demo consultation confirmed</h3><p>{booking} · 15 minutes</p><small>No real booking has been made.</small></div> : <Button className="primary-action" disabled={!date || date < '2026-10-15'} onClick={() => setBooking(`${date} at ${time}`)}>Confirm demo consultation<Check/></Button>}</DialogContent></Dialog>
    <Dialog open={!!why} onOpenChange={open => { if (!open) setWhy(null); }}><DialogContent className="shopmate-modal"><DialogTitle>Why {why?.name}?</DialogTitle><DialogDescription>{why?.detail}</DialogDescription><p className="quiet-note">{why?.score} / 5 estimated compatibility, based on your lunch-bundle mission.</p></DialogContent></Dialog>
    <Dialog open={readiness} onOpenChange={setReadiness}><DialogContent className="shopmate-modal"><DialogTitle>Grow into a mentor</DialogTitle><DialogDescription>This unlocks when your shop reaches a readiness stage: complete your experiment, review the results, and build experience you can share.</DialogDescription><div className="readiness-house"><House state="growing" alt="Growing shop representing future mentor readiness"/></div><p className="quiet-note"><LockKeyhole size={16}/>Not eligible yet. No application has been submitted.</p></DialogContent></Dialog>
  </div>;
}