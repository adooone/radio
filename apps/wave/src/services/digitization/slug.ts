function stripCombiningMarks(text: string): string {
  return Array.from(text)
    .filter((char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      return codePoint < 0x0300 || codePoint > 0x036f;
    })
    .join('');
}

export function slugify(text: string): string {
  return stripCombiningMarks(text.normalize('NFKD'))
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
