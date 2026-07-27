import { createContext, useContext } from 'react';
import type { PresenceVisitor } from '../../types/community';

export type PresenceStatus = 'connecting' | 'connected' | 'unavailable' | 'error';
export interface PresenceValue { status: PresenceStatus; visitors: PresenceVisitor[]; visitorId: string; }
export const PresenceContext = createContext<PresenceValue | null>(null);
export const useCommunityPresence = () => {
  const context = useContext(PresenceContext);
  if (!context) throw new Error('useCommunityPresence must be used within CommunityProvider.');
  return context;
};
