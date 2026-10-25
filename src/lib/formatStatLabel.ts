/** animal_ken → Animal Ken */
export const formatStatLabel = (key: string) =>
  String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
