type FileSystemEntryLike = {
  isFile: boolean;
  isDirectory: boolean;
  file?: (callback: (file: File) => void) => void;
  createReader?: () => {
    readEntries: (callback: (entries: FileSystemEntryLike[]) => void) => void;
  };
};

async function readAllEntries(
  reader: ReturnType<NonNullable<FileSystemEntryLike['createReader']>>,
): Promise<FileSystemEntryLike[]> {
  const entries: FileSystemEntryLike[] = [];
  let batch: FileSystemEntryLike[];
  do {
    batch = await new Promise((resolve) => reader.readEntries(resolve));
    entries.push(...batch);
  } while (batch.length > 0);
  return entries;
}

async function collectFromEntry(entry: FileSystemEntryLike): Promise<File[]> {
  if (entry.isFile && entry.file) {
    const file = await new Promise<File>((resolve) => entry.file?.(resolve));
    return [file];
  }
  if (entry.isDirectory && entry.createReader) {
    const children = await readAllEntries(entry.createReader());
    const nested = await Promise.all(children.map(collectFromEntry));
    return nested.flat();
  }
  return [];
}

/** Resolves dropped files, recursing into whole folders where the browser supports it (Chromium). */
export async function collectDroppedFiles(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const items = Array.from(dataTransfer.items);
  const entries = items
    .map((item) =>
      'webkitGetAsEntry' in item
        ? (item.webkitGetAsEntry() as FileSystemEntryLike | null)
        : null,
    )
    .filter((entry): entry is FileSystemEntryLike => entry !== null);

  if (entries.length === 0) {
    return Array.from(dataTransfer.files);
  }

  const results = await Promise.all(entries.map(collectFromEntry));
  return results.flat();
}
