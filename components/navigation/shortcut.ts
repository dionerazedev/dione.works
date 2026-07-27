export const getCommandShortcut = () => {
  if (typeof navigator === 'undefined') return '⌘ K';
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
};
