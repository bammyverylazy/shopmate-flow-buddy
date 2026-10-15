import { useCallback, useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCtor, speechErrorMessage, SPEECH_UNSUPPORTED, type Recognition } from './useSpeechInput';

type Phase = 'idle' | 'listening' | 'processing' | 'speaking' | 'muted' | 'paused' | 'error';
const LABELS: Record<Phase, string> = { idle: 'Ready when you are', listening: 'Listening…', processing: 'Thinking…', speaking: 'Speaking…', muted: 'Microphone muted', paused: 'Paused', error: 'Voice unavailable' };
const HINTS: Record<Phase, string> = {
  idle: 'Tap Start, then speak naturally.',
  listening: 'Go ahead, I’m listening.',
  processing: 'Preparing your coach’s reply.',
  speaking: 'Tap the orb to interrupt and speak.',
  muted: 'Unmute to keep talking.',
  paused: 'No speech detected. Tap the orb to continue.',
  error: 'You can close this and type in the chat instead.',
};
const MAX_SILENT_RETRIES = 3;

/**
 * Hands-free voice conversation with the AI Coach screen.
 * Technology: browser speech recognition (input) + browser speech synthesis (output). Not a real-time voice model.
 * Replies come from the same scripted coach logic as the text chat (no AI backend in this prototype).
 * Recognition is stopped while the coach speaks, so the coach's own voice is never transcribed.
 */
