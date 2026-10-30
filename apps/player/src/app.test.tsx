import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '@/app';

describe('App', () => {
  it('shows the sign and says the air is quiet where nothing can play', async () => {
    // jsdom has neither MSE nor native HLS, so the engine lands on offline.
    render(<App />);
    expect(
      screen.getByRole('img', { name: 'Puget Sound — Vinyl Radio' }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/ефір тихий/)).toBeInTheDocument();
  });

  it('keeps the chat behind its nickname gate for a new listener', () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Твоє ім'я...")).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Хочу в чат' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Введи ім'я, щоб побачити чатік"),
    ).toBeInTheDocument();
  });
});
