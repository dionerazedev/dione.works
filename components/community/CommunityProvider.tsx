import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isCommunityConfigured } from '../../lib/supabase';
import { getVisitorId } from '../../lib/visitor';
import { PresenceContext, type PresenceStatus } from './community-context';
import type { PresenceVisitor } from '../../types/community';

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [visitorId] = useState(getVisitorId);
  const [status, setStatus] = useState<PresenceStatus>(isCommunityConfigured ? 'connecting' : 'unavailable');
  const [visitors, setVisitors] = useState<PresenceVisitor[]>([]);

  useEffect(() => {
    if (!isCommunityConfigured) return;
    let active = true;
    let client: Awaited<ReturnType<typeof getSupabaseClient>> = null;
    let channel: RealtimeChannel | null = null;
    const sync = () => {
      const state = channel?.presenceState<PresenceVisitor>() ?? {};
      const unique = new Map<string, PresenceVisitor>();
      Object.values(state).flat().forEach((entry) => unique.set(entry.visitorId, entry));
      if (active) setVisitors([...unique.values()]);
    };
    const connect = async () => {
      client = await getSupabaseClient();
      if (!active || !client) return;
      channel = client.channel('portfolio-presence', { config: { presence: { key: visitorId } } });
      channel.on('presence', { event: 'sync' }, sync).subscribe(async (next) => {
        if (!active) return;
        if (next === 'SUBSCRIBED') {
          await channel?.track({ visitorId, onlineAt: new Date().toISOString() });
          if (active) setStatus('connected');
        } else if (next === 'CHANNEL_ERROR' || next === 'TIMED_OUT') setStatus('error');
      });
    };
    void connect();
    return () => { active = false; if (channel && client) void client.removeChannel(channel); channel = null; };
  }, [visitorId]);

  const value = useMemo(() => ({ status, visitors, visitorId }), [status, visitors, visitorId]);
  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
};