export function VoiceMode({ open, onClose, reply, onExchange }: {
  open: boolean;
  onClose: () => void;
  reply: (userText: string) => string;
  onExchange: (userText: string, coachText: string) => void;
}) {
  const [phase, setPhaseState] = useState<Phase>('idle');
  const [muted, setMuted] = useState(false);
  const [heard, setHeard] = useState('');
  const [said, setSaid] = useState('');
  const [notice, setNotice] = useState('');
  const [voiceName, setVoiceName] = useState('');

  const phaseRef = useRef<Phase>('idle');
  const activeRef = useRef(false);
  const mutedRef = useRef(false);
  const recRef = useRef<Recognition | null>(null);
  const timers = useRef<number[]>([]);
  const silentRetries = useRef(0);
  const replyRef = useRef(reply); replyRef.current = reply;
  const exchangeRef = useRef(onExchange); exchangeRef.current = onExchange;
  const respondRef = useRef<(text: string) => void>(() => {});

  const setPhase = useCallback((p: Phase) => { phaseRef.current = p; setPhaseState(p); }, []);
  const later = useCallback((fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); }, []);
  const synth = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined' ? window.speechSynthesis : undefined;
  const recognitionSupported = typeof window !== 'undefined' && !!getCtor();

  const stopRecognition = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    recRef.current = null;
    rec.onresult = null; rec.onerror = null; rec.onend = null;
    try { rec.abort(); } catch { /* already stopped */ }
  }, []);

  const teardown = useCallback(() => {
    activeRef.current = false;
    timers.current.forEach(t => window.clearTimeout(t)); timers.current = [];
    stopRecognition();
    synth?.cancel();
  }, [stopRecognition, synth]);

  const fail = useCallback((message: string) => { activeRef.current = false; stopRecognition(); setNotice(message); setPhase('error'); }, [setPhase, stopRecognition]);

  const listen = useCallback(() => {
    if (!activeRef.current) return;
    if (mutedRef.current) { setPhase('muted'); return; }
    const Ctor = getCtor();
    if (!Ctor) { fail(SPEECH_UNSUPPORTED); return; }
    stopRecognition();
    const rec = new Ctor();
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = true;
    let finalText = '';
    let handled = false;
    rec.onstart = () => { if (recRef.current === rec) { setHeard(''); setPhase('listening'); } };
    rec.onresult = e => {
      let text = ''; let isFinal = false;
      for (let i = 0; i < e.results.length; i++) { text += e.results[i][0].transcript; isFinal = e.results[i].isFinal; }
      setHeard(text.trim());
      if (isFinal) finalText = text.trim();
    };
    rec.onerror = e => {
      if (e.error === 'aborted') return;
      if (e.error === 'no-speech') return; // handled in onend
      fail(speechErrorMessage(e.error));
    };
    rec.onend = () => {
      if (recRef.current !== rec) return;
      recRef.current = null;
      if (!activeRef.current || handled) return;
      if (finalText) { handled = true; silentRetries.current = 0; respondRef.current(finalText); return; }
      silentRetries.current += 1;
      if (silentRetries.current >= MAX_SILENT_RETRIES) { silentRetries.current = 0; setPhase('paused'); return; }
      listen();
    };
    recRef.current = rec;
    try { rec.start(); } catch { recRef.current = null; fail(speechErrorMessage('')); }
  }, [fail, setPhase, stopRecognition]);

  const afterSpeaking = useCallback(() => { if (activeRef.current) listen(); }, [listen]);

  const speak = useCallback((text: string) => {
    setPhase('speaking');
    if (!synth) {
      setNotice('Spoken replies aren’t supported in this browser, so replies appear as text.');
      later(afterSpeaking, Math.max(2200, text.length * 55));
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en') && /female|samantha|zira|jenny|aria|google uk english female/i.test(v.name)) ?? voices.find(v => v.lang.startsWith('en'));
    if (voice) { u.voice = voice; u.lang = voice.lang; setVoiceName(voice.name); } else u.lang = 'en-US';
    u.rate = 0.98;
    u.onend = afterSpeaking;
    u.onerror = afterSpeaking;
    synth.speak(u);
  }, [afterSpeaking, later, setPhase, synth]);

  const respond = useCallback((userText: string) => {
    setPhase('processing');
    later(() => {
      if (!activeRef.current) return;
      const answer = replyRef.current(userText);
      exchangeRef.current(userText, answer);
      setSaid(answer);
      speak(answer);
    }, 700);
  }, [later, setPhase, speak]);

  respondRef.current = respond; // `listen` calls respond through this ref (they reference each other)

  function start() {
    setNotice(''); setHeard(''); setSaid('');
    if (!recognitionSupported) { fail(SPEECH_UNSUPPORTED); return; }
    activeRef.current = true; silentRetries.current = 0;
    listen();
  }
  function orbPress() {
    if (phaseRef.current === 'speaking') { synth?.cancel(); if (!synth) listen(); return; } // onend → listen()
    if (phaseRef.current === 'paused') { activeRef.current = true; listen(); }
    else if (phaseRef.current === 'idle') start();
  }
  function toggleMute() {
    const next = !mutedRef.current; mutedRef.current = next; setMuted(next);
    if (next) { stopRecognition(); if (phaseRef.current === 'listening' || phaseRef.current === 'paused') setPhase('muted'); }
    else if (phaseRef.current === 'muted' && activeRef.current) listen();
  }
  function end() { teardown(); mutedRef.current = false; setMuted(false); setPhase('idle'); onClose(); }

  useEffect(() => {
    if (open) { setPhase('idle'); setNotice(''); setHeard(''); setSaid(''); setMuted(false); mutedRef.current = false; }
    else teardown();
    return () => teardown();
  }, [open, setPhase, teardown]);

  const orbClass = `voice-orb voice-orb-${phase}`;
  const started = phase !== 'idle' && phase !== 'error';
  return <DialogPrimitive.Root open={open} onOpenChange={o => { if (!o) end(); }}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Content className="voice-sheet" aria-describedby="voice-desc">
        <div className="voice-top">
          <DialogPrimitive.Title className="voice-title">Voice conversation</DialogPrimitive.Title>
          <Button variant="ghost" size="icon" aria-label="Close voice conversation" title="Close" onClick={end}><X size={18}/></Button>
        </div>
        <div className="voice-body">
          <button type="button" className={orbClass} onClick={orbPress} aria-label={phase === 'speaking' ? 'Interrupt and speak' : phase === 'idle' ? 'Start voice conversation' : LABELS[phase]} disabled={phase === 'processing' || phase === 'listening' || phase === 'muted' || phase === 'error'}><span className="voice-orb-core"/></button>
          <h2 className="voice-name">Shopmate Coach</h2>
          <p id="voice-desc" className="voice-desc">Warm, practical guidance for your lunch-bundle step. Demo voice{voiceName ? ` · ${voiceName}` : ''}.</p>
          <p className={`voice-state voice-state-${phase}`} role="status" aria-live="polite"><span className="voice-state-label">{muted && phase !== 'idle' && phase !== 'error' && phase !== 'muted' ? `${LABELS[phase]} · mic muted` : LABELS[phase]}</span><span>{HINTS[phase]}</span></p>
          <div className="voice-captions" aria-live="polite">
            {heard && <p className="voice-you"><b>You</b>{heard}</p>}
            {said && phase !== 'listening' && <p className="voice-coach"><b>Coach</b>{said}</p>}
          </div>
          {notice && <p className="voice-notice" role="alert">{notice}</p>}
        </div>
        <div className="voice-controls">
          {!started ? <Button className="voice-start" onClick={start} disabled={phase === 'error' && !recognitionSupported}><Mic size={18}/>{phase === 'error' ? 'Try again' : 'Start conversation'}</Button>
            : <>
              <Button variant={muted ? 'destructive' : 'outline'} className="voice-mute" aria-pressed={muted} onClick={toggleMute}>{muted ? <MicOff size={17}/> : <Mic size={17}/>}{muted ? 'Unmute' : 'Mute'}</Button>
              <Button className="voice-end" variant="outline" onClick={end}><X size={17}/>End</Button>
            </>}
        </div>
        <p className="voice-footnote">Speech-to-text and text-to-speech run in your browser (some browsers use their own online speech service). Coach replies are scripted demo responses, not a live AI model. Messages are added to your chat.</p>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}
