import { useState, type ReactNode } from 'react';
import { Send } from 'lucide-react';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
export type ChatMessage = { role: 'owner' | 'guide'; text: string };
export function ChatTranscript({ messages, children, compact = false }: { messages: ChatMessage[]; children?: ReactNode; compact?: boolean }) {
  return <Conversation className={compact ? 'transcript transcript-compact' : 'transcript'} initial="instant" resize="instant"><ConversationContent className="transcript-content">{messages.map((message, i) => <Message key={i} from={message.role === 'owner' ? 'user' : 'assistant'}><MessageContent className={message.role === 'owner' ? 'chat-user-content' : 'chat-guide-content'}>{message.role === 'guide' ? <MessageResponse>{message.text}</MessageResponse> : message.text}</MessageContent></Message>)}{children}</ConversationContent><ConversationScrollButton aria-label="Scroll to latest message" title="Latest message"/></Conversation>;
}
export function ChatComposer({ label, onSend }: { label: string; onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  return <PromptInput className="chat-composer" onSubmit={message => { if (message.text.trim()) { onSend(message.text.trim()); setText(''); } }}><PromptInputTextarea aria-label={label} placeholder={label} value={text} onChange={e => setText(e.target.value)} maxLength={500}/><PromptInputFooter className="composer-footer"><PromptInputSubmit status="ready" disabled={!text.trim()} aria-label="Send message" title="Send message"><Send size={16}/></PromptInputSubmit></PromptInputFooter></PromptInput>;
}