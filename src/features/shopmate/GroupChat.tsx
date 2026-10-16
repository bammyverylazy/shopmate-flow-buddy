import { useEffect, useRef, type ReactNode } from 'react';
import { Flag, Users } from 'lucide-react';
import ownerImg from '@/assets/shop_owner.png';
import pimImg from '@/assets/people4.png';
import maiImg from '@/assets/people2.png';
import somchaiImg from '@/assets/people3.png';
import nokImg from '@/assets/people1.png';
import lunchBoxesImg from '@/assets/food2_packaging.jpg';
import platingImg from '@/assets/food_plating.png';
import priceBoardImg from '@/assets/food3_menu.jpg';
import { cohort, cohortSize, groupIntro, groupTopic, participantById, weeklyChallenge, type GroupMessage, type ImageKey, type MentorId, type ParticipantId } from './groupChatData';

const avatars: Record<ParticipantId, string> = { you: ownerImg, pim: pimImg, mai: maiImg, somchai: somchaiImg, nok: nokImg };
// Natural sizes of the supplied photos, so the browser reserves the right aspect ratio.
const photos: Record<ImageKey, { src: string; width: number; height: number }> = {
  lunchBoxes: { src: lunchBoxesImg, width: 600, height: 400 },
  plating: { src: platingImg, width: 440, height: 415 },
  priceBoard: { src: priceBoardImg, width: 480, height: 640 },
};

function PersonAvatar({ id, label }: { id: ParticipantId; label: string }) {
  return <img className="group-avatar" src={avatars[id]} alt={label} width={30} height={30} loading="lazy"/>;
}

/** Who is in the group: the user's shop and four simulated, related casual-food shops. */
export function CohortStrip({ mentorId, mentorName }: { mentorId: MentorId; mentorName: string }) {
  return <section className="cohort-strip" aria-label="Group members">
    <div className="cohort-head"><Users size={14}/><b>{cohortSize} shops</b><span>· guided by {mentorName}</span></div>
    <ul className="cohort-list">
      {cohort.map(p => <li key={p.id}><PersonAvatar id={p.id} label={`${p.owner}, owner of ${p.shop}`}/><span><b>{p.id === 'you' ? `${p.shop} (you)` : p.shop}</b><small>{p.concept}</small></span></li>)}
    </ul>
    <p className="demo-label">Sample cohort for the prototype. The other four shops and their owners are simulated, not real users, and the photos are sample images.</p>
    <p className="cohort-intro">{groupIntro[mentorId]}</p>
    <div className="topic-card"><span className="eyebrow">THIS WEEK</span><h3>{groupTopic.replace('Shop Challenge of the Week: ', '')}</h3></div>
  </section>;
}

export function GroupMessages({ messages, mentorId, mentorName, mentorAvatar }: { messages: GroupMessage[]; mentorId: MentorId; mentorName: string; mentorAvatar: ReactNode }) {
  const end = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } end.current?.scrollIntoView?.({ block: 'nearest' }); }, [messages.length]);
  return <div className="group-messages" aria-live="polite" aria-label="Group conversation">
    {messages.map(m => {
      const mine = m.from === 'you';
      const who = m.from === 'mentor' ? null : participantById(m.from);
      return <div key={m.id} className={`group-row ${mine ? 'is-mine' : ''}`}>
        {!mine && (m.from === 'mentor' ? <span className="group-avatar-wrap">{mentorAvatar}</span> : <PersonAvatar id={m.from} label={`${who!.owner}, ${who!.shop}`}/>)}
        <div className={`group-bubble ${m.from === 'mentor' ? 'is-mentor' : ''} ${m.challenge ? 'is-challenge' : ''}`}>
          <div className="group-meta"><b>{m.from === 'mentor' ? mentorName : mine ? 'You' : who!.owner}</b><span>{m.from === 'mentor' ? 'Mentor' : mine ? 'Aunt Nid’s Kitchen' : who!.shop}</span></div>
          {m.challenge && <span className="challenge-tag"><Flag size={11}/>Weekly challenge</span>}
          <p>{m.text}</p>
          {m.image && <figure className="group-photo"><img className={`photo-${m.image.key}`} src={photos[m.image.key].src} width={photos[m.image.key].width} height={photos[m.image.key].height} alt={m.image.alt} loading="lazy"/><figcaption>{m.image.caption}</figcaption></figure>}
        </div>
      </div>;
    })}
    <div ref={end}/>
    <span className="sr-only">Weekly challenge from {mentorName}: {weeklyChallenge[mentorId]}</span>
  </div>;
}
