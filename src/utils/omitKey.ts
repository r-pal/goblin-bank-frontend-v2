export function omitKey<V>(record: Readonly<Record<string, V>>, key: string): Record<string, V> {
  const next = { ...record };
  delete next[key];
  return next;
}
