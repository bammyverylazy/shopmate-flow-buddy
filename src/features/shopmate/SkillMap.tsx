import type { KeyboardEvent } from 'react';
import { ArrowRight, Bot, Check, CircleAlert, Flag, Minus, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { money, peerDelta, skillLevel, skillLevelLabel, standing, type PeerMetric, type Skill, type SkillId, type SkillLevel, type Standing } from './model';

const CX = 160, CY = 138, R = 82, LABEL_R = R + 17;
const angle = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
const at = (i: number, n: number, pct: number) => [CX + R * (pct / 100) * Math.cos(angle(i, n)), CY + R * (pct / 100) * Math.sin(angle(i, n))] as const;
const polygon = (values: number[]) => values.map((v, i) => at(i, values.length, v).join(',')).join(' ');
const levelIcon = (l: SkillLevel, size = 12) => l === 'strong' ? <Check size={size}/> : l === 'developing' ? <Minus size={size}/> : <CircleAlert size={size}/>;
const unitSuffix = (u: string) => u === '%' || u === '฿' ? '' : u.startsWith('฿') ? u.slice(1) : ` ${u}`;
const standingText: Record<Standing, string> = { above: 'Above similar shops', around: 'Around similar shops', below: 'Below similar shops' };
const standingIcon = (s: Standing) => s === 'above' ? <TrendingUp size={12}/> : s === 'below' ? <TrendingDown size={12}/> : <Minus size={12}/>;

function Radar({ skills, selected, onSelect }: { skills: Skill[]; selected: SkillId; onSelect: (id: SkillId) => void }) {
  const n = skills.length;
  const press = (id: SkillId) => (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } };
  return <div className="radar">
    <div className="radar-legend"><span><i className="swatch swatch-shop"/>Your shop</span><span><i className="swatch swatch-peers"/>Similar shops (demo)</span></div>
    <svg viewBox="0 0 320 276" role="group" aria-label="Skill map radar chart, scores from 0 to 100 percent. The same scores are listed below the chart.">
      {[25, 50, 75, 100].map(p => <polygon key={p} points={polygon(skills.map(() => p))} className="radar-ring"/>)}
      {skills.map((_, i) => { const [x, y] = at(i, n, 100); return <line key={i} x1={CX} y1={CY} x2={x} y2={y} className="radar-axis"/>; })}
      {[50, 100].map(p => <text key={p} x={CX + 3} y={CY - R * p / 100 + 9} className="radar-scale">{p}%</text>)}
      <polygon points={polygon(skills.map(s => s.peers))} className="radar-peers"/>
      <polygon points={polygon(skills.map(s => s.score))} className="radar-shop"/>
      {skills.map((s, i) => {
        const [px, py] = at(i, n, s.score);
        const cos = Math.cos(angle(i, n)), sin = Math.sin(angle(i, n));
        const lx = CX + LABEL_R * cos, ly = CY + LABEL_R * sin + (sin > 0.3 ? 6 : sin < -0.3 ? -2 : 3);
        const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle';
        const level = skillLevel(s.score);
        return <g key={s.id} role="button" tabIndex={0} aria-pressed={selected === s.id} aria-label={`${s.name}, ${s.score} percent, ${skillLevelLabel[level]}. Show details`} className={`radar-hit radar-${level} ${selected === s.id ? 'is-selected' : ''}`} onClick={() => onSelect(s.id)} onKeyDown={press(s.id)}>
          <circle cx={px} cy={py} r="17" className="radar-target"/>
          <circle cx={px} cy={py} r={selected === s.id ? 6 : 4.5} className="radar-dot"/>
          <text x={lx} y={ly} textAnchor={anchor} className="radar-label">{s.short}</text>
          <text x={lx} y={ly + 11} textAnchor={anchor} className="radar-value">{s.score}%</text>
        </g>;
      })}
    </svg>
  </div>;
}

