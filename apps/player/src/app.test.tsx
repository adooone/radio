import { App } from '@/app';
import { translate } from '@/i18n';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const t = (key: Parameters<typeof translate>[1]) => translate('en', key);

describe('App', () => {
  it('shows the sign and says the air is quiet where nothing can play', async () => {
    // jsdom has neither MSE nor native HLS, so the engine lands on offline.
    render(<App />);
    expect(
      screen.getByRole('img', { name: 'Puget Sound — Vinyl Radio' }),
    ).toBeInTheDocument();
    expect(await screen.findByText(t('status.offline'))).toBeInTheDocument();
  });

  it('keeps the chat behind its nickname gate for a new listener', () => {
    render(<App />);
    expect(
      screen.getByPlaceholderText(t('chat.nickname.placeholder')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('chat.nickname.join') }),
    ).toBeInTheDocument();
    expect(screen.getByText(t('chat.empty.noName'))).toBeInTheDocument();
  });

  it('sets the document title, description and lang from the locale', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);

    render(<App />);

    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe(t('meta.title'));
    expect(meta.getAttribute('content')).toBe(t('meta.description'));

    document.head.removeChild(meta);
  });
});
