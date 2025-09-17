const classic = `
  body {
    font-family: 'Source Han Serif', 'Noto Serif SC', serif;
    margin: 0 auto;
    max-width: 720px;
    line-height: 1.75;
    padding: 3rem 2rem 6rem;
    color: #1f1f24;
    background: #ffffff;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Source Sans Pro', 'Noto Sans SC', sans-serif;
    font-weight: 600;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    color: #101018;
  }
  h1 { font-size: 2.4rem; }
  h2 { font-size: 2rem; border-bottom: 1px solid #ececf1; padding-bottom: 0.5rem; }
  h3 { font-size: 1.6rem; }
  p, li { font-size: 1.05rem; }
  blockquote {
    border-left: 4px solid #4c6ef5;
    margin: 1.5rem 0;
    padding-left: 1rem;
    color: #34343d;
    background: rgba(76, 110, 245, 0.05);
  }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    background: #f3f4f6;
    padding: 0.2rem 0.4rem;
    border-radius: 0.35rem;
    font-size: 0.95rem;
  }
  pre code {
    display: block;
    padding: 1.25rem;
    overflow-x: auto;
    background: #101018;
    color: #f7f8ff;
    border-radius: 0.75rem;
  }
  table {
    border-collapse: collapse;
    margin: 1.5rem 0;
    width: 100%;
    font-size: 0.95rem;
  }
  table th, table td {
    border: 1px solid #d6d6de;
    padding: 0.75rem 1rem;
  }
  img {
    max-width: 100%;
    border-radius: 0.75rem;
  }
`;

const inkNight = `
  body {
    font-family: 'Source Sans Pro', 'Noto Sans SC', sans-serif;
    margin: 0 auto;
    max-width: 720px;
    line-height: 1.7;
    padding: 3rem 2rem 6rem;
    color: #f2f3fb;
    background: #0d1017;
  }
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    color: #ffffff;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
  }
  h2 {
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding-bottom: 0.5rem;
  }
  blockquote {
    border-left: 4px solid rgba(118, 143, 255, 0.9);
    margin: 1.5rem 0;
    padding-left: 1rem;
    color: rgba(231, 233, 255, 0.82);
    background: rgba(118, 143, 255, 0.15);
  }
  code {
    background: rgba(44, 52, 89, 0.9);
    color: #f6f7ff;
    padding: 0.2rem 0.4rem;
    border-radius: 0.35rem;
  }
  pre code {
    display: block;
    padding: 1.25rem;
    overflow-x: auto;
    background: #141826;
    border-radius: 0.75rem;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5rem 0;
    background: rgba(20, 24, 38, 0.9);
  }
  table th, table td {
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1rem;
  }
  img {
    max-width: 100%;
    border-radius: 0.75rem;
  }
`;

export const exportThemeStyles: Record<string, string> = {
  classic,
  'ink-night': inkNight,
};
