import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal typings for the browser Web Speech API (not part of lib.dom in every TS version).
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type RecognitionErrorEvent = { error: string };
export interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

export function getCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function speechErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed': return 'Microphone access is blocked. Allow it in your browser settings, or type your message instead.';
    case 'no-speech': return 'We didn’t hear anything. Tap Voice and try again, or type your message.';
    case 'audio-capture': return 'No microphone was found. Check your device, or type your message instead.';
    case 'network': return 'Speech recognition is unavailable right now. Please type your message instead.';
    case 'language-not-supported': return 'This browser can’t recognize English speech. Please type your message instead.';
    default: return 'Voice input stopped unexpectedly. Please try again or type your message.';
  }
}

export const SPEECH_UNSUPPORTED = 'Voice input isn’t supported in this browser. Try Chrome, Edge or Safari, or type your message.';

/**
 * Speech-to-text only (not a two-way voice conversation). Transcribed text is handed to `onText`
 * so it can be placed in the chat input for review; nothing is ever sent automatically.
 * Microphone permission is requested by the browser only when `start()` is called.
 */
export function useSpeechInput(onText: (transcript: string) => void) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const ref = useRef<Recognition | null>(null);
  const cancelled = useRef(false);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  const stop = useCallback(() => { ref.current?.stop(); }, []);
  const cancel = useCallback(() => { cancelled.current = true; ref.current?.abort(); }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) { setMessage(SPEECH_UNSUPPORTED); return; }
    if (ref.current) return;
    setMessage('');
    cancelled.current = false;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;
    rec.onstart = () => setListening(true);
    rec.onresult = e => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      if (!cancelled.current) onTextRef.current(transcript.trim());
    };
    rec.onerror = e => { if (e.error !== 'aborted') setMessage(speechErrorMessage(e.error)); };
    rec.onend = () => { ref.current = null; setListening(false); if (cancelled.current) onTextRef.current(''); };
    ref.current = rec;
    try { rec.start(); } catch { ref.current = null; setListening(false); setMessage(speechErrorMessage('')); }
  }, []);

  useEffect(() => () => { cancelled.current = true; ref.current?.abort(); ref.current = null; }, []);

  return { listening, message, supported: !!getCtor(), start, stop, cancel, clearMessage: () => setMessage('') };
}
