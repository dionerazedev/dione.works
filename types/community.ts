export type CommunityDevice = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface CommunityMessage {
  id: string;
  visitor_id: string;
  nickname: string;
  location: string | null;
  device_category: CommunityDevice;
  body: string;
  created_at: string;
  status: 'published' | 'hidden';
}

export interface PresenceVisitor {
  visitorId: string;
  onlineAt: string;
}
