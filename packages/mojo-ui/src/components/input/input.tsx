import clsx from 'clsx';
import type { FC, InputHTMLAttributes, ReactNode } from 'react';
import {
  type Size,
  capitalizeFirst,
  getSizeTextClass,
} from '../../utils/style-helpers';
import styles from './input.module.scss';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: Size;
  label?: string;
  error?: string;
  rightElement?: ReactNode;
}

export const Input: FC<InputProps> = ({
  size = 'medium',
  label,
  error,
  rightElement,
  className,
  ...props
}) => {
  const inputId =
    props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={clsx(styles.wrapper, styles[size], error && styles.error)}
      >
        <div
          className={clsx(
            styles.baseLayer,
            styles[`baseLayer${capitalizeFirst(size)}`],
          )}
        />

        <div
          className={clsx(
            styles.field,
            styles[`field${capitalizeFirst(size)}`],
            props.disabled && styles.fieldDisabled,
          )}
        />

        <input
          id={inputId}
          className={clsx(
            styles.input,
            styles[size],
            rightElement && styles.inputWithRightElement,
            getSizeTextClass(size),
            className,
          )}
          {...props}
        />

        {rightElement && (
          <div className={styles.rightElement}>{rightElement}</div>
        )}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};
