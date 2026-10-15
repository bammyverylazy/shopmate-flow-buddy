import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bot, CalendarDays, Check, CheckCheck, ChevronDown, GraduationCap, Leaf, LockKeyhole, ShieldCheck, Star, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import logo from '@/assets/logo_name_only.png.asset.json';
import portrait1 from '@/assets/mentor1.png.asset.json';
import portrait2 from '@/assets/mentor2.png.asset.json';
import food from '@/assets/food.png.asset.json';
import owner from '@/assets/shop_owner.png.asset.json';
import growing from '@/assets/Growing_home.gif.asset.json';
import improving from '@/assets/Improving_home.gif.asset.json';
import recovery from '@/assets/Recovery_home.gif.asset.json';
import growingPoster from '@/assets/Growing_home.gif.poster.png.asset.json';
import improvingPoster from '@/assets/Improving_home.gif.poster.png.asset.json';
import recoveryPoster from '@/assets/Recovery_home.gif.poster.png.asset.json';
import { contribution, defaultCosts, mentors, money, salesSummary, screenLabels, screens, skills, graduateEligible, houseState, matchAllowed, type Mentor, type Screen, type Skill } from './model';
import { SalesChart } from './SalesChart';
import { ChatComposer, ChatTranscript, type ChatMessage } from './ChatSurface';
import { Calculator } from './Calculator';
import { GraduateLoop } from './GraduateLoop';

function House({ state }: { state: 'growing' | 'improving' | 'recovery' }) {
  const assets = { growing: { animation: growing, poster: growingPoster }, improving: { animation: improving, poster: improvingPoster }, recovery: { animation: recovery, poster: recoveryPoster } };
  return <picture><source media="(prefers-reduced-motion: reduce)" srcSet={assets[state].poster.url}/><img src={assets[state].animation.url} alt={`Shop in the ${state} progress stage`}/></picture>;
}
function Avatar({ mentor }: { mentor: Mentor }) { return <img className="avatar" src={mentor.id === 'mentor1' ? portrait1.url : portrait2.url} alt={`${mentor.name} supplied portrait`}/>; }

