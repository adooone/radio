import clsx from 'clsx';
import type { FC, InputHTMLAttributes } from 'react';
import styles from './checkbox.module.scss';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox: FC<CheckboxProps> = ({
  label,
  error,
  className,
  disabled,
  id,
  ...props
}) => {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={styles.container}>
      <div className={styles.checkboxWrapper}>
        <input
          id={checkboxId}
          type="checkbox"
          disabled={disabled}
          className={clsx(styles.checkbox, className)}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className={clsx(styles.label, disabled && styles.disabled)}
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};