export function SkillMap({ skills, weakest, selected, onSelect, metrics, onCoach, onMentor }: {
  skills: Skill[]; weakest: SkillId; selected: SkillId; onSelect: (id: SkillId) => void; metrics: PeerMetric[];
  onCoach: (skill: Skill) => void; onMentor: (skill: Skill) => void;
}) {
  const current = skills.find(s => s.id === selected) ?? skills[0]!;
  const level = skillLevel(current.score);
  const gap = current.score - current.peers;
  return <>
    <div className="eyebrow">YOUR SHOP SKILLS</div><h1>Where you’re strong.<br/>Where to grow.</h1>
    <p className="lead">Tap a skill to see what it means and what to try next.</p>
    <p className="demo-label"><CircleAlert size={13}/>Illustrative demo scores. They are not measured or verified. Order Performance is calculated from your real weekly orders.</p>
    <Radar skills={skills} selected={selected} onSelect={onSelect}/>
    <ul className="skill-list" aria-label="Skill scores">
      {skills.map(s => { const l = skillLevel(s.score); return <li key={s.id}><button type="button" className={`skill-row skill-${l} ${selected === s.id ? 'is-selected' : ''}`} aria-pressed={selected === s.id} onClick={() => onSelect(s.id)}>
        <span className="skill-name">{s.name}{s.id === weakest && <em className="start-here"><Flag size={10}/>Start here</em>}</span>
        <span className="skill-score">{s.score}%</span>
        <span className="skill-bar" aria-hidden="true"><i style={{ width: `${s.score}%` }}/><b style={{ left: `${s.peers}%` }}/></span>
        <span className={`level-tag level-${l}`}>{levelIcon(l, 11)}{skillLevelLabel[l]}</span>
      </button></li>; })}
    </ul>
    <section className="skill-detail" aria-live="polite" aria-label={`${current.name} details`}>
      <div className="skill-detail-head"><h2>{current.name}</h2><strong className={`level-${level}`}>{current.score}%</strong></div>
      <div className="skill-detail-tags"><span className={`level-tag level-${level}`}>{levelIcon(level, 11)}{skillLevelLabel[level]}</span>{current.id === weakest && <span className="start-here"><Flag size={10}/>Best place to start</span>}<span className="peer-note">Similar shops (demo): {current.peers}% · {gap === 0 ? 'same' : `${Math.abs(gap)} pts ${gap > 0 ? 'higher' : 'lower'}`}</span></div>
      <p className="skill-meaning">{current.meaning}</p>
      <dl>
        <div><dt><Check size={13}/>Doing well</dt><dd>{current.strength}</dd></div>
        <div><dt><CircleAlert size={13}/>Room to improve</dt><dd>{current.improve}</dd></div>
        <div><dt><ArrowRight size={13}/>Try this next</dt><dd>{current.next}</dd></div>
      </dl>
    </section>

    <section className="power-bars" aria-label="Shop power bars">
      <div className="power-head"><h3>Shop power bars</h3><span>vs shops like you</span></div>
      <p className="demo-label"><CircleAlert size={13}/>Comparison baselines are illustrative demo values, not data from real shops.</p>
      <div className="power-legend"><span><i className="swatch swatch-shop"/>Your shop</span><span><i className="tick-sample"/>Similar shops</span></div>
      <ul>
        {metrics.map(m => {
          const has = m.shop !== null && Number.isFinite(m.shop);
          const delta = has ? peerDelta(m.shop as number, m.peers, m.higherIsBetter) : 0;
          const st = standing(delta);
          const max = Math.max(m.peers, has ? (m.shop as number) : 0) * 1.2;
          const fmt = (v: number) => m.unit.startsWith('฿ ') ? money(Math.round(v)) : m.unit === '฿' ? money(Math.round(v * 100) / 100) : `${Math.round(v * 10) / 10}${m.unit === '%' ? '%' : ''}`;
          return <li key={m.id}>
            <div className="power-row-head"><span>{m.label}{!m.higherIsBetter && <small> (lower is better)</small>}</span>
              {has ? <b className={`standing standing-${st}`}>{standingIcon(st)}{delta > 0 ? '+' : delta < 0 ? '−' : ''}{Math.abs(Math.round(delta))}%</b> : <b className="standing standing-around">—</b>}</div>
            <div className="power-track" role="img" aria-label={has ? `${m.label}: you ${fmt(m.shop as number)}, similar shops ${fmt(m.peers)}. ${standingText[st]}.` : `${m.label}: not available`}><i className={`fill-${st}`} style={{ width: has ? `${Math.min(100, (m.shop as number) / max * 100)}%` : '0%' }}/><b style={{ left: `${m.peers / max * 100}%` }}/></div>
            <div className="power-row-foot"><span>You {has ? fmt(m.shop as number) : '—'} · Similar shops {fmt(m.peers)} {unitSuffix(m.unit)}</span><span>{has ? standingText[st] : 'Fix calculator inputs'}</span></div>
          </li>;
        })}
      </ul>
      <p className="quiet-note">Percentages compare you with the demo baseline. Plus is better, minus is worse, within 5% counts as around the same.</p>
    </section>

    <section className="help-prompt" aria-label="Get help">
      <h3>How would you like us to help?</h3>
      <p>{current.name} is selected. We’ll carry it into the next step.</p>
      <div className="cta-pair"><Button className="cta-button" onClick={() => onCoach(current)}><Bot size={17}/>AI Coach</Button><Button className="cta-button" variant="outline" onClick={() => onMentor(current)}><Users size={17}/>Ask Mentor</Button></div>
    </section>
  </>;
}
