import clsx from 'clsx';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

/* Form controls in the player's idiom: a pill of cream/5 ground with a
   faint rim, the label red on focus, KyivType Sans inside. */
const CONTROL =
  'w-full border border-cream/[0.12] bg-cream/5 font-sans text-[13px] text-cream placeholder:text-cream/45 outline-none transition-colors focus-visible:border-accent/60 disabled:opacity-50';

export const Field = ({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div className={clsx('flex flex-col gap-2', className)}>
    <label htmlFor={htmlFor} className="type-label text-cream/60">
      {label}
    </label>
    {children}
    {hint && <span className="font-sans text-[11px] text-cream/45">{hint}</span>}
  </div>
);

export const TextInput = ({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={clsx(CONTROL, 'rounded-full px-5 py-[11px]', className)}
    {...rest}
  />
);

export const TextArea = ({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={clsx(CONTROL, 'rounded-2xl px-5 py-3 leading-relaxed', className)}
    {...rest}
  />
);

export const SelectInput = ({
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={clsx(CONTROL, 'rounded-full px-5 py-[11px]', className)}
    {...rest}
  />
);

/** The value of a field that isn't being edited, set the way an input is. */
export const ReadValue = ({
  children,
  mono,
  className,
}: {
  children: ReactNode;
  mono?: boolean;
  className?: string;
}) => (
  <span
    className={clsx(
      'block w-full rounded-full border border-cream/[0.08] px-5 py-[11px] text-[13px] text-cream/70',
      mono ? 'font-mono' : 'font-sans',
      className,
    )}
  >
    {children}
  </span>
);
