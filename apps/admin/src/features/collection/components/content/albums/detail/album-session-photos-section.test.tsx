import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlbumSessionPhotosSection } from './album-session-photos-section';

const upload = vi.fn();
const remove = vi.fn();
let photos = [
  { name: 'a.webp', url: 'https://media.example.com/x/img/session/a.webp' },
  { name: 'b.webp', url: 'https://media.example.com/x/img/session/b.webp' },
];

vi.mock('@/services/api', () => ({
  useSessionPhotos: () => ({ data: photos, isLoading: false }),
  useUploadSessionPhotos: () => ({ mutateAsync: upload, isPending: false }),
  useDeleteSessionPhoto: () => ({ mutateAsync: remove, isPending: false }),
}));

const file = (name: string, type: string) => new File(['x'], name, { type });

describe('AlbumSessionPhotosSection', () => {
  beforeEach(() => {
    upload.mockReset().mockResolvedValue({ added: [], failed: [] });
    remove.mockReset().mockResolvedValue(undefined);
    photos = [
      { name: 'a.webp', url: 'https://media.example.com/x/img/session/a.webp' },
      { name: 'b.webp', url: 'https://media.example.com/x/img/session/b.webp' },
    ];
  });

  it('stays away from albums without a media folder', () => {
    const { container } = render(
      <AlbumSessionPhotosSection albumId={1} folderSlug={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows each photo from its public address, with the count', () => {
    const { container } = render(
      <AlbumSessionPhotosSection albumId={1} folderSlug="x" />,
    );
    expect(screen.getByText('Session Photos (2)')).toBeInTheDocument();
    expect(
      [...container.querySelectorAll('img')].map((i) => i.getAttribute('src')),
    ).toEqual(photos.map((p) => p.url));
  });

  it('uploads the photos picked and names the files it skipped', async () => {
    const { container } = render(
      <AlbumSessionPhotosSection albumId={7} folderSlug="x" />,
    );
    const input = container.querySelector('input[type="file"]');
    if (!input) throw new Error('no file input');
    const good = file('studio.jpg', 'image/jpeg');
    fireEvent.change(input, {
      target: { files: [good, file('notes.txt', 'text/plain')] },
    });
    await waitFor(() =>
      expect(upload).toHaveBeenCalledWith({ albumId: 7, files: [good] }),
    );
    expect(
      await screen.findByText(/notes\.txt: not a photo/),
    ).toBeInTheDocument();
  });

  it('deletes a photo only on the second click', async () => {
    render(<AlbumSessionPhotosSection albumId={7} folderSlug="x" />);
    const [first] = screen.getAllByRole('button', { name: 'Delete photo' });
    fireEvent.click(first);
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }));
    await waitFor(() =>
      expect(remove).toHaveBeenCalledWith({ albumId: 7, name: 'a.webp' }),
    );
  });
});
