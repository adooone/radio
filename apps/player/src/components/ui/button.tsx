import clsx from 'clsx';
import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'ember'
    | 'secondary'
    | 'danger'
    | 'mute'
    | 'icon'
    | 'player'
    | 'toggle'
    | 'auto'
    | 'color';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      active = false,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={clsx(
          // Base styles
          'transition-colors duration-200 font-display uppercase',

          // Size variants
          {
            'px-2 py-1 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },

          // Variant styles
          {
            // Primary button (main actions)
            'bg-moss/60 hover:bg-moss/80 text-white font-medium border border-moss/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed':
              variant === 'primary',

            // Ember button (original primary style)
            'bg-ember shadow-md font-bold text-black rounded-xl hover:bg-ember/80 disabled:opacity-50 disabled:cursor-not-allowed':
              variant === 'ember',

            // Secondary button (cancel, etc.)
            'bg-neutral-900/40 hover:bg-neutral-900/60 text-white/60 hover:text-white/80 border border-neutral-700 rounded-lg':
              variant === 'secondary',

            // Danger button (destructive actions)
            'bg-red-900/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 border border-red-700/40 rounded-lg':
              variant === 'danger',

            // Mute button
            'bg-coal-relic/40 hover:bg-coal-relic/80 flex items-center gap-2 shadow-lg hover:shadow-xl tracking-wider rounded-full':
              variant === 'mute',

            // Icon button (small square buttons with icons)
            'w-8 h-8 flex items-center justify-center rounded-full bg-coal-relic/40 hover:bg-coal-relic/80 text-white/60 hover:text-white/80':
              variant === 'icon',

            // Player button (play/pause)
            'flex items-center justify-center opacity-70 hover:opacity-100':
              variant === 'player',

            // Toggle button
            'relative w-12 h-6 rounded-full border-2 cursor-pointer':
              variant === 'toggle',

            // Auto button (color picker auto mode)
            'w-full bg-moss/40 hover:bg-moss/60 text-white/90 hover:text-white border border-moss/20 rounded-lg':
              variant === 'auto',

            // Color button (color picker colors)
            'w-12 h-12 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center':
              variant === 'color',
          },

          // Active states
          {
            'opacity-50': variant === 'mute' && active,
            'bg-moss/40 border-moss/60': variant === 'toggle' && active,
            'bg-neutral-900/40 border-neutral-700':
              variant === 'toggle' && !active,
            'opacity-50 cursor-not-allowed':
              variant === 'toggle' && props.disabled,
            'bg-moss/60 border-moss/80 ring-2 ring-moss/40':
              variant === 'auto' && active,
            'border-white/50 ring-2 ring-moss/40':
              variant === 'color' && active,
          },

          className,
        )}
        ref={ref}
        {...props}
      >
        {variant === 'toggle' && (
          <div
            className={clsx(
              'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200',
              active && 'transform translate-x-6',
            )}
          />
        )}
        {variant !== 'toggle' && children}
      </button>
    );
  },
);

Button.displayName = 'Button';
