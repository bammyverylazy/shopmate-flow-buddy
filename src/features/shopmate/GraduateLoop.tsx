import { Activity, ArrowDown, ArrowUp, Award, Check, Eye, RotateCcw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import shopImg from '@/assets/shop_image.png';
import { formatGradValue, gradChange, graduation } from './model';

function RisingBadge({ size = 'large' }: { size?: 'large' | 'small' }) {
  return <span className={`rising-badge rising-badge-${size}`} role="img" aria-label="Rising Shop badge"><Award size={size === 'large' ? 30 : 20}/></span>;
}

export function GraduateLoop({ mentorName, applyOpen, setApplyOpen, applied, onApply, onReplay }: {
  mentorName: string; applyOpen: boolean; setApplyOpen: (open: boolean) => void; applied: boolean; onApply: () => void; onReplay: () => void;
}) {
  return <>
    <section className="grad-hero" aria-label="Rising Shop">
      <RisingBadge/>
      <div className="grad-photo">
        <img src={shopImg} alt="Aunt Nid’s chicken rice shop front" />
        <div className="grad-overlay"/>
        <div className="grad-copy">
          <h1>You’re a Rising Shop!</h1>
          <p>{graduation.weeks} weeks in Shop Doctor · Recovery → Growing</p>
          <small>Mentored by {mentorName}</small>
        </div>
      </div>
    </section>

    <section className="grad-card" aria-label="Your shop’s progress">
      <h2>Your shop’s progress</h2>
      <div className="grad-table" role="table" aria-label="Week 0 compared with week 12">
        <div className="grad-row grad-head" role="row"><span role="columnheader">Metric</span><span role="columnheader">Week 0</span><span role="columnheader">Week 12</span><span role="columnheader">Change</span></div>
        {graduation.metrics.map(m => { const c = gradChange(m); return <div className="grad-row" role="row" key={m.id}>
          <span role="rowheader">{m.label}</span>
          <span role="cell">{formatGradValue(m.before, m.format)}</span>
          <b role="cell">{formatGradValue(m.after, m.format)}</b>
          <span role="cell" className={`grad-change ${c.improved ? 'is-better' : ''}`}>{c.diff > 0 ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}{c.text}<small className="sr-only">{c.improved ? ' (better)' : ''}</small></span>
        </div>; })}
      </div>
      <div className="grad-meta"><span><b>{graduation.missions}</b> missions completed</span><span><b>{graduation.calls}</b> mentor calls</span></div>
      <p className="demo-label">Sample prototype data for illustration. This is a before-and-after comparison, not proof that mentoring caused the change.</p>
    </section>

    <section className="grad-card" aria-label="Your rewards">
      <h2>Your rewards</h2>
      <ul className="reward-list">
        <li><span className="reward-icon"><Award size={18}/></span><div><h3>Rising Shop badge</h3><p>Show it on your menu or profile for 30 days.</p></div></li>
        <li><span className="reward-icon"><Eye size={18}/></span><div><h3>Extra visibility</h3><p>A visibility boost in search for 2 weeks.</p></div></li>
      </ul>
      <p className="grad-fine">Prototype rewards. Nothing changes in a live app or in real search results.</p>
    </section>

    <section className="grad-mentor" aria-label="Become a mentor">
      <span className="reward-icon"><Users size={18}/></span>
      <div><h2>Help the next shop like you</h2><p>Become a mentor for the next cohort and earn fee discounts, ad credits, and a Mentor badge.</p></div>
      <Button className="grad-apply" onClick={() => setApplyOpen(true)}>{applied ? 'View application' : 'Apply to mentor'}</Button>
    </section>

    <p className="early-warning"><Activity size={16}/><span>Shop Doctor keeps checking your shop health. If things slip, we’ll reach out first.</span></p>
    <p className="grad-fine grad-fine-center">Early Warning is shown as a prototype preview. No live monitoring is running.</p>
    <Button variant="ghost" className="grad-replay" onClick={onReplay}><RotateCcw size={14}/>Replay the demo from the start</Button>

    <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
      <DialogContent className="shopmate-modal">
        <DialogTitle>Apply to mentor</DialogTitle>
        <DialogDescription>Mentors guide shops in the next cohort. This is a local demo, so nothing is sent anywhere.</DialogDescription>
        <ul className="eligibility">
          <li><Check size={14}/>Finished the {graduation.weeks}-week program</li>
          <li><Check size={14}/>Completed {graduation.missions} missions</li>
          <li><Check size={14}/>Ready to give about an hour a week</li>
        </ul>
        {applied
          ? <div className="confirmation" role="status"><Check/><h3>Demo application submitted</h3><p>Saved on this screen only. You are not an approved mentor, and no real review will happen.</p></div>
          : <Button className="primary-action" onClick={onApply}>Submit demo application<Check/></Button>}
      </DialogContent>
    </Dialog>
  </>;
}
