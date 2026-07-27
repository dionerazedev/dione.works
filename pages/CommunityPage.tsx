import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Desktop, DeviceMobile, DeviceTablet, Flag, PaperPlaneTilt } from '@phosphor-icons/react';
import { getSupabaseClient, isCommunityConfigured } from '../lib/supabase';
import { getDeviceCategory } from '../lib/visitor';
import type { CommunityMessage } from '../types/community';
import { useCommunityPresence } from '../components/community/community-context';
import { MonochromeAvatar, PresenceSummary } from '../components/community/PresenceSummary';
import { useRouteMetadata } from '../components/ui/useRouteMetadata';

const NICKNAME_KEY = 'dione-community-nickname';
const LOCATION_KEY = 'dione-community-location';
const relativeTime = (date: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
const DeviceIcon = ({ device }: { device: CommunityMessage['device_category'] }) => device === 'mobile' ? <DeviceMobile size={12} /> : device === 'tablet' ? <DeviceTablet size={12} /> : <Desktop size={12} />;

export const CommunityPage = () => {
  const { visitorId } = useCommunityPresence();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable' | 'offline' | 'error'>(isCommunityConfigured ? 'loading' : 'unavailable');
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState(() => { try { return localStorage.getItem(NICKNAME_KEY) ?? ''; } catch { return ''; } });
  const [location, setLocation] = useState(() => { try { return localStorage.getItem(LOCATION_KEY) ?? ''; } catch { return ''; } });
  const [profileReady, setProfileReady] = useState(Boolean(nickname));
  const [body, setBody] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const [connectionVersion, setConnectionVersion] = useState(0);
  const lastSubmission = useRef<{ body: string; at: number }>({ body: '', at: 0 });

  useRouteMetadata({ title: 'Community | Dione Raze', description: 'A privacy-conscious realtime community chat for visitors to Dione Raze’s portfolio.', canonicalPath: '/community' });

  useEffect(() => {
    const offline = () => { setStatus('offline'); setConnectionVersion((version) => version + 1); };
    const online = () => {
      setStatus(isCommunityConfigured ? 'loading' : 'unavailable');
      setConnectionVersion((version) => version + 1);
    };
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    return () => { window.removeEventListener('offline', offline); window.removeEventListener('online', online); };
  }, []);

  useEffect(() => {
    if (!isCommunityConfigured || !navigator.onLine) return;
    let client: Awaited<ReturnType<typeof getSupabaseClient>> = null;
    let active = true;
    let channel: RealtimeChannel | null = null;
    const start = async () => {
      client = await getSupabaseClient();
      if (!client || !active) return;
      const result = await client.from('community_messages').select('*', { count: 'exact' }).eq('status', 'published').order('created_at', { ascending: false }).limit(100);
      if (!active) return;
      if (result.error) { setError('Community data could not be loaded. Check the Supabase migration and environment configuration.'); setStatus('error'); return; }
      const recentMessages = ((result.data ?? []) as CommunityMessage[]).reverse();
      setMessages(recentMessages);
      setMessageCount(result.count ?? recentMessages.length);
      channel = client.channel('community-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages' }, (payload) => {
        const message = payload.new as CommunityMessage;
        if (message.status === 'published') setMessages((current) => {
          if (current.some((item) => item.id === message.id)) return current;
          setMessageCount((count) => count + 1);
          return [...current, message].slice(-100);
        });
      }).subscribe((next) => {
        if (!active) return;
        if (next === 'SUBSCRIBED') setStatus('ready');
        if (next === 'CHANNEL_ERROR' || next === 'TIMED_OUT' || next === 'CLOSED') {
          setError('The message stream lost its realtime connection. Reconnect and try again.');
          setStatus(navigator.onLine ? 'error' : 'offline');
        }
      });
    };
    void start();
    return () => { active = false; if (channel && client) void client.removeChannel(channel); };
  }, [connectionVersion]);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    const cleanNickname = nickname.trim().replace(/\s+/g, ' ').slice(0, 32);
    const cleanLocation = location.trim().replace(/\s+/g, ' ').slice(0, 80);
    if (cleanNickname.length < 2) { setFeedback('Choose a nickname with at least 2 characters.'); return; }
    setNickname(cleanNickname); setLocation(cleanLocation); setProfileReady(true); setFeedback('');
    try { localStorage.setItem(NICKNAME_KEY, cleanNickname); if (cleanLocation) localStorage.setItem(LOCATION_KEY, cleanLocation); else localStorage.removeItem(LOCATION_KEY); } catch { /* Participation still works without persistence. */ }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (status !== 'ready') return;
    const client = await getSupabaseClient();
    if (!client) return;
    const cleanBody = body.trim().replace(/\s+/g, ' ').slice(0, 500);
    const now = Date.now();
    if (!cleanBody) { setFeedback('Write a message before sending.'); return; }
    if (now - lastSubmission.current.at < 5000) { setFeedback('Please wait a few seconds before sending another message.'); return; }
    if (cleanBody === lastSubmission.current.body && now - lastSubmission.current.at < 60000) { setFeedback('That message was already sent recently.'); return; }
    setSending(true); setFeedback('');
    const result = await client.from('community_messages').insert({ visitor_id: visitorId, nickname, location: location || null, device_category: getDeviceCategory(), body: cleanBody });
    setSending(false);
    if (result.error) { setFeedback(result.error.message.includes('rate') ? 'Please wait before sending another message.' : 'Message could not be sent. Try again.'); return; }
    lastSubmission.current = { body: cleanBody, at: now };
    setBody('');
  };

  const reportMessage = async (messageId: string) => {
    const client = await getSupabaseClient();
    if (!client) return;
    const result = await client.from('community_reports').insert({ message_id: messageId, reporter_visitor_id: visitorId, reason: 'user_report' });
    setFeedback(result.error ? 'The report could not be submitted.' : 'Report submitted for moderation.');
  };

  const connectionCopy = useMemo(() => status === 'ready' ? 'Connected' : status === 'loading' ? 'Connecting' : status === 'offline' ? 'Offline' : status === 'unavailable' ? 'Not configured' : 'Connection error', [status]);

  const hideLocation = () => {
    setLocation('');
    try { localStorage.removeItem(LOCATION_KEY); } catch { /* The active session still hides it. */ }
  };

  return <article className="community-page"><header className="community-header"><div><p className="page-label">Community / realtime</p><h1>community</h1><p>A small privacy-conscious space for portfolio visitors. Nicknames are local-first and broad location is optional.</p></div><div className="community-status"><span className={`connection-dot is-${status}`} />{connectionCopy}<strong>{status === 'ready' ? `${messageCount} ${messageCount === 1 ? 'message' : 'messages'}` : '— messages'}</strong></div></header><PresenceSummary />{status === 'unavailable' && <div className="community-state"><h2>Community temporarily unavailable</h2><p>Supabase credentials are not configured for this deployment. No viewer count or messages have been fabricated.</p><code>VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY</code></div>}{status === 'offline' && <div className="community-state"><h2>You are offline</h2><p>Reconnect to load the message stream and active presence.</p></div>}{status === 'error' && <div className="community-state"><h2>Community could not connect</h2><p>{error}</p></div>}{status === 'loading' && <div className="message-skeleton" aria-label="Loading messages">{[0, 1, 2].map((item) => <span key={item} />)}</div>}{status === 'ready' && <><section className="message-stream" aria-label="Community messages" aria-live="polite">{messages.length === 0 ? <div className="community-empty"><h2>No messages yet</h2><p>Be the first person to leave a useful note. The stream stays empty until a real visitor posts.</p></div> : messages.map((message) => <article key={message.id} className="community-message"><MonochromeAvatar id={message.visitor_id} label={`${message.nickname}'s generated avatar`} size="medium" /><div><header><strong>{message.nickname}</strong>{message.location && <span>{message.location}</span>}<span><DeviceIcon device={message.device_category} />{relativeTime(message.created_at)}</span></header><p>{message.body}</p><button type="button" onClick={() => void reportMessage(message.id)} aria-label={`Report message from ${message.nickname}`}><Flag size={11} />Report</button></div></article>)}</section>{!profileReady ? <form className="nickname-form" onSubmit={saveProfile}><div><p className="page-label">Before your first message</p><h2>Choose a nickname</h2><p>Location is optional. Use only a broad city and country if you want it shown.</p></div><label>Nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={32} autoComplete="nickname" required /></label><label>Broad location <span>optional</span><input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={80} placeholder="Davao City, Philippines" /></label><button type="submit" className="button button-primary">Continue</button></form> : <><div className="community-profile"><span>Posting as {nickname}{location ? ` · ${location}` : ''}</span><div><button type="button" onClick={() => setProfileReady(false)}>Edit profile</button>{location && <button type="button" onClick={hideLocation}>Hide location</button>}</div></div><form className="message-composer" onSubmit={(event) => void sendMessage(event)}><label htmlFor="community-message">Message</label><textarea id="community-message" value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} rows={3} placeholder="Share a thought or ask a respectful question…" /><div><span>{body.length}/500</span><button type="submit" disabled={sending || !body.trim()}>{sending ? 'Sending…' : <>Send <PaperPlaneTilt size={13} /></>}</button></div></form></>}</>}{feedback && <p className="community-feedback" role="status">{feedback}</p>}</article>;
};
