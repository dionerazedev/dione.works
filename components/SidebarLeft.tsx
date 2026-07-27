import { NavigationPanel } from './navigation/NavigationPanel';

export const SidebarLeft = ({ currentTime }: { currentTime: string }) => <aside className="desktop-sidebar" aria-label="Portfolio sidebar"><NavigationPanel currentTime={currentTime} /></aside>;
