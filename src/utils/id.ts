export const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `cm-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
};