export function Shopmate() {
  const [screen, setScreen] = useState<Screen | 'Opening'>('Opening');
  const [history, setHistory] = useState<(Screen | 'Opening')[]>([]);
  const [tab, setTab] = useState<'performance' | 'skills'>('performance');
  const [skill, setSkill] = useState<Skill>(skills[1]);
  const [skillDetail, setSkillDetail] = useState<Skill | null>(null);
  const [costs, setCosts] = useState(defaultCosts);
  const [missionComplete, setMissionComplete] = useState(false);
  const [mentoringReviewed, setMentoringReviewed] = useState(false);
  const [resultsReviewed, setResultsReviewed] = useState(false);
  const [applied, setApplied] = useState(false);
  const [mentor, setMentor] = useState<Mentor>(mentors[0]);
  const [opening, setOpening] = useState('');
  const [openingEdited, setOpeningEdited] = useState(false);
  const [coachMessages, setCoachMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState('2026-10-19');
  const [time, setTime] = useState('10:00');
  const [bookings, setBookings] = useState<Record<string, string>>({});
  const [why, setWhy] = useState<Mentor | null>(null);
  const [readiness, setReadiness] = useState(false);
  const [account, setAccount] = useState(false);
  const summary = salesSummary();
  const result = contribution(costs);
  const eligible = graduateEligible(missionComplete, mentoringReviewed, resultsReviewed);
  const state = houseState(missionComplete, eligible);
  const booking = bookings[mentor.id] || '';
  const handoff = `My shop has ${Math.abs(summary.orderChange).toFixed(1)}% fewer orders. I’d like help with ${skill.name.toLowerCase()}. ${result.valid ? `My proposed bundle price is ${money(Number(costs.price))}, with ${money(result.contribution)} contribution per order. ` : ''}What’s one practical next step?`;
  const displayedOpening = openingEdited ? opening : handoff;
  const shopMatch = { cuisine: 'Thai', deliveryZone: undefined };
  function go(next: Screen | 'Opening') { if (next === screen) return; setHistory(h => [...h, screen]); setScreen(next); window.scrollTo(0, 0); }
  function back() { const previous = history.at(-1); if (!previous) return; setScreen(previous); setHistory(h => h.slice(0, -1)); window.scrollTo(0, 0); }
  function selectSkill(selected: Skill) { if (selected.id !== skill.id) { setSkill(selected); setCoachMessages([]); setMissionComplete(false); setMentoringReviewed(false); setResultsReviewed(false); setApplied(false); } }
  function startChat() {
    setChats(c => { const existing = c[mentor.id]; return { ...c, [mentor.id]: existing?.length ? [{ role: 'owner', text: displayedOpening }, ...existing.slice(1)] : [
      { role: 'owner', text: displayedOpening },
      { role: 'guide', text: `Let’s focus on ${skill.name.toLowerCase()}. ${skill.response}` },
      { role: 'guide', text: 'For a lunch set, make the included items and price easy to see. Here’s a sample meal presentation.' },
    ] }; });
    go('MentorChat');
  }
  const next = (label: string, destination: Screen) => <Button className="primary-action" onClick={() => go(destination)}>{label}<ArrowRight/></Button>;
  const coachSample: ChatMessage[] = [{ role: 'owner', text: `Orders are down. Can you help with ${skill.name.toLowerCase()}?` }, { role: 'guide', text: skill.response }];
  const application = () => { if (eligible) setApplied(true); };
  return <div className="shopmate-shell">
    <header className="app-header"><img className="brand-logo" src={logo.url} alt="ShopMate"/>{screen === 'Opening' ? <Button variant="ghost" size="sm" onClick={() => go('ShopAlert')}>Skip intro<ArrowRight/></Button> : <Button className="account-control" variant="ghost" onClick={() => setAccount(true)} aria-label="Shop account"><span>Aunt Nid’s Kitchen</span><img src={owner.url} alt="Aunt Nid, shop owner"/></Button>}</header>
    {screen === 'Opening' ? <main className="opening"><h1>ShopMate</h1><p>Understand your shop. Find your next step.</p><div className="opening-art"><House state="growing"/></div><div className="opening-bottom">{next('Explore my shop', 'ShopAlert')}<p className="prototype-notice">Interactive prototype · Example business data</p></div></main> : <>
      <div className="journey-header"><Button variant="ghost" size="icon" aria-label="Back" title="Back" onClick={back}><ArrowLeft/></Button><span>{screenLabels[screens.indexOf(screen)]}</span></div>
      <main className={`screen-content updated-screen ${screen === 'MentorChat' ? 'chat-screen' : ''}`} key={screen}>
        {screen === 'ShopAlert' && <>
          <div className="alert-identity"><div><h1>Aunt Nid’s Kitchen</h1><p>Thai home-style meals</p></div><span className={`pill ${state === 'recovery' ? 'pill-warning' : ''}`}>{state === 'growing' ? 'Graduate preview' : state === 'improving' ? 'Mission completed' : 'Needs attention'}</span></div>
          <div className="alert-house"><House state={state}/></div>
          <h2 className="alert-headline">Fewer orders in recent weeks</h2><p className="lead">Latest 4 weeks vs. the preceding 4 weeks. The cause is still uncertain.</p>
          <div className="metrics"><div><span>Sales change</span><strong className="negative">−{Math.abs(summary.salesChange).toFixed(1)}%</strong><small>Recent comparison</small></div><div><span>Orders</span><strong>{summary.orders}</strong><small className="negative">−{Math.abs(summary.orderChange).toFixed(1)}%</small></div><div><span>Avg. order</span><strong>{money(summary.aov)}</strong><small>Order value</small></div></div>
          <SalesChart/><div className="screen-footer">{next('Understand your shop', 'ShopInsight')}</div>
        </>}
        {screen === 'ShopInsight' && <>
          <div className="tab-bar" role="tablist" aria-label="Shop insight"><Button role="tab" aria-selected={tab === 'performance'} variant={tab === 'performance' ? 'default' : 'ghost'} onClick={() => setTab('performance')}>Performance</Button><Button role="tab" aria-selected={tab === 'skills'} variant={tab === 'skills' ? 'default' : 'ghost'} onClick={() => setTab('skills')}>Skill Map</Button></div>
          <div role="tabpanel">{tab === 'performance' ? <><p className="period-caption">Sep 21 – Oct 18 · vs. Aug 24 – Sep 20</p><SalesChart/><div className="insight-summary"><TrendingDown size={19}/><div><h2>Fewer orders. Similar spending.</h2><p>Orders fell {Math.abs(summary.orderChange).toFixed(1)}%. Average order value stayed at {money(summary.aov)}.</p></div></div><div className="factor"><Leaf size={18}/><div><h3>A small bundle is one possibility</h3><p>Clearer menu visibility or a lunch set may help. Test one idea; the data doesn’t prove a cause.</p></div></div><Button className="skill-context-button" variant="ghost" onClick={() => setTab('skills')}>Focus: {skill.name}<ArrowUpRight/></Button></> : <><p className="period-caption">Illustrative skill scores · Not measured shop results</p><div className="skills-grid">{skills.map(s => <Button key={s.id} className={`skill-node ${skill.id === s.id ? 'skill-selected' : ''}`} variant="outline" onClick={() => { selectSkill(s); setSkillDetail(s); }}><span>{s.name}</span><strong>{s.score}<small> / 5</small></strong><em>{s.status}</em></Button>)}</div><p className="quiet-note">Promotion is the weakest illustrative area; pricing is an actionable starting point. Selected: {skill.name}.</p></>}</div>
          <div className="help-choices"><h2>How would you like us to help?</h2>{next('AI Coach', 'AICoachMission')}<Button className="secondary-action" variant="outline" onClick={() => go('MentorMatch')}>Talk to a Mentor<ArrowRight/></Button></div>
        </>}
        {screen === 'AICoachMission' && <>
          <div className="context-strip"><Leaf size={16}/><span>{skill.name}</span></div>
          <section className="coach-chat"><div className="section-heading"><Bot size={20}/><h2>AI Coach</h2><span className="demo-label">Simulated AI</span></div><ChatTranscript compact messages={[...coachSample, ...coachMessages]}/><ChatComposer label="Ask your coach…" onSend={text => setCoachMessages(m => [...m, { role: 'owner', text }, { role: 'guide', text: `${skill.response} ${result.valid ? `At ${money(Number(costs.price))}, modeled contribution is ${money(result.contribution)} per order.` : 'Correct the calculator inputs before checking contribution.'}` }])}/></section>
          <section className="five-minute-mission"><div className="mission-heading"><span className="pill"><Leaf size={13}/>5-minute mission</span>{missionComplete && <CheckCheck size={18}/>}</div><h2>{skill.mission}</h2><p>{skill.steps}</p><Button variant={missionComplete ? 'secondary' : 'default'} disabled={missionComplete} onClick={() => setMissionComplete(true)}>{missionComplete ? 'Mission completed' : 'Mark mission complete'}<Check/></Button><small>Records completion only, not a sales or profit improvement.</small></section>
          <Calculator costs={costs} setCosts={setCosts}/><div className="screen-footer">{next('Continue to mentors', 'MentorMatch')}</div>
        </>}
        {screen === 'MentorMatch' && <>
          <h1>Choose your mentor</h1><p className="lead">Support for {skill.name.toLowerCase()}.</p><p className="profile-notice">Illustrative profiles and match scores. Names, credentials, cuisine and delivery zones are not verified.</p>
          <div className="mentor-list">{mentors.filter(m => matchAllowed(shopMatch, {})).map(m => <article className="mentor-card" key={m.id}><div className="mentor-top"><Avatar mentor={m}/><div><h2>{m.name}</h2><p>{m.expertise}</p><div className="match-score">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={11}/>)}<b>{m.score} / 5</b></div></div></div><p className="mentor-reason">{m.reason}</p><div className="mentor-actions"><Button variant="ghost" size="sm" onClick={() => setWhy(m)}>Why this match?<ArrowUpRight/></Button><Button size="sm" onClick={() => { setMentor(m); go('MentorHandoff'); }}>Choose mentor<ArrowRight/></Button></div></article>)}</div><p className="quiet-note"><ShieldCheck size={17}/>Compatibility, not reviews. A shared cuisine AND delivery zone excludes a match; supplied profiles lack those facts, so this pairing is illustrative only.</p>
        </>}
        {screen === 'MentorHandoff' && <>
          <div className="handoff-person"><Avatar mentor={mentor}/><div><h1>{mentor.name}</h1><p>{mentor.expertise}</p><span className="demo-label">Illustrative profile</span></div></div>
          <section className="handoff-context"><h2>Your shop context</h2><p>Orders −{Math.abs(summary.orderChange).toFixed(1)}% · Avg. order {money(summary.aov)}</p><p>Focus: {skill.name}</p><p>{missionComplete ? 'Completed: ' : 'Next mission: '}{skill.mission}</p></section>
          <label className="message-label" htmlFor="opening-message">YOUR FIRST MESSAGE<span>Make it your own</span></label><textarea id="opening-message" className="opening-message" value={displayedOpening} onChange={e => { setOpening(e.target.value); setOpeningEdited(true); }} maxLength={500}/><p className="quiet-note">Your edited message becomes the first message in this local conversation.</p>
          <Button className="readiness" variant="ghost" onClick={() => setReadiness(true)}>{eligible ? <GraduationCap/> : <LockKeyhole/>}<span>Become a mentor<small>{eligible ? 'Graduate readiness reached in demo' : 'Locked until graduate readiness'}</small></span><ChevronDown/></Button>
          <div className="screen-footer"><Button className="primary-action" disabled={!displayedOpening.trim()} onClick={startChat}>Start conversation<ArrowRight/></Button></div>
        </>}
        {screen === 'MentorChat' && <>
          <div className="chat-identity"><Avatar mentor={mentor}/><div><h2>{mentor.name}</h2><p>{skill.name}</p></div><span className="demo-label">Simulated replies</span></div>
          <ChatTranscript messages={(chats[mentor.id] || []).slice(0, 3)}><div className="food-message"><img src={food.url} alt="Chicken rice set with soup and sauces"/><p>Sample menu presentation · Main, rice, soup and sauces</p></div>{(chats[mentor.id] || []).slice(3).length > 0 && <div className="continued-chat"><ChatTranscript compact messages={(chats[mentor.id] || []).slice(3)}/></div>}</ChatTranscript>
          <div className="chat-bottom"><ChatComposer label="Message your mentor…" onSend={text => setChats(c => ({ ...c, [mentor.id]: [...(c[mentor.id] || []), { role: 'owner', text }, { role: 'guide', text: `${skill.response} Record what happens during your test before changing the menu permanently.` }] }))}/><Button className="schedule-action" variant="outline" onClick={() => setSchedule(true)}><CalendarDays/>{booking ? 'View 15-minute call' : 'Schedule a 15-minute call'}<ArrowRight/></Button>{booking && <p className="booking-note"><CheckCheck size={14}/>Local demo confirmed · {booking}</p>}</div>
          <GraduateLoop missionComplete={missionComplete} mentoringReviewed={mentoringReviewed} resultsReviewed={resultsReviewed} eligible={eligible} applied={applied} onMentoring={() => setMentoringReviewed(true)} onResults={() => setResultsReviewed(true)} onApply={application}/>
        </>}
      </main>
    </>}
    <Dialog open={account} onOpenChange={setAccount}><DialogContent className="shopmate-modal"><DialogTitle>Aunt Nid’s Kitchen</DialogTitle><DialogDescription>Thai home-style meals · Current shop context</DialogDescription><div className="account-summary"><img src={owner.url} alt="Aunt Nid"/><div><p>{summary.orders} recent orders</p><p>Focus: {skill.name}</p><p>Progress: {state}</p></div></div></DialogContent></Dialog>
    <Dialog open={!!skillDetail} onOpenChange={open => { if (!open) setSkillDetail(null); }}><DialogContent className="shopmate-modal"><DialogTitle>{skillDetail?.name}</DialogTitle><DialogDescription>{skillDetail?.detail}</DialogDescription><p className="quiet-note">{skillDetail?.score} / 5 · Illustrative score, not a measured fact.</p><Button onClick={() => setSkillDetail(null)}>Use this focus<Check/></Button></DialogContent></Dialog>
    <Dialog open={!!why} onOpenChange={open => { if (!open) setWhy(null); }}><DialogContent className="shopmate-modal"><DialogTitle>Why {why?.name}?</DialogTitle><DialogDescription>{why?.detail}</DialogDescription><p className="quiet-note">Focus: {skill.name}. {why?.score} / 5 illustrative compatibility; not a review or verified recommendation.</p></DialogContent></Dialog>
    <Dialog open={readiness} onOpenChange={setReadiness}><DialogContent className="shopmate-modal"><DialogTitle>Become a mentor</DialogTitle><DialogDescription>{eligible ? 'Graduate readiness is reached in this local preview. You can record interest in helping the next cohort.' : 'Complete your five-minute mission, review mentoring notes and review test results to reach graduate readiness in this demo.'}</DialogDescription><div className="readiness-house"><House state={state}/></div><Button disabled={!eligible || applied} onClick={application}>{applied ? 'Demo interest recorded' : eligible ? 'Record demo mentor interest' : 'Not eligible yet'}{eligible ? <GraduationCap/> : <LockKeyhole/>}</Button><p className="quiet-note">No real application, business improvement or platform boost is implied.</p></DialogContent></Dialog>
    <Dialog open={schedule} onOpenChange={setSchedule}><DialogContent className="shopmate-modal"><DialogTitle>Schedule a 15-minute call</DialogTitle><DialogDescription>With {mentor.name}. Local demo only; no invite or real booking.</DialogDescription><label className="modal-label">Date<input type="date" value={date} min="2026-10-15" onChange={e => { setDate(e.target.value); setBookings(b => ({ ...b, [mentor.id]: '' })); }}/></label><fieldset className="time-options"><legend>Demo times</legend>{['10:00', '13:30', '16:00'].map(t => <Button key={t} variant={time === t ? 'default' : 'outline'} onClick={() => { setTime(t); setBookings(b => ({ ...b, [mentor.id]: '' })); }}>{t}</Button>)}</fieldset>{booking ? <div className="confirmation" role="status"><CheckCheck/><h3>Demo consultation confirmed</h3><p>{booking} · 15 minutes</p><small>No real booking has been made.</small></div> : <Button className="primary-action" disabled={!date || date < '2026-10-15'} onClick={() => setBookings(b => ({ ...b, [mentor.id]: `${date} at ${time}` }))}>Confirm demo consultation<Check/></Button>}<Button variant="ghost" onClick={() => setSchedule(false)}>{booking ? 'Done' : 'Cancel'}</Button></DialogContent></Dialog>
  </div>;
}
