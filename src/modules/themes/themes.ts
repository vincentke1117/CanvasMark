export type EditorThemeToken = 'aurora' | 'noir';
export type ExportThemeToken = 'classic' | 'ink-night';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
}

export const editorThemes: ThemeDefinition[] = [
  {
    id: 'aurora',
    name: '极光',
    description: '浅色界面，适合日常创作，强调层级和留白。',
  },
  {
    id: 'noir',
    name: '夜航',
    description: '深色界面，降低眩光，适用于夜间或暗光环境。',
  },
];

export const exportThemes: ThemeDefinition[] = [
  {
    id: 'classic',
    name: '经典风',
    description: '衬线标题、无衬线正文，适合博客与报告输出。',
  },
  {
    id: 'ink-night',
    name: '墨夜',
    description: '深色主题，针对暗色网页与投影场景优化。',
  },
];
