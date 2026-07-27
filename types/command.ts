export type CommandActionType = 'navigate' | 'route' | 'external' | 'download' | 'copy' | 'theme' | 'assistant';

export interface CommandDefinition {
  id: string;
  label: string;
  keywords: string[];
  actionType: CommandActionType;
  destination?: string;
  shortcut?: string;
}
