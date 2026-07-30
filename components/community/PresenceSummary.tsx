import { useCommunityPresence } from './community-context';

const avatarPattern = (id: string) => {
  let hash = 0;
  for (const char of id) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 6;
};

export const MonochromeAvatar = ({ id, label, size = 'small' }: { id: string; label: string; size?: 'small' | 'medium' }) => <span className={`mono-avatar is-${size} pattern-${avatarPattern(id)}`} role="img" aria-label={label}><i /><b /></span>;

export const PresenceSummary = ({ compact = false }: { compact?: boolean }) => {
  const { status, visitors } = useCommunityPresence();
  if (status === 'connecting') return <div className="presence-summary is-loading" role="status" aria-label="Connecting to live presence"><span /><span /><span /></div>;
  if (status !== 'connected') return <p className="presence-unavailable">Live presence unavailable</p>;
  const visible = visitors.slice(0, 3);
  const extra = Math.max(0, visitors.length - visible.length);
  return <div className={`presence-summary ${compact ? 'is-compact' : ''}`}><div className="presence-avatars" aria-hidden="true">{visible.map((visitor) => <MonochromeAvatar key={visitor.visitorId} id={visitor.visitorId} label="Active visitor" />)}{extra > 0 && <span className="presence-extra">+{extra}</span>}</div><p><strong>{visitors.length}</strong> {visitors.length === 1 ? 'person' : 'people'} viewing now</p></div>;
};
