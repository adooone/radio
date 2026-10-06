import { SIDE_FILENAME_PATTERN } from '../use-upload-manager';

const DRAFT_SLUG_PATTERN = /^[a-z0-9-]+_[a-z0-9-]+$/;

export type RadioFolderFile = {
  name: string;
  handle: FileSystemFileHandle;
};

export type RadioFolder = {
  slug: string;
  files: RadioFolderFile[];
};

export async function scanRadioFolder(
  root: FileSystemDirectoryHandle,
): Promise<RadioFolder[]> {
  const folders: RadioFolder[] = [];

  for await (const entry of root.values()) {
    if (entry.kind !== 'directory' || !DRAFT_SLUG_PATTERN.test(entry.name)) {
      continue;
    }

    const files: RadioFolderFile[] = [];
    for await (const child of (entry as FileSystemDirectoryHandle).values()) {
      if (child.kind === 'file' && SIDE_FILENAME_PATTERN.test(child.name)) {
        files.push({ name: child.name, handle: child as FileSystemFileHandle });
      }
    }

    if (files.length > 0) {
      folders.push({ slug: entry.name, files });
    }
  }

  return folders.sort((a, b) => a.slug.localeCompare(b.slug));
}
